import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { staticPlugin } from '@elysiajs/static'
import { swagger } from '@elysiajs/swagger'

import { env } from './env'
import { migratePlatform } from '@manzoom/db'
import { AppError } from './lib/errors'

import { authRoutes } from './routes/auth'
import { storeRoutes } from './routes/stores'
import { storeAuthRoutes } from './routes/store-auth'
import { schemaRoutes } from './routes/schema'
import { collectionRoutes } from './routes/collection'
import { realtimeRoutes } from './routes/realtime'
import { mediaRoutes } from './routes/media'
import { teamRoutes } from './routes/team'
import { permissionsRoutes } from './routes/permissions'
import { settingsRoutes } from './routes/settings'

await migratePlatform()

const app = new Elysia()
  .use(
    cors({
      origin: [env.ADMIN_URL, 'http://localhost:5173'],
      credentials: true,
    })
  )
  .use(
    swagger({
      documentation: {
        info: { title: 'Manzoom CMS API', version: '1.0.0' },
      },
    })
  )
  .use(staticPlugin({ assets: 'uploads', prefix: '/uploads' }))

  .onError(({ error, set, code }) => {
    if (error instanceof AppError) {
      set.status = error.status
      return { error: error.message, code: error.code }
    }
    // Elysia validation errors
    if (code === 'VALIDATION') {
      set.status = 422
      const e = error as any
      const firstError = e.all?.[0] ?? e.errors?.[0]
      const message = firstError?.message ?? e.message ?? 'Validation error'
      return { error: message, code: 'VALIDATION_ERROR' }
    }
    console.error('[ERROR]', error)
    set.status = 500
    return { error: (error as Error).message ?? 'Internal server error', code: 'INTERNAL_ERROR' }
  })

  .get('/health', () => ({ status: 'ok', version: '1.0.0' }))

  // Platform routes
  .use(authRoutes)
  .use(storeRoutes)

  // Per-store routes
  .use(storeAuthRoutes)
  .use(schemaRoutes)
  .use(collectionRoutes)
  .use(realtimeRoutes)
  .use(mediaRoutes)
  .use(teamRoutes)
  .use(permissionsRoutes)
  .use(settingsRoutes)

  .listen(env.PORT)

console.log(`Manzoom API running at http://localhost:${env.PORT}`)
console.log(`Swagger docs at http://localhost:${env.PORT}/swagger`)
