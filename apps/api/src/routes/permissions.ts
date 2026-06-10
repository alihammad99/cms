import { Elysia, t } from 'elysia'
import { withStore } from '../middleware/store'
import { requireAdmin } from '../middleware/auth'
import { generateId } from '../lib/id'

const ACTIONS = ['list', 'read', 'create', 'update', 'delete'] as const
const LEVELS = ['public', 'authenticated', 'customer', 'admin', 'owner'] as const

export const permissionsRoutes = new Elysia({ prefix: '/:storeSlug/permissions' })
  .use(withStore())
  .use(requireAdmin('owner'))

  .get('/', async ({ storeDb }) => {
    const result = await storeDb.execute('SELECT * FROM _permissions ORDER BY collection, action')
    return { permissions: result.rows }
  })

  .put(
    '/:collection/:action',
    async ({ params, body, storeDb }) => {
      const id = `${params.collection}_${params.action}`
      await storeDb.execute({
        sql: `INSERT INTO _permissions (id, collection, action, level) VALUES (?, ?, ?, ?)
              ON CONFLICT(collection, action) DO UPDATE SET level = excluded.level`,
        args: [id, params.collection, params.action, body.level],
      })
      return { ok: true }
    },
    {
      body: t.Object({
        level: t.Union(LEVELS.map((l) => t.Literal(l)) as [ReturnType<typeof t.Literal>, ...ReturnType<typeof t.Literal>[]]),
      }),
    }
  )
