import { Elysia, t } from 'elysia'
import { withStore } from '../middleware/store'
import { requireAdmin } from '../middleware/auth'

export const settingsRoutes = new Elysia({ prefix: '/:storeSlug/settings' })
  .use(withStore())
  .use(requireAdmin('owner'))

  .get('/', async ({ storeDb }) => {
    const result = await storeDb.execute('SELECT key, value FROM settings')
    const settings: Record<string, string> = {}
    for (const row of result.rows) {
      settings[(row as any).key] = (row as any).value
    }
    return { settings }
  })

  .patch(
    '/',
    async ({ body, storeDb }) => {
      const entries = Object.entries(body as Record<string, string>)
      for (const [key, value] of entries) {
        await storeDb.execute({
          sql: `INSERT INTO settings (key, value) VALUES (?, ?)
                ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
          args: [key, String(value)],
        })
      }
      return { ok: true }
    },
    { body: t.Record(t.String(), t.Any()) }
  )
