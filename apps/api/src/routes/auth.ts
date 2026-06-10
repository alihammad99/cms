import { Elysia, t } from 'elysia'
import { getPlatformDb } from '@manzoom/db'
import { hashPassword, verifyPassword } from '../lib/password'
import { generateId } from '../lib/id'
import { jwtPlugin } from '../middleware/auth'
import { ConflictError, UnauthorizedError } from '../lib/errors'

export const authRoutes = new Elysia({ prefix: '/auth' })
  .use(jwtPlugin)
  .post(
    '/signup',
    async ({ body, jwt }) => {
      const db = getPlatformDb()

      const existing = await db.execute({
        sql: 'SELECT id FROM owners WHERE email = ?',
        args: [body.email],
      })
      if (existing.rows.length) throw new ConflictError('Email already registered')

      const id = generateId()
      const hashed_password = await hashPassword(body.password)

      await db.execute({
        sql: 'INSERT INTO owners (id, name, email, hashed_password) VALUES (?, ?, ?, ?)',
        args: [id, body.name, body.email, hashed_password],
      })

      const token = await jwt.sign({
        owner_id: id,
        email: body.email,
        plan: 'free',
        type: 'owner',
      })

      return { token, owner: { id, name: body.name, email: body.email, plan: 'free' } }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 2 }),
        email: t.String({ format: 'email' }),
        password: t.String({ minLength: 8 }),
      }),
    }
  )
  .post(
    '/login',
    async ({ body, jwt }) => {
      const db = getPlatformDb()

      const result = await db.execute({
        sql: 'SELECT * FROM owners WHERE email = ?',
        args: [body.email],
      })
      if (!result.rows.length) throw new UnauthorizedError('Invalid credentials')

      const owner = result.rows[0] as any
      const valid = await verifyPassword(body.password, owner.hashed_password as string)
      if (!valid) throw new UnauthorizedError('Invalid credentials')

      const token = await jwt.sign({
        owner_id: owner.id,
        email: owner.email,
        plan: owner.plan,
        type: 'owner',
      })

      return {
        token,
        owner: {
          id: owner.id,
          name: owner.name,
          email: owner.email,
          plan: owner.plan,
        },
      }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String(),
      }),
    }
  )
