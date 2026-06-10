import { SYSTEM_FIELDS, REALTIME_DEFAULTS, SYSTEM_COLLECTION_NAMES } from '@manzoom/config'

export const STORE_META_SCHEMA = `
CREATE TABLE IF NOT EXISTS _collections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  label_ar TEXT NOT NULL,
  system INTEGER NOT NULL DEFAULT 0,
  realtime INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS _fields (
  id TEXT PRIMARY KEY,
  collection TEXT NOT NULL,
  field TEXT NOT NULL,
  type TEXT NOT NULL,
  required INTEGER NOT NULL DEFAULT 0,
  default_value TEXT,
  label TEXT NOT NULL,
  label_ar TEXT NOT NULL,
  enum_options TEXT,
  relation_collection TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(collection, field)
);

CREATE TABLE IF NOT EXISTS _permissions (
  id TEXT PRIMARY KEY,
  collection TEXT NOT NULL,
  action TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'admin',
  UNIQUE(collection, action)
);

CREATE TABLE IF NOT EXISTS _api_keys (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_used_at TEXT,
  expires_at TEXT
);

CREATE TABLE IF NOT EXISTS _webhooks (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  events TEXT NOT NULL,
  secret TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS _webhook_logs (
  id TEXT PRIMARY KEY,
  webhook_id TEXT NOT NULL REFERENCES _webhooks(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  payload TEXT NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  delivered_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_fields_collection ON _fields(collection);
CREATE INDEX IF NOT EXISTS idx_permissions_collection ON _permissions(collection);
`

export const STORE_COLLECTIONS_SCHEMA = `
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  photos TEXT NOT NULL DEFAULT '[]',
  price INTEGER NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  slug TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  slug TEXT NOT NULL UNIQUE,
  parent_id TEXT REFERENCES categories(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS product_categories (
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT,
  phone TEXT,
  email TEXT,
  address_json TEXT,
  otp_code TEXT,
  otp_expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  hashed_password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id),
  status TEXT NOT NULL DEFAULT 'pending',
  subtotal INTEGER NOT NULL DEFAULT 0,
  discount INTEGER NOT NULL DEFAULT 0,
  shipping INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'SAR',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL DEFAULT 0,
  url TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
`

export function buildCollectionRegistrySQL(): string {
  const collections = [
    { name: 'products', label: 'Products', label_ar: 'المنتجات' },
    { name: 'categories', label: 'Categories', label_ar: 'الفئات' },
    { name: 'customers', label: 'Customers', label_ar: 'العملاء' },
    { name: 'admins', label: 'Admins', label_ar: 'المشرفون' },
    { name: 'orders', label: 'Orders', label_ar: 'الطلبات' },
    { name: 'order_items', label: 'Order Items', label_ar: 'عناصر الطلب' },
    { name: 'media', label: 'Media', label_ar: 'الوسائط' },
  ]

  const statements: string[] = []
  for (const col of collections) {
    const realtime = REALTIME_DEFAULTS[col.name] ? 1 : 0
    statements.push(
      `INSERT OR IGNORE INTO _collections (id, name, label, label_ar, system, realtime) VALUES ('${col.name}', '${col.name}', '${col.label}', '${col.label_ar}', 1, ${realtime});`
    )
  }

  return statements.join('\n')
}

export function buildDefaultPermissionsSQL(): string {
  const permissions: Array<{ collection: string; action: string; level: string }> = []
  const actions = ['list', 'read', 'create', 'update', 'delete']

  for (const name of SYSTEM_COLLECTION_NAMES) {
    for (const action of actions) {
      let level = 'admin'
      if (name === 'products' && (action === 'list' || action === 'read')) level = 'public'
      if (name === 'categories' && (action === 'list' || action === 'read')) level = 'public'
      if (name === 'orders' && action === 'create') level = 'customer'
      if (name === 'orders' && action === 'read') level = 'customer'
      permissions.push({ collection: name, action, level })
    }
  }

  return permissions
    .map(
      (p) =>
        `INSERT OR IGNORE INTO _permissions (id, collection, action, level) VALUES ('${p.collection}_${p.action}', '${p.collection}', '${p.action}', '${p.level}');`
    )
    .join('\n')
}
