import { Elysia, t } from 'elysia'
import { withStore } from '../middleware/store'
import { requireAdmin } from '../middleware/auth'
import { getPlatformDb } from '@manzoom/db'
import { generateId } from '../lib/id'
import { hashPassword } from '../lib/password'
import { ROLES } from '@manzoom/config'

export const teamRoutes = new Elysia({ prefix: '/:storeSlug/team' })
  .use(withStore())
  .use(requireAdmin('owner'))

  .get('/', async ({ storeDb }) => {
    const result = await storeDb.execute(
      'SELECT id, name, email, role, created_at FROM admins ORDER BY created_at ASC'
    )
    return { members: result.rows }
  })

  .post(
    '/invite',
    async ({ body, store, storeDb }) => {
      const existing = await storeDb.execute({
        sql: 'SELECT id FROM admins WHERE email = ?',
        args: [body.email],
      })
      if (existing.rows.length) return { message: 'Already a member' }

      const id = generateId()
      const tempPassword = generateId() // They'll reset
      const hashed = await hashPassword(tempPassword)

      await storeDb.execute({
        sql: 'INSERT INTO admins (id, store_id, name, email, hashed_password, role) VALUES (?, ?, ?, ?, ?, ?)',
        args: [id, store.id, body.email.split('@')[0], body.email, hashed, body.role],
      })

      // TODO: send invite email with tempPassword
      console.log(`Invite ${body.email} to ${store.slug} as ${body.role}, temp pass: ${tempPassword}`)

      return { member: { id, email: body.email, role: body.role } }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        role: t.Union(ROLES.map((r) => t.Literal(r)) as [ReturnType<typeof t.Literal>, ...ReturnType<typeof t.Literal>[]]),
      }),
    }
  )

  .patch(
    '/:memberId/role',
    async ({ params, body, storeDb }) => {
      await storeDb.execute({
        sql: 'UPDATE admins SET role = ? WHERE id = ?',
        args: [body.role, params.memberId],
      })
      return { ok: true }
    },
    {
      body: t.Object({
        role: t.Union(ROLES.map((r) => t.Literal(r)) as [ReturnType<typeof t.Literal>, ...ReturnType<typeof t.Literal>[]]),
      }),
    }
  )

  .delete('/:memberId', async ({ params, storeDb }) => {
    await storeDb.execute({
      sql: 'DELETE FROM admins WHERE id = ?',
      args: [params.memberId],
    })
    return { ok: true }
  })
