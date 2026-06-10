import { Elysia, t } from 'elysia'
import { withStore } from '../middleware/store'
import { jwtPlugin } from '../middleware/auth'
import { verifyPassword } from '../lib/password'
import { generateId } from '../lib/id'
import { UnauthorizedError } from '../lib/errors'

const OTP_EXPIRY_MINUTES = 5

export const storeAuthRoutes = new Elysia({ prefix: '/:storeSlug/auth' })
  .use(withStore())
  .use(jwtPlugin)
  .post(
    '/admin/login',
    async ({ body, storeDb, store, jwt }) => {
      const result = await storeDb.execute({
        sql: 'SELECT * FROM admins WHERE email = ?',
        args: [body.email],
      })
      if (!result.rows.length) throw new UnauthorizedError('Invalid credentials')

      const admin = result.rows[0] as any
      const valid = await verifyPassword(body.password, admin.hashed_password as string)
      if (!valid) throw new UnauthorizedError('Invalid credentials')

      const token = await jwt.sign({
        admin_id: admin.id,
        store_id: store.id,
        role: admin.role,
        type: 'admin',
      })

      return {
        token,
        admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
        store: { id: store.id, name: store.name, slug: store.slug },
      }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String(),
      }),
    }
  )
  .post(
    '/otp/request',
    async ({ body, storeDb }) => {
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      const expires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString()

      const existing = await storeDb.execute({
        sql: 'SELECT id FROM customers WHERE phone = ?',
        args: [body.phone],
      })

      if (existing.rows.length) {
        await storeDb.execute({
          sql: 'UPDATE customers SET otp_code = ?, otp_expires_at = ? WHERE phone = ?',
          args: [code, expires, body.phone],
        })
      } else {
        const id = generateId()
        await storeDb.execute({
          sql: 'INSERT INTO customers (id, phone, otp_code, otp_expires_at) VALUES (?, ?, ?, ?)',
          args: [id, body.phone, code, expires],
        })
      }

      // TODO: send via Unifonic
      console.log(`OTP for ${body.phone}: ${code}`)

      return { message: 'OTP sent' }
    },
    { body: t.Object({ phone: t.String() }) }
  )
  .post(
    '/otp/verify',
    async ({ body, storeDb, store, jwt }) => {
      const result = await storeDb.execute({
        sql: 'SELECT * FROM customers WHERE phone = ? AND otp_code = ?',
        args: [body.phone, body.code],
      })
      if (!result.rows.length) throw new UnauthorizedError('Invalid OTP')

      const customer = result.rows[0] as any
      const expires = new Date(customer.otp_expires_at as string)
      if (expires < new Date()) throw new UnauthorizedError('OTP expired')

      await storeDb.execute({
        sql: 'UPDATE customers SET otp_code = NULL, otp_expires_at = NULL WHERE id = ?',
        args: [customer.id],
      })

      const token = await jwt.sign({
        customer_id: customer.id,
        store_id: store.id,
        type: 'customer',
      })

      return { token, customer: { id: customer.id, phone: customer.phone } }
    },
    {
      body: t.Object({
        phone: t.String(),
        code: t.String({ minLength: 6, maxLength: 6 }),
      }),
    }
  )
