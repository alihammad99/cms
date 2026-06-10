function required(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing required env var: ${key}`)
  return val
}

function optional(key: string, fallback = ''): string {
  return process.env[key] ?? fallback
}

export const env = {
  PORT: parseInt(optional('PORT', '3000')),
  JWT_SECRET: required('JWT_SECRET'),

  PLATFORM_TURSO_URL: required('PLATFORM_TURSO_URL'),
  PLATFORM_TURSO_TOKEN: optional('PLATFORM_TURSO_TOKEN'),

  TURSO_API_TOKEN: optional('TURSO_API_TOKEN'),
  TURSO_ORG: optional('TURSO_ORG'),

  STORAGE_DRIVER: optional('STORAGE_DRIVER', 'local') as 'local' | 'bunny',
  BUNNY_STORAGE_ZONE: optional('BUNNY_STORAGE_ZONE'),
  BUNNY_STORAGE_KEY: optional('BUNNY_STORAGE_KEY'),
  BUNNY_CDN_URL: optional('BUNNY_CDN_URL'),

  UNIFONIC_APP_SID: optional('UNIFONIC_APP_SID'),
  UNIFONIC_SENDER_ID: optional('UNIFONIC_SENDER_ID', 'Manzoom'),

  UPSTASH_REDIS_URL: optional('UPSTASH_REDIS_URL'),
  UPSTASH_REDIS_TOKEN: optional('UPSTASH_REDIS_TOKEN'),

  ADMIN_URL: optional('ADMIN_URL', 'http://localhost:5173'),
}
