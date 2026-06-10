import { h, type ComponentChildren } from 'preact'

export function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumb,
}: {
  title: string
  subtitle?: string
  actions?: ComponentChildren
  breadcrumb?: string
}) {
  return (
    <div class="flex items-center justify-between gap-4 mb-6">
      <div>
        {breadcrumb && (
          <p class="text-xs text-gray-400 font-medium mb-0.5 uppercase tracking-wider">{breadcrumb}</p>
        )}
        <h1 class="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p class="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div class="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}
