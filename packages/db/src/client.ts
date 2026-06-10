import { createClient, type Client } from '@libsql/client'

export function createPlatformClient(): Client {
  const url = process.env.PLATFORM_TURSO_URL
  const authToken = process.env.PLATFORM_TURSO_TOKEN

  if (!url) throw new Error('PLATFORM_TURSO_URL is not set')

  return createClient({ url, authToken })
}

export function createStoreClient(url: string, authToken: string): Client {
  return createClient({ url, authToken })
}

let _platform: Client | null = null

export function getPlatformDb(): Client {
  if (!_platform) _platform = createPlatformClient()
  return _platform
}
