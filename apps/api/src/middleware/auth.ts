import { Elysia } from 'elysia'
import { jwt } from '@elysiajs/jwt'
import { env } from '../env'
import { UnauthorizedError, ForbiddenError } from '../lib/errors'
import type { AnyJWT, AdminJWT, OwnerJWT } from '@manzoom/types'
import { hasRole, type Role } from '@manzoom/config'

export const jwtPlugin = new Elysia({ name: 'jwt' }).use(
  jwt({ name: 'jwt', secret: env.JWT_SECRET })
)

export function requireOwner() {
  return new Elysia({ name: 'require-owner' })
    .use(jwtPlugin)
    .derive({ as: 'scoped' }, async ({ jwt, headers }) => {
      const token = headers.authorization?.replace('Bearer ', '')
      if (!token) throw new UnauthorizedError()
      const payload = (await jwt.verify(token)) as AnyJWT | false
      if (!payload || payload.type !== 'owner') throw new UnauthorizedError()
      return { owner: payload as OwnerJWT }
    })
}

export function requireAdmin(minRole: Role = 'editor') {
  return new Elysia({ name: `require-admin-${minRole}` })
    .use(jwtPlugin)
    .derive({ as: 'scoped' }, async ({ jwt, headers }) => {
      const token = headers.authorization?.replace('Bearer ', '')
      if (!token) throw new UnauthorizedError()
      const payload = (await jwt.verify(token)) as AnyJWT | false
if (!payload) throw new UnauthorizedError()

      // Platform owners have full access to all their stores
      if (payload.type === 'owner') {
        const ownerAsAdmin: AdminJWT = {
          admin_id: (payload as any).owner_id,
          store_id: '*',
          role: 'owner',
          type: 'admin',
        }
        return { admin: ownerAsAdmin }
      }

      if (payload.type !== 'admin') throw new UnauthorizedError()
      const admin = payload as AdminJWT
      if (!hasRole(admin.role as Role, minRole)) throw new ForbiddenError()
      return { admin }
    })
}
