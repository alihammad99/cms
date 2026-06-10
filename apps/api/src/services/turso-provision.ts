import { env } from '../env'
import { mkdir } from 'fs/promises'
import { join } from 'path'

interface TursoDatabase {
  DbId: string
  Hostname: string
  Name: string
}

interface TursoToken {
  jwt: string
}

async function localFallback(slug: string): Promise<{ url: string; token: string }> {
  const dir = join(process.cwd(), 'uploads', 'stores')
  await mkdir(dir, { recursive: true })
  return {
    url: `file:${dir}/${slug}.db`,
    token: '',
  }
}

export async function provisionStoreDb(slug: string): Promise<{ url: string; token: string }> {
  if (!env.TURSO_API_TOKEN || !env.TURSO_ORG) {
    return localFallback(slug)
  }

  const dbName = `manzoom-store-${slug}`

  try {
    const createRes = await fetch(
      `https://api.turso.tech/v1/organizations/${env.TURSO_ORG}/databases`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.TURSO_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: dbName, group: 'default' }),
      }
    )

    if (!createRes.ok) {
      const err = await createRes.text()
      console.warn(`Turso provisioning failed (${createRes.status}): ${err} — falling back to local SQLite`)
      return localFallback(slug)
    }

    const { database } = (await createRes.json()) as { database: TursoDatabase }

    const tokenRes = await fetch(
      `https://api.turso.tech/v1/organizations/${env.TURSO_ORG}/databases/${database.Name}/auth/tokens`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.TURSO_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expiration: 'never', authorization: 'full-access' }),
      }
    )

    if (!tokenRes.ok) {
      const err = await tokenRes.text()
      console.warn(`Turso token creation failed: ${err} — falling back to local SQLite`)
      return localFallback(slug)
    }

    const { jwt } = (await tokenRes.json()) as TursoToken
    return { url: `libsql://${database.Hostname}`, token: jwt }
  } catch (err) {
    console.warn('Turso provisioning error, falling back to local SQLite:', err)
    return localFallback(slug)
  }
}
