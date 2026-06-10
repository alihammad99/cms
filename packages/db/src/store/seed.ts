import type { Client } from '@libsql/client'
import {
  STORE_META_SCHEMA,
  STORE_COLLECTIONS_SCHEMA,
  buildCollectionRegistrySQL,
  buildDefaultPermissionsSQL,
} from './schema'

export async function seedStoreDb(client: Client, storeId: string): Promise<void> {
  const allStatements = [
    ...STORE_META_SCHEMA.split(';').map((s) => s.trim()).filter(Boolean).map((s) => s + ';'),
    ...STORE_COLLECTIONS_SCHEMA.split(';').map((s) => s.trim()).filter(Boolean).map((s) => s + ';'),
    ...buildCollectionRegistrySQL().split(';').map((s) => s.trim()).filter(Boolean).map((s) => s + ';'),
    ...buildDefaultPermissionsSQL().split(';').map((s) => s.trim()).filter(Boolean).map((s) => s + ';'),
    `INSERT OR IGNORE INTO settings (key, value) VALUES ('currency', 'SAR');`,
    `INSERT OR IGNORE INTO settings (key, value) VALUES ('timezone', 'Asia/Riyadh');`,
    `INSERT OR IGNORE INTO settings (key, value) VALUES ('customer_auth_required', 'false');`,
    `INSERT OR IGNORE INTO settings (key, value) VALUES ('store_id', '${storeId}');`,
  ]

  for (const sql of allStatements) {
    await client.execute(sql)
  }
}
