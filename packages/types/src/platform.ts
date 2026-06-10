import type { PlanName } from '@manzoom/config'
import type { Role } from '@manzoom/config'

export interface Owner {
  id: string
  name: string
  email: string
  hashed_password: string
  plan: PlanName
  created_at: string
}

export interface Store {
  id: string
  owner_id: string
  name: string
  slug: string
  turso_db_url: string
  turso_auth_token: string
  plan: PlanName
  created_at: string
}

export interface StoreMember {
  id: string
  store_id: string
  user_email: string
  role: Role
  invited_at: string
  accepted_at: string | null
}

export interface OwnerJWT {
  owner_id: string
  email: string
  plan: PlanName
  type: 'owner'
}

export interface AdminJWT {
  admin_id: string
  store_id: string
  role: Role
  type: 'admin'
}

export interface CustomerJWT {
  customer_id: string
  store_id: string
  type: 'customer'
}

export type AnyJWT = OwnerJWT | AdminJWT | CustomerJWT
