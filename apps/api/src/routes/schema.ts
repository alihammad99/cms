import { Elysia, t } from 'elysia'
import { withStore } from '../middleware/store'
import { requireAdmin } from '../middleware/auth'
import { generateId } from '../lib/id'
import { NotFoundError, ValidationError } from '../lib/errors'
import { SYSTEM_FIELDS, SYSTEM_COLLECTION_NAMES } from '@manzoom/config'
import type { Client } from '@libsql/client'

const SQLITE_TYPES: Record<string, string> = {
  text: 'TEXT',
  long_text: 'TEXT',
  number: 'REAL',
  integer: 'INTEGER',
  boolean: 'INTEGER',
  enum: 'TEXT',
  json: 'TEXT',
  timestamp: 'TEXT',
  relation: 'TEXT',
  media: 'TEXT',
}

async function getCollection(storeDb: Client, name: string) {
  const result = await storeDb.execute({
    sql: 'SELECT * FROM _collections WHERE name = ?',
    args: [name],
  })
  return result.rows[0] ?? null
}

export const schemaRoutes = new Elysia({ prefix: '/:storeSlug/schema' })
  .use(withStore())
  .use(requireAdmin('admin'))

  // List all collections with their fields
  .get('/', async ({ storeDb }) => {
    const collections = await storeDb.execute('SELECT * FROM _collections ORDER BY system DESC, name ASC')
    const fields = await storeDb.execute('SELECT * FROM _fields ORDER BY collection, sort_order ASC')

    return {
      collections: collections.rows,
      custom_fields: fields.rows,
      system_fields: SYSTEM_FIELDS,
    }
  })

  // Get a single collection schema
  .get('/:collection', async ({ params, storeDb }) => {
    const col = await getCollection(storeDb, params.collection)
    if (!col) throw new NotFoundError('Collection')

    const isSystem = SYSTEM_COLLECTION_NAMES.includes(params.collection)
    const systemFields = isSystem ? (SYSTEM_FIELDS[params.collection] ?? []) : []

    const customFields = await storeDb.execute({
      sql: 'SELECT * FROM _fields WHERE collection = ? ORDER BY sort_order ASC',
      args: [params.collection],
    })

    return { collection: col, system_fields: systemFields, custom_fields: customFields.rows }
  })

  // Create a new collection
  .post(
    '/',
    async ({ body, storeDb }) => {
      const existing = await getCollection(storeDb, body.name)
      if (existing) throw new ValidationError('Collection already exists')

      const id = generateId()
      await storeDb.execute({
        sql: 'INSERT INTO _collections (id, name, label, label_ar, system, realtime) VALUES (?, ?, ?, ?, 0, ?)',
        args: [id, body.name, body.label, body.label_ar, body.realtime ? 1 : 0],
      })

      await storeDb.execute(
        `CREATE TABLE IF NOT EXISTS ${body.name} (id TEXT PRIMARY KEY, created_at TEXT NOT NULL DEFAULT (datetime('now')))`
      )

      return { collection: { id, name: body.name, label: body.label, label_ar: body.label_ar } }
    },
    {
      body: t.Object({
        name: t.String({ pattern: '^[a-z_][a-z0-9_]*$' }),
        label: t.String({ minLength: 1 }),
        label_ar: t.String({ minLength: 1 }),
        realtime: t.Optional(t.Boolean()),
      }),
    }
  )

  // Update collection (label, realtime toggle)
  .patch(
    '/:collection',
    async ({ params, body, storeDb }) => {
      const col = await getCollection(storeDb, params.collection)
      if (!col) throw new NotFoundError('Collection')

      const updates: string[] = []
      const args: unknown[] = []

      if (body.label !== undefined) { updates.push('label = ?'); args.push(body.label) }
      if (body.label_ar !== undefined) { updates.push('label_ar = ?'); args.push(body.label_ar) }
      if (body.realtime !== undefined) { updates.push('realtime = ?'); args.push(body.realtime ? 1 : 0) }

      if (updates.length) {
        args.push(params.collection)
        await storeDb.execute({
          sql: `UPDATE _collections SET ${updates.join(', ')} WHERE name = ?`,
          args,
        })
      }

      return { ok: true }
    },
    {
      body: t.Object({
        label: t.Optional(t.String()),
        label_ar: t.Optional(t.String()),
        realtime: t.Optional(t.Boolean()),
      }),
    }
  )

  // Add a custom field to a collection
  .post(
    '/:collection/fields',
    async ({ params, body, storeDb }) => {
      const col = await getCollection(storeDb, params.collection)
      if (!col) throw new NotFoundError('Collection')

      const isSystem = SYSTEM_COLLECTION_NAMES.includes(params.collection)
      if (isSystem) {
        const sysFields = SYSTEM_FIELDS[params.collection] ?? []
        if (sysFields.some((f) => f.field === body.field)) {
          throw new ValidationError(`Field '${body.field}' is a system field`)
        }
      }

      const id = generateId()
      const sortResult = await storeDb.execute({
        sql: 'SELECT COALESCE(MAX(sort_order), 0) + 1 as next FROM _fields WHERE collection = ?',
        args: [params.collection],
      })
      const sortOrder = (sortResult.rows[0] as any).next ?? 1

      await storeDb.execute({
        sql: `INSERT INTO _fields (id, collection, field, type, required, default_value, label, label_ar, enum_options, relation_collection, sort_order)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          params.collection,
          body.field,
          body.type,
          body.required ? 1 : 0,
          body.default_value ?? null,
          body.label,
          body.label_ar,
          body.enum_options ?? null,
          body.relation_collection ?? null,
          sortOrder,
        ],
      })

      const sqlType = SQLITE_TYPES[body.type] ?? 'TEXT'
      const defaultClause = body.default_value ? ` DEFAULT '${body.default_value}'` : ''
      const notNull = body.required ? ' NOT NULL' : ''
      await storeDb.execute(
        `ALTER TABLE ${params.collection} ADD COLUMN ${body.field} ${sqlType}${notNull}${defaultClause}`
      )

      return { field: { id, collection: params.collection, field: body.field, type: body.type } }
    },
    {
      body: t.Object({
        field: t.String({ pattern: '^[a-z_][a-z0-9_]*$' }),
        type: t.Union([
          t.Literal('text'), t.Literal('long_text'), t.Literal('number'),
          t.Literal('integer'), t.Literal('boolean'), t.Literal('enum'),
          t.Literal('json'), t.Literal('timestamp'), t.Literal('relation'), t.Literal('media'),
        ]),
        required: t.Optional(t.Boolean()),
        default_value: t.Optional(t.Nullable(t.String())),
        label: t.String({ minLength: 1 }),
        label_ar: t.String({ minLength: 1 }),
        enum_options: t.Optional(t.Nullable(t.String())),
        relation_collection: t.Optional(t.Nullable(t.String())),
      }),
    }
  )

  // Delete a custom field
  .delete('/:collection/fields/:field', async ({ params, storeDb }) => {
    const isSystem = SYSTEM_COLLECTION_NAMES.includes(params.collection)
    if (isSystem) {
      const sysFields = SYSTEM_FIELDS[params.collection] ?? []
      if (sysFields.some((f) => f.field === params.field)) {
        throw new ValidationError(`Cannot delete system field '${params.field}'`)
      }
    }

    await storeDb.execute({
      sql: 'DELETE FROM _fields WHERE collection = ? AND field = ?',
      args: [params.collection, params.field],
    })

    // SQLite doesn't support DROP COLUMN in older versions, but libSQL/Turso does
    try {
      await storeDb.execute(`ALTER TABLE ${params.collection} DROP COLUMN ${params.field}`)
    } catch {
      // Silently ignore if column drop not supported — metadata is removed
    }

    return { ok: true }
  })
