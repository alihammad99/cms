import { Elysia, t } from 'elysia'
import { getPlatformDb, createStoreClient, seedStoreDb } from '@manzoom/db'
import { generateId } from '../lib/id'
import { requireOwner } from '../middleware/auth'
import { provisionStoreDb } from '../services/turso-provision'
import { ConflictError, NotFoundError } from '../lib/errors'
import { hashPassword } from '../lib/password'

export const storeRoutes = new Elysia({ prefix: '/stores' })
  .use(requireOwner())
  .get('/', async ({ owner }) => {
    const db = getPlatformDb()
    const result = await db.execute({
      sql: 'SELECT id, name, slug, plan, created_at FROM stores WHERE owner_id = ? ORDER BY created_at DESC',
      args: [owner.owner_id],
    })
    return { stores: result.rows }
  })
  .post(
    '/',
    async ({ body, owner }) => {
      const db = getPlatformDb()

      const existing = await db.execute({
        sql: 'SELECT id FROM stores WHERE slug = ?',
        args: [body.slug],
      })
      if (existing.rows.length) throw new ConflictError('Store slug already taken')

      const { url, token } = await provisionStoreDb(body.slug)

      const id = generateId()
      await db.execute({
        sql: 'INSERT INTO stores (id, owner_id, name, slug, turso_db_url, turso_auth_token) VALUES (?, ?, ?, ?, ?, ?)',
        args: [id, owner.owner_id, body.name, body.slug, url, token],
      })

      const storeClient = createStoreClient(url, token)
      await seedStoreDb(storeClient, id)

      // Create the owner as the first admin
      const adminId = generateId()
      const hashed = await hashPassword(body.admin_password)
      await storeClient.execute({
        sql: 'INSERT INTO admins (id, store_id, name, email, hashed_password, role) VALUES (?, ?, ?, ?, ?, ?)',
        args: [adminId, id, owner.email, owner.email, hashed, 'owner'],
      })

      return { store: { id, name: body.name, slug: body.slug } }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 2 }),
        slug: t.String({ minLength: 2, maxLength: 50, pattern: '^[a-z0-9-]+$' }),
        admin_password: t.String({ minLength: 8 }),
      }),
    }
  )
  .get('/:storeId', async ({ params, owner }) => {
    const db = getPlatformDb()
    const result = await db.execute({
      sql: 'SELECT id, name, slug, plan, created_at FROM stores WHERE id = ? AND owner_id = ?',
      args: [params.storeId, owner.owner_id],
    })
    if (!result.rows.length) throw new NotFoundError('Store')
    return { store: result.rows[0] }
  })
