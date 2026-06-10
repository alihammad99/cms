import { randomBytes } from 'crypto'

export function generateId(): string {
  return randomBytes(12).toString('base64url')
}

export function generateApiKey(): { key: string; prefix: string; hash: string } {
  const key = 'mz_' + randomBytes(24).toString('base64url')
  const prefix = key.slice(0, 10)
  const hash = Bun.CryptoHasher ? new Bun.CryptoHasher('sha256').update(key).digest('hex') : key
  return { key, prefix, hash }
}
