import { join } from 'path'
import { mkdir, writeFile, unlink } from 'fs/promises'
import { env } from '../env'

export interface StorageAdapter {
  upload(file: Blob, path: string): Promise<string>
  delete(path: string): Promise<void>
  getUrl(path: string): string
}

class LocalStorageAdapter implements StorageAdapter {
  private readonly root = join(process.cwd(), 'uploads')
  private readonly baseUrl: string

  constructor(port: number) {
    this.baseUrl = `http://localhost:${port}/uploads`
  }

  async upload(file: Blob, path: string): Promise<string> {
    const fullPath = join(this.root, path)
    await mkdir(fullPath.split('/').slice(0, -1).join('/'), { recursive: true })
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(fullPath, buffer)
    return this.getUrl(path)
  }

  async delete(path: string): Promise<void> {
    await unlink(join(this.root, path)).catch(() => {})
  }

  getUrl(path: string): string {
    return `${this.baseUrl}/${path}`
  }
}

class BunnyStorageAdapter implements StorageAdapter {
  constructor(
    private zone: string,
    private key: string,
    private cdnUrl: string
  ) {}

  async upload(file: Blob, path: string): Promise<string> {
    const res = await fetch(`https://storage.bunnycdn.com/${this.zone}/${path}`, {
      method: 'PUT',
      headers: {
        AccessKey: this.key,
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: file,
    })
    if (!res.ok) throw new Error(`Bunny upload failed: ${res.statusText}`)
    return this.getUrl(path)
  }

  async delete(path: string): Promise<void> {
    await fetch(`https://storage.bunnycdn.com/${this.zone}/${path}`, {
      method: 'DELETE',
      headers: { AccessKey: this.key },
    })
  }

  getUrl(path: string): string {
    return `${this.cdnUrl}/${path}`
  }
}

export function createStorageAdapter(): StorageAdapter {
  if (env.STORAGE_DRIVER === 'bunny') {
    return new BunnyStorageAdapter(env.BUNNY_STORAGE_ZONE, env.BUNNY_STORAGE_KEY, env.BUNNY_CDN_URL)
  }
  return new LocalStorageAdapter(env.PORT)
}

export const storage = createStorageAdapter()
