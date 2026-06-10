import type { FieldType } from '@manzoom/config'

export interface Collection {
  id: string
  name: string
  label: string
  label_ar: string
  system: boolean
  realtime: boolean
  created_at: string
}

export interface CustomField {
  id: string
  collection: string
  field: string
  type: FieldType
  required: boolean
  default_value: string | null
  label: string
  label_ar: string
  enum_options: string | null
  relation_collection: string | null
  sort_order: number
  created_at: string
}

export type PermissionAction = 'list' | 'read' | 'create' | 'update' | 'delete'
export type PermissionLevel = 'public' | 'authenticated' | 'customer' | 'admin' | 'owner'

export interface Permission {
  id: string
  collection: string
  action: PermissionAction
  level: PermissionLevel
}

export interface ApiKey {
  id: string
  name: string
  key_hash: string
  key_prefix: string
  created_at: string
  last_used_at: string | null
  expires_at: string | null
}

export interface Webhook {
  id: string
  url: string
  events: string
  secret: string | null
  active: boolean
  created_at: string
}

export interface WebhookLog {
  id: string
  webhook_id: string
  event: string
  payload: string
  response_status: number | null
  response_body: string | null
  delivered_at: string | null
  created_at: string
}

export interface Media {
  id: string
  filename: string
  mime_type: string
  size: number
  url: string
  created_at: string
}

export interface StoreSetting {
  key: string
  value: string
}

export interface Product {
  id: string
  name: string
  name_ar: string | null
  description: string | null
  photos: string
  price: number
  stock: number
  status: 'draft' | 'active' | 'archived'
  slug: string
  created_at: string
  updated_at: string
  [key: string]: unknown
}

export interface Category {
  id: string
  name: string
  name_ar: string | null
  slug: string
  parent_id: string | null
  created_at: string
}

export interface Customer {
  id: string
  name: string | null
  phone: string | null
  email: string | null
  address_json: string | null
  created_at: string
}

export interface Order {
  id: string
  customer_id: string | null
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  subtotal: number
  discount: number
  shipping: number
  total: number
  currency: string
  notes: string | null
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total: number
}

export interface Admin {
  id: string
  store_id: string
  name: string
  email: string
  hashed_password: string
  role: string
  created_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}
