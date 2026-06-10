import { Elysia, t } from 'elysia'
import { withStore } from '../middleware/store'
import { jwtPlugin } from '../middleware/auth'
import { generateId } from '../lib/id'
import { toSlug } from '../lib/slug'
import { broadcastChange } from '../lib/sse'
import { NotFoundError, ForbiddenError, UnauthorizedError } from '../lib/errors'
import type { AnyJWT, AdminJWT, CustomerJWT } from '@manzoom/types'
import type { PermissionLevel } from '@manzoom/types'
import type { Client } from '@libsql/client'
import { ROLE_HIERARCHY, type Role } from '@manzoom/config'

async function getPermission(
  storeDb: Client,
  collection: string,
  action: string
): Promise<PermissionLevel> {
  const result = await storeDb.execute({
    sql: 'SELECT level FROM _permissions WHERE collection = ? AND action = ?',
    args: [collection, action],
  })
  return ((result.rows[0] as any)?.level ?? 'owner') as PermissionLevel
}

async function checkPermission(
  level: PermissionLevel,
  jwt: ReturnType<typeof import('@elysiajs/jwt').jwt>,
  headers: Record<string, string | undefined>
): Promise<AnyJWT | null> {
  if (level === 'public') return null

  const token = headers.authorization?.replace('Bearer ', '')
  if (!token) throw new UnauthorizedError()

  const payload = (await (jwt as any).verify(token)) as AnyJWT | false
  if (!payload) throw new UnauthorizedError()

  if (level === 'authenticated') return payload
  if (level === 'customer' && payload.type === 'customer') return payload
  if (level === 'customer' && payload.type === 'admin') return payload

  // Platform owners bypass admin role checks
  if (payload.type === 'owner') return payload

  if (payload.type !== 'admin') throw new ForbiddenError()
  const admin = payload as AdminJWT

  const requiredRank: Record<PermissionLevel, number> = {
    public: 0,
    authenticated: 0,
    customer: 0,
    admin: ROLE_HIERARCHY['admin'],
    owner: ROLE_HIERARCHY['owner'],
  }

  if (ROLE_HIERARCHY[admin.role as Role] < requiredRank[level]) throw new ForbiddenError()

  return payload
}

async function getCollectionInfo(storeDb: Client, name: string) {
  const result = await storeDb.execute({
    sql: 'SELECT * FROM _collections WHERE name = ?',
    args: [name],
  })
  return result.rows[0] ?? null
}

export const collectionRoutes = new Elysia({ prefix: '/:storeSlug/collections' })
  .use(withStore())
  .use(jwtPlugin)

  // LIST
  .get(
    '/:collection',
    async ({ params, query, store, storeDb, jwt, headers }) => {
      const col = await getCollectionInfo(storeDb, params.collection)
      if (!col) throw new NotFoundError('Collection')

      const level = await getPermission(storeDb, params.collection, 'list')
      await checkPermission(level, jwt as any, headers)

      const page = parseInt(query.page ?? '1')
      const perPage = Math.min(parseInt(query.per_page ?? '20'), 100)
      const offset = (page - 1) * perPage
      const order = query.order === 'asc' ? 'ASC' : 'DESC'
      // check which columns exist so we can pick a valid default sort
      const colsResult = await storeDb.execute(`PRAGMA table_info(${params.collection})`)
      const colNames = colsResult.rows.map((r: any) => r.name as string)
      const defaultSort = colNames.includes('created_at') ? 'created_at' : 'id'
      const sortBy = query.sort && colNames.includes(query.sort) ? query.sort : defaultSort

      let whereClause = ''
      const args: unknown[] = []

      if (query.search && query.search_field) {
        whereClause = `WHERE ${query.search_field} LIKE ?`
        args.push(`%${query.search}%`)
      }

      const countResult = await storeDb.execute({
        sql: `SELECT COUNT(*) as total FROM ${params.collection} ${whereClause}`,
        args,
      })
      const total = (countResult.rows[0] as any).total as number

      const rows = await storeDb.execute({
        sql: `SELECT * FROM ${params.collection} ${whereClause} ORDER BY ${sortBy} ${order} LIMIT ? OFFSET ?`,
        args: [...args, perPage, offset],
      })

      return {
        data: rows.rows,
        total,
        page,
        per_page: perPage,
        total_pages: Math.ceil(total / perPage),
      }
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        per_page: t.Optional(t.String()),
        sort: t.Optional(t.String()),
        order: t.Optional(t.String()),
        search: t.Optional(t.String()),
        search_field: t.Optional(t.String()),
      }),
    }
  )

  // READ SINGLE
  .get('/:collection/:id', async ({ params, store, storeDb, jwt, headers }) => {
    const col = await getCollectionInfo(storeDb, params.collection)
    if (!col) throw new NotFoundError('Collection')

    const level = await getPermission(storeDb, params.collection, 'read')
    await checkPermission(level, jwt as any, headers)

    const result = await storeDb.execute({
      sql: `SELECT * FROM ${params.collection} WHERE id = ?`,
      args: [params.id],
    })
    if (!result.rows.length) throw new NotFoundError(params.collection)

    return { data: result.rows[0] }
  })

  // CREATE
  .post(
    '/:collection',
    async ({ params, body, store, storeDb, jwt, headers }) => {
      const col = await getCollectionInfo(storeDb, params.collection)
      if (!col) throw new NotFoundError('Collection')

      const level = await getPermission(storeDb, params.collection, 'create')
      await checkPermission(level, jwt as any, headers)

      const id = generateId()
      const now = new Date().toISOString()

      const record: Record<string, unknown> = {
        id,
        ...(body as Record<string, unknown>),
        created_at: now,
      }

      if (params.collection === 'products' && record.name && !record.slug) {
        record.slug = toSlug(record.name as string)
        record.updated_at = now
      }
      if (params.collection === 'categories' && record.name && !record.slug) {
        record.slug = toSlug(record.name as string)
      }

      const columns = Object.keys(record)
      const placeholders = columns.map(() => '?').join(', ')
      const values = Object.values(record)

      await storeDb.execute({
        sql: `INSERT INTO ${params.collection} (${columns.join(', ')}) VALUES (${placeholders})`,
        args: values,
      })

      if ((col as any).realtime) {
        broadcastChange(store.id, params.collection, 'create', id)
      }

      return { data: record }
    },
    { body: t.Record(t.String(), t.Any()) }
  )

  // UPDATE
  .patch(
    '/:collection/:id',
    async ({ params, body, store, storeDb, jwt, headers }) => {
      const col = await getCollectionInfo(storeDb, params.collection)
      if (!col) throw new NotFoundError('Collection')

      const level = await getPermission(storeDb, params.collection, 'update')
      await checkPermission(level, jwt as any, headers)

      const existing = await storeDb.execute({
        sql: `SELECT id FROM ${params.collection} WHERE id = ?`,
        args: [params.id],
      })
      if (!existing.rows.length) throw new NotFoundError(params.collection)

      const updates = body as Record<string, unknown>
      if (params.collection === 'products') updates.updated_at = new Date().toISOString()

      const sets = Object.keys(updates).map((k) => `${k} = ?`).join(', ')
      const values = [...Object.values(updates), params.id]

      await storeDb.execute({
        sql: `UPDATE ${params.collection} SET ${sets} WHERE id = ?`,
        args: values,
      })

      if ((col as any).realtime) {
        broadcastChange(store.id, params.collection, 'update', params.id)
      }

      return { data: { id: params.id, ...updates } }
    },
    { body: t.Record(t.String(), t.Any()) }
  )

  // DELETE
  .delete('/:collection/:id', async ({ params, store, storeDb, jwt, headers }) => {
    const col = await getCollectionInfo(storeDb, params.collection)
    if (!col) throw new NotFoundError('Collection')

    const level = await getPermission(storeDb, params.collection, 'delete')
    await checkPermission(level, jwt as any, headers)

    const existing = await storeDb.execute({
      sql: `SELECT id FROM ${params.collection} WHERE id = ?`,
      args: [params.id],
    })
    if (!existing.rows.length) throw new NotFoundError(params.collection)

    await storeDb.execute({
      sql: `DELETE FROM ${params.collection} WHERE id = ?`,
      args: [params.id],
    })

    if ((col as any).realtime) {
      broadcastChange(store.id, params.collection, 'delete', params.id)
    }

    return { ok: true }
  })
