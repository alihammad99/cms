import { signal, computed } from '@preact/signals'
import type { Store } from '@manzoom/types'

export const authToken = signal<string | null>(localStorage.getItem('mz_token'))
export const currentStore = signal<Pick<Store, 'id' | 'name' | 'slug'> | null>(
  JSON.parse(localStorage.getItem('mz_store') ?? 'null')
)

export const isAuthenticated = computed(() => !!authToken.value)

export function login(token: string): void {
  localStorage.setItem('mz_token', token)
  authToken.value = token
}

export function logout(): void {
  localStorage.removeItem('mz_token')
  localStorage.removeItem('mz_store')
  authToken.value = null
  currentStore.value = null
}

export function selectStore(store: Pick<Store, 'id' | 'name' | 'slug'>): void {
  localStorage.setItem('mz_store', JSON.stringify(store))
  currentStore.value = store
}
