type SSEChannel = (data: string) => void

const bus = new Map<string, Set<SSEChannel>>()

function busKey(storeId: string, collection: string): string {
  return `${storeId}:${collection}`
}

export function subscribe(storeId: string, collection: string, channel: SSEChannel): () => void {
  const key = busKey(storeId, collection)
  if (!bus.has(key)) bus.set(key, new Set())
  bus.get(key)!.add(channel)

  return () => {
    bus.get(key)?.delete(channel)
    if (bus.get(key)?.size === 0) bus.delete(key)
  }
}

export function broadcastChange(
  storeId: string,
  collection: string,
  event: 'create' | 'update' | 'delete',
  id: string
): void {
  const key = busKey(storeId, collection)
  const channels = bus.get(key)
  if (!channels?.size) return

  const payload = JSON.stringify({ event, collection, id, timestamp: new Date().toISOString() })
  for (const send of channels) {
    try {
      send(payload)
    } catch {
      channels.delete(send)
    }
  }
}
