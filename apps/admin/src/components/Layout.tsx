import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { route } from 'preact-router'
import { currentStore, logout } from '../lib/store'
import { api } from '../lib/api'

// ── icons ──────────────────────────────────────────────────────────────────
function Ico({ d, size = 15 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
      <path d={d} />
    </svg>
  )
}

const IC = {
  dashboard:  'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  orders:     'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2',
  products:   'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  categories: 'M3 7V5a2 2 0 0 1 2-2h2m10 0h2a2 2 0 0 1 2 2v2M3 17v2a2 2 0 0 0 2 2h2m10 0h2a2 2 0 0 0 2-2v-2M8 12h8',
  customers:  'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  admins:     'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  media:      'M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z',
  team:       'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 1a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm4 8v-1a3 3 0 0 0-3-3',
  settings:   'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.071-7.071A9 9 0 0 0 3 12c0 4.97 4.03 9 9 9a9 9 0 0 0 6.364-2.636M15.536 4.464A9 9 0 0 1 21 12',
  custom:     'M4 6h16M4 10h16M4 14h16M4 18h16',
  stores:     'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  logout:     'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1',
  plus:       'M12 5v14M5 12h14',
  chevronL:   'M15 18l-6-6 6-6',
}

// Arabic labels for system collections
const COL_LABELS: Record<string, { label: string; icon: string }> = {
  orders:      { label: 'الطلبات',   icon: IC.orders     },
  products:    { label: 'المنتجات',  icon: IC.products   },
  categories:  { label: 'الفئات',    icon: IC.categories },
  customers:   { label: 'العملاء',   icon: IC.customers  },
  order_items: { label: 'عناصر الطلبات', icon: IC.orders },
  admins:      { label: 'المديرون',  icon: IC.admins     },
}

interface CollInfo { name: string; label_ar: string; label: string; system: number }

function NavBtn({ label, icon, active, onClick, indent = false }: {
  label: string; icon: string; active: boolean; onClick: () => void; indent?: boolean
}) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
      style={`
        display:flex; align-items:center; gap:8px;
        padding:${indent ? '5px 8px 5px 20px' : '6px 8px'};
        border-radius:6px; font-size:13px; font-weight:${active ? '500' : '400'};
        border:none; width:100%; text-align:right; cursor:pointer;
        transition:background .1s, color .1s;
        background:${active ? 'white' : hover ? '#e8e7e4' : 'transparent'};
        color:${active ? '#1c1c1c' : hover ? '#1c1c1c' : '#6b6b6b'};
        box-shadow:${active ? '0 1px 3px rgba(0,0,0,.06),0 0 0 1px #e2e2e2' : 'none'};
      `}
    >
      <span style={`flex-shrink:0; color:${active ? '#1c1c1c' : '#9a9a9a'};`}>
        <Ico d={icon} size={14} />
      </span>
      <span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">{label}</span>
    </button>
  )
}

export function Layout({ children, storeSlug }: { children: any; storeSlug: string }) {
  const store = currentStore.value
  const base  = `/stores/${storeSlug}`
  const cur   = typeof window !== 'undefined' ? window.location.pathname : ''

  const [collections, setCollections] = useState<CollInfo[]>([])

  useEffect(() => {
    api.get<{ collections: CollInfo[] }>(`/${storeSlug}/schema`)
      .then(r => setCollections(r.collections ?? []))
      .catch(() => {})
  }, [storeSlug])

  function isActive(path: string) {
    return cur === path || cur.startsWith(path + '/')
  }

  // orders + products get their own specialized pages
  const SPECIALIZED: Record<string, string> = {
    orders:   `${base}/orders`,
    products: `${base}/products`,
  }
  const HIDDEN_COLS = new Set(['media', 'admins', 'order_items'])
  const systemCols = collections.filter(c => c.system && !HIDDEN_COLS.has(c.name))
  const customCols = collections.filter(c => !c.system)

  return (
    <div style="display:flex; min-height:100vh; background:#f8f8f7; direction:rtl;">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside style={`
        width:220px; flex-shrink:0;
        background:#f1f0ef;
        border-left:1px solid #e5e4e2;
        display:flex; flex-direction:column;
        position:fixed; top:0; right:0; bottom:0;
        z-index:30; overflow:hidden;
      `}>

        {/* Store switcher */}
        <div style="padding:12px 10px 8px;">
          <button
            onClick={() => route('/stores')}
            style="display:flex;align-items:center;gap:9px;padding:7px 8px;border-radius:7px;width:100%;background:transparent;border:none;cursor:pointer;transition:background .12s;"
            onMouseOver={(e: any) => e.currentTarget.style.background='#e6e5e2'}
            onMouseOut={(e: any) => e.currentTarget.style.background='transparent'}
          >
            <div style="width:27px;height:27px;border-radius:6px;background:#1c1c1c;color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;">
              {store?.name?.charAt(0) ?? 'م'}
            </div>
            <div style="flex:1;min-width:0;text-align:right;">
              <div style="font-size:13px;font-weight:600;color:#1c1c1c;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:1.3;">
                {store?.name ?? storeSlug}
              </div>
              <div style="font-size:10px;color:#a8a8a8;font-family:monospace;">{storeSlug}</div>
            </div>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#c0c0c0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        <div style="height:1px;background:#e5e4e2;margin:0 10px;" />

        {/* Nav */}
        <nav style="flex:1;padding:8px;overflow-y:auto;display:flex;flex-direction:column;gap:1px;">

          {/* Dashboard */}
          <NavBtn label="لوحة التحكم" icon={IC.dashboard} active={isActive(`${base}/dashboard`)} onClick={() => route(`${base}/dashboard`)} />

          <div style="height:8px;" />

          {/* Store section label */}
          <div style="font-size:10.5px;font-weight:600;color:#b0b0b0;letter-spacing:.05em;text-transform:uppercase;padding:0 8px;margin-bottom:2px;">
            المتجر
          </div>

          {/* System collections as direct links */}
          {systemCols.length === 0 ? (
            [
              { name:'orders',     label:'الطلبات',   icon:IC.orders     },
              { name:'products',   label:'المنتجات',  icon:IC.products   },
              { name:'categories', label:'الفئات',    icon:IC.categories },
              { name:'customers',  label:'العملاء',   icon:IC.customers  },
            ].map(c => (
              <NavBtn key={c.name} label={c.label} icon={c.icon}
                active={isActive(`${base}/collections/${c.name}`)}
                onClick={() => route(`${base}/collections/${c.name}`)} />
            ))
          ) : (
            systemCols.map(c => {
              const meta = COL_LABELS[c.name] ?? { label: c.label_ar || c.label, icon: IC.custom }
              const dest = SPECIALIZED[c.name] ?? `${base}/collections/${c.name}`
              const actv = SPECIALIZED[c.name] ? isActive(SPECIALIZED[c.name]) : isActive(`${base}/collections/${c.name}`)
              return (
                <NavBtn key={c.name}
                  label={meta.label}
                  icon={meta.icon}
                  active={actv}
                  onClick={() => route(dest)} />
              )
            })
          )}

          {/* Custom collections */}
          {customCols.length > 0 && (
            <>
              <div style="height:8px;" />
              <div style="font-size:10.5px;font-weight:600;color:#b0b0b0;letter-spacing:.05em;text-transform:uppercase;padding:0 8px;margin-bottom:2px;">
                مخصص
              </div>
              {customCols.map(c => (
                <NavBtn key={c.name}
                  label={c.label_ar || c.label || c.name}
                  icon={IC.custom}
                  active={isActive(`${base}/collections/${c.name}`)}
                  onClick={() => route(`${base}/collections/${c.name}`)} />
              ))}
            </>
          )}

          <div style="height:8px;" />
          <div style="height:1px;background:#e5e4e2;" />
          <div style="height:8px;" />

          {/* Media */}
          <NavBtn label="الوسائط"    icon={IC.media}    active={isActive(`${base}/media`)}    onClick={() => route(`${base}/media`)} />
          <NavBtn label="الفريق"     icon={IC.team}     active={isActive(`${base}/team`)}     onClick={() => route(`${base}/team`)} />
          <NavBtn label="الإعدادات"  icon={IC.settings} active={isActive(`${base}/settings`)} onClick={() => route(`${base}/settings`)} />
        </nav>

        {/* Footer */}
        <div style="padding:8px;border-top:1px solid #e5e4e2;">
          <button
            onClick={() => { logout(); route('/login') }}
            style="display:flex;align-items:center;gap:8px;padding:6px 9px;border-radius:6px;font-size:13px;font-weight:400;border:none;width:100%;text-align:right;cursor:pointer;background:transparent;color:#b8b8b8;transition:background .1s,color .1s;"
            onMouseOver={(e: any) => { e.currentTarget.style.background='#fdecea'; e.currentTarget.style.color='#c62828' }}
            onMouseOut={(e: any) => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#b8b8b8' }}
          >
            <Ico d={IC.logout} size={14} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* ── Main area (sidebar + topbar offset) ─────────────────────────── */}
      <div style="flex:1; margin-right:220px; min-width:0; display:flex; flex-direction:column; min-height:100vh;">

        {/* ── Top bar ─────────────────────────────────────────────────── */}
        <header style="
          height:48px; background:white;
          border-bottom:1px solid #e8e8e7;
          display:flex; align-items:center;
          padding:0 24px;
          position:sticky; top:0; z-index:20;
          flex-shrink:0;
          gap:12px;
        ">
          {/* Breadcrumb / page title derived from URL */}
          <TopBarTitle storeSlug={storeSlug} />

          <div style="flex:1;" />

          {/* Search */}
          <button
            style="display:flex;align-items:center;gap:8px;padding:5px 12px;border-radius:6px;background:#f8f8f7;border:1px solid #e8e8e7;color:#a0a0a0;font-size:13px;cursor:pointer;transition:border-color .15s;"
            onMouseOver={(e: any) => e.currentTarget.style.borderColor='#c0c0c0'}
            onMouseOut={(e: any) => e.currentTarget.style.borderColor='#e8e8e7'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span>بحث...</span>
            <span style="font-size:11px;color:#c8c8c8;margin-right:8px;">⌘K</span>
          </button>

          {/* User avatar */}
          <div style="
            width:30px; height:30px; border-radius:50%;
            background:#1c1c1c; color:white;
            display:flex; align-items:center; justify-content:center;
            font-size:12px; font-weight:600; cursor:pointer;
            flex-shrink:0;
          "
            title={store?.name}
          >
            {store?.name?.charAt(0) ?? 'م'}
          </div>
        </header>

        {/* ── Page content ────────────────────────────────────────────── */}
        <main style="flex:1; overflow:auto;">
          {children}
        </main>
      </div>
    </div>
  )
}

// Derive a breadcrumb title from the current URL
function TopBarTitle({ storeSlug }: { storeSlug: string }) {
  const cur = typeof window !== 'undefined' ? window.location.pathname : ''
  const parts = cur.replace(`/stores/${storeSlug}/`, '').split('/')

  const SECTION_LABELS: Record<string, string> = {
    dashboard:   'لوحة التحكم',
    collections: 'المجموعات',
    media:       'الوسائط',
    team:        'الفريق',
    settings:    'الإعدادات',
    schema:      'هيكل البيانات',
  }
  const COL_AR: Record<string, string> = {
    orders: 'الطلبات', products: 'المنتجات', categories: 'الفئات',
    customers: 'العملاء', admins: 'المديرون', order_items: 'عناصر الطلبات', media: 'الوسائط',
  }

  const section = parts[0] ?? ''
  const collection = parts[1] ?? ''
  const recordId = parts[2] ?? ''

  const items: string[] = []

  if (SECTION_LABELS[section]) items.push(SECTION_LABELS[section])
  if (section === 'collections' && collection) {
    items.push(COL_AR[collection] ?? collection)
    if (recordId === 'new') items.push('سجل جديد')
    else if (recordId) items.push('تعديل')
  }
  if (section === 'schema' && collection) items.push(COL_AR[collection] ?? collection)

  return (
    <div style="display:flex;align-items:center;gap:6px;font-size:13px;">
      {items.map((item, i) => (
        <span key={i} style="display:flex;align-items:center;gap:6px;">
          {i > 0 && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>}
          <span style={`color:${i === items.length-1 ? '#1c1c1c' : '#a0a0a0'}; font-weight:${i === items.length-1 ? '600' : '400'};`}>
            {item}
          </span>
        </span>
      ))}
    </div>
  )
}
