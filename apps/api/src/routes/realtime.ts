import { Elysia } from 'elysia'
import { withStore } from '../middleware/store'
import { subscribe } from '../lib/sse'
import { NotFoundError } from '../lib/errors'

export const realtimeRoutes = new Elysia({ prefix: '/:storeSlug/realtime' }).use(withStore()).get(
  '/:collection',
  async ({ params, store, storeDb, set }) => {
    const colResult = await storeDb.execute({
      sql: 'SELECT realtime FROM _collections WHERE name = ?',
      args: [params.collection],
    })
    if (!colResult.rows.length) throw new NotFoundError('Collection')

    const realtimeEnabled = (colResult.rows[0] as any).realtime

    set.headers['Content-Type'] = 'text/event-stream'
    set.headers['Cache-Control'] = 'no-cache'
    set.headers['Connection'] = 'keep-alive'

    if (!realtimeEnabled) {
      return new Response('data: {"error":"realtime not enabled for this collection"}\n\n', {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      })
    }

    let unsubscribe: (() => void) | null = null

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue('data: {"event":"connected"}\n\n')

        unsubscribe = subscribe(store.id, params.collection, (payload) => {
          try {
            controller.enqueue(`data: ${payload}\n\n`)
          } catch {
            // Client disconnected
          }
        })
      },
      cancel() {
        unsubscribe?.()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  }
)
