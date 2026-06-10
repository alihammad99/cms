import { h, type ComponentChildren } from 'preact'
import { IconX } from './Icons'

export function Modal({
  title,
  onClose,
  children,
  footer,
  size = 'md',
}: {
  title: string
  onClose: () => void
  children: ComponentChildren
  footer?: ComponentChildren
  size?: 'sm' | 'md' | 'lg'
}) {
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div class={`relative bg-white rounded-2xl shadow-2xl w-full ${widths[size]} max-h-[90vh] flex flex-col`}>
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 class="text-base font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <IconX size={15} />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
