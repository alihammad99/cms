import { getPlatformDb } from '../client'
import { PLATFORM_SCHEMA } from './schema'

export async function migratePlatform(): Promise<void> {
  const db = getPlatformDb()
  const statements = PLATFORM_SCHEMA
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => s + ';')

  for (const sql of statements) {
    await db.execute(sql)
  }

  console.log('Platform schema migrated successfully')
}

if (import.meta.main) {
  await migratePlatform()
}
