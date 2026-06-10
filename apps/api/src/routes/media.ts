import { Elysia, t } from 'elysia'
import { withStore } from '../middleware/store'
import { requireAdmin } from '../middleware/auth'
import { storage } from '../services/storage'
import { generateId } from '../lib/id'
import { ValidationError } from '../lib/errors'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'application/pdf']

export const mediaRoutes = new Elysia({ prefix: '/:storeSlug/media' })
  .use(withStore())
  .use(requireAdmin('editor'))
  .post(
    '/upload',
    async ({ body, store, storeDb }) => {
      const file = body.file as File
      if (!file) throw new ValidationError('No file provided')
      if (file.size > MAX_FILE_SIZE) throw new ValidationError('File too large (max 10MB)')
      if (!ALLOWED_MIME.includes(file.type)) throw new ValidationError('File type not allowed')

      const ext = file.name.split('.').pop() ?? 'bin'
      const id = generateId()
      const path = `${store.slug}/${id}.${ext}`

      const url = await storage.upload(file, path)

      await storeDb.execute({
        sql: 'INSERT INTO media (id, filename, mime_type, size, url) VALUES (?, ?, ?, ?, ?)',
        args: [id, file.name, file.type, file.size, url],
      })

      return { media: { id, filename: file.name, mime_type: file.type, size: file.size, url } }
    },
    {
      body: t.Object({ file: t.File() }),
      type: 'formdata',
    }
  )
  .get('/', async ({ storeDb }) => {
    const result = await storeDb.execute(
      'SELECT * FROM media ORDER BY created_at DESC LIMIT 100'
    )
    return { media: result.rows }
  })
  .delete('/:id', async ({ params, storeDb }) => {
    const result = await storeDb.execute({
      sql: 'SELECT url FROM media WHERE id = ?',
      args: [params.id],
    })
    if (result.rows.length) {
      const url = (result.rows[0] as any).url as string
      const path = url.split('/uploads/')[1]
      if (path) await storage.delete(path)
    }
    await storeDb.execute({ sql: 'DELETE FROM media WHERE id = ?', args: [params.id] })
    return { ok: true }
  })
