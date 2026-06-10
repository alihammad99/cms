import { h } from 'preact'
import { useState } from 'preact/hooks'
import { t } from '../lib/i18n'

export interface Column<T> {
  key: keyof T | string
  label: string
  render?: (row: T) => h.JSX.Element | string | null
  sortable?: boolean
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  onRowClick?: (row: T) => void
  onDelete?: (row: T) => void
  searchable?: boolean
  searchField?: keyof T
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading,
  onRowClick,
  onDelete,
  searchable,
  searchField,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')

  const filtered = searchable && searchField && search
    ? data.filter((row) =>
        String(row[searchField] ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : data

  if (loading) {
    return (
      <div class="flex items-center justify-center py-20 text-gray-400">
        <span>{t('loading')}</span>
      </div>
    )
  }

  return (
    <div class="w-full">
      {searchable && (
        <div class="mb-4">
          <input
            class="input max-w-sm"
            placeholder={t('search')}
            value={search}
            onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
          />
        </div>
      )}

      <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  class="px-4 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
              {onDelete && (
                <th class="px-4 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('actions')}
                </th>
              )}
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onDelete ? 1 : 0)}
                  class="px-4 py-12 text-center text-gray-400"
                >
                  {t('no_data')}
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => (
                <tr
                  key={i}
                  class={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td key={String(col.key)} class="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {col.render
                        ? col.render(row)
                        : String(row[col.key as keyof T] ?? '—')}
                    </td>
                  ))}
                  {onDelete && (
                    <td class="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          if (confirm(t('confirm_delete'))) onDelete(row)
                        }}
                        class="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        {t('delete')}
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
