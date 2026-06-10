import { Elysia } from 'elysia'
import { getPlatformDb, createStoreClient } from '@manzoom/db'
import type { Store } from '@manzoom/types'
import { NotFoundError } from '../lib/errors'
import type { Client } from '@libsql/client'

const storeClientCache = new Map<string, Client>()

export function withStore() {
  return new Elysia({ name: 'with-store' }).derive(
    { as: 'scoped' },
    async ({ params }: { params: { storeSlug?: string } }) => {
      const slug = params.storeSlug
      if (!slug) throw new NotFoundError('Store')

      const platform = getPlatformDb()
      const result = await platform.execute({
        sql: 'SELECT * FROM stores WHERE slug = ?',
        args: [slug],
      })

      if (!result.rows.length) throw new NotFoundError('Store')
      const store = result.rows[0] as unknown as Store

      let storeDb = storeClientCache.get(store.id)
      if (!storeDb) {
        storeDb = createStoreClient(store.turso_db_url, store.turso_auth_token)
        storeClientCache.set(store.id, storeDb)
      }

      return { store, storeDb }
    }
  )
}
