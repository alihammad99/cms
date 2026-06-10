import { h } from 'preact'

type IconProps = { size?: number; class?: string }

const icon = (path: string) =>
  function Icon({ size = 18, class: cls = '' }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        class={cls}
      >
        {h('path', { d: path })}
      </svg>
    )
  }

const icon2 = (paths: string[]) =>
  function Icon({ size = 18, class: cls = '' }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        class={cls}
      >
        {paths.map((d) => h('path', { d }))}
      </svg>
    )
  }

export const IconGrid = icon('M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z')
export const IconLayers = icon2([
  'M12 2L2 7l10 5 10-5-10-5z',
  'M2 17l10 5 10-5',
  'M2 12l10 5 10-5',
])
export const IconBox = icon2([
  'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
  'M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12',
])
export const IconImage = icon2([
  'M21 15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8z',
  'M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 20',
])
export const IconUsers = icon2([
  'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2',
  'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
])
export const IconSettings = icon2([
  'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
])
export const IconDatabase = icon2([
  'M12 2C6.48 2 2 4.02 2 6.5S6.48 11 12 11s10-2.02 10-4.5S17.52 2 12 2z',
  'M2 6.5v5C2 13.98 6.48 16 12 16s10-2.02 10-4.5v-5',
  'M2 11.5v5C2 18.98 6.48 21 12 21s10-2.02 10-4.5v-5',
])
export const IconBarChart = icon2([
  'M18 20V10',
  'M12 20V4',
  'M6 20v-6',
])
export const IconPackage = icon2([
  'M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
  'M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12',
])
export const IconTrendingUp = icon2([
  'M23 6l-9.5 9.5-5-5L1 18',
  'M17 6h6v6',
])
export const IconShoppingCart = icon2([
  'M9 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM20 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  'M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6',
])
export const IconAlertTriangle = icon2([
  'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
  'M12 9v4M12 17h.01',
])
export const IconLogOut = icon2([
  'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4',
  'M16 17l5-5-5-5M21 12H9',
])
export const IconGlobe = icon2([
  'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z',
  'M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
])
export const IconChevronRight = icon('M9 18l6-6-6-6')
export const IconPlus = icon('M12 5v14M5 12h14')
export const IconSearch = icon2(['M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z'])
export const IconTrash = icon2([
  'M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
])
export const IconEdit = icon2([
  'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7',
  'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
])
export const IconArrowLeft = icon('M19 12H5M12 5l-7 7 7 7')
export const IconCheck = icon('M20 6L9 17l-5-5')
export const IconX = icon('M18 6L6 18M6 6l12 12')
export const IconUpload = icon2(['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M17 8l-5-5-5 5M12 3v12'])
export const IconCopy = icon2([
  'M20 9h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2z',
  'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1',
])
export const IconKey = icon2([
  'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4',
])
export const IconFilter = icon2(['M22 3H2l8 9.46V19l4 2v-8.54L22 3z'])
export const IconStore = icon2([
  'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  'M9 22V12h6v10',
])
export const IconLock = icon2([
  'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z',
  'M7 11V7a5 5 0 0 1 10 0v4',
])
export const IconRefreshCw = icon2([
  'M23 4v6h-6',
  'M1 20v-6h6',
  'M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
])
