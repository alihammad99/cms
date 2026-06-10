const BASE = import.meta.env.VITE_API_URL ?? '/api'

function getToken(): string | null {
  return localStorage.getItem('mz_token')
}

export function setToken(token: string): void {
  localStorage.setItem('mz_token', token)
}

export function clearToken(): void {
  localStorage.removeItem('mz_token')
  localStorage.removeItem('mz_store')
}

export function getStoredStore(): { id: string; name: string; slug: string } | null {
  const raw = localStorage.getItem('mz_store')
  return raw ? JSON.parse(raw) : null
}

export function setStore(store: { id: string; name: string; slug: string }): void {
  localStorage.setItem('mz_store', JSON.stringify(store))
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  const data = await res.json()

  if (!res.ok) {
    // Elysia validation errors have a different shape
    let message = data.error ?? data.message ?? `Request failed: ${res.status}`
    // Elysia validation errors are JSON-stringified inside the error field
    if (typeof message === 'string' && message.startsWith('{')) {
      try {
        const parsed = JSON.parse(message)
        const firstError = parsed.errors?.[0]
        message = firstError?.message ?? parsed.message ?? parsed.summary ?? message
      } catch {}
    }
    throw new Error(message)
  }

  return data as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
