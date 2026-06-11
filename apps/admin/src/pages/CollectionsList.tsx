import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { route } from 'preact-router'
import { api } from '../lib/api'
import { Layout } from '../components/Layout'
import { Modal } from '../components/Modal'
import { IconPlus } from '../components/Icons'

interface CollectionInfo {
  id: string; name: string; label: string; label_ar: string
  system: number; realtime: number; icon?: string
}

// Available icons for custom tables
export const TABLE_ICONS: { key: string; d: string; label: string }[] = [
  { key: 'table',    label: 'جدول',     d: 'M3 3h18v18H3zM3 9h18M3 15h18M9 3v18' },
  { key: 'star',     label: 'نجمة',     d: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z' },
  { key: 'tag',      label: 'وسم',      d: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01' },
  { key: 'file',     label: 'ملف',      d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6' },
  { key: 'calendar', label: 'تقويم',    d: 'M3 4h18v18H3zM16 2v4M8 2v4M3 10h18' },
  { key: 'map',      label: 'موقع',     d: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2' },
  { key: 'mail',     label: 'بريد',     d: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm18 2l-10 7L2 6' },
  { key: 'truck',    label: 'شحن',      d: 'M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM18.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3' },
  { key: 'chart',    label: 'إحصاء',    d: 'M18 20V10M12 20V4M6 20v-6' },
  { key: 'book',     label: 'كتاب',     d: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' },
  { key: 'gift',     label: 'هدية',     d: 'M20 12v10H4V12M22 7H2v5h20zM12 22V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7' },
  { key: 'layers',   label: 'طبقات',    d: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
  { key: 'credit',   label: 'دفع',      d: 'M1 4h22v16H1zM1 10h22' },
  { key: 'bell',     label: 'إشعار',    d: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0' },
  { key: 'lock',     label: 'أمان',     d: 'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4' },
  { key: 'zap',      label: 'تشغيل',    d: 'M13 2L3 14h9l-1 8 10-12h-9z' },
]

// Unique icon paths per collection
const COLLECTION_ICONS: Record<string, string> = {
  products:    'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  categories:  'M3 7V5a2 2 0 0 1 2-2h2m10 0h2a2 2 0 0 1 2 2v2M3 17v2a2 2 0 0 0 2 2h2m10 0h2a2 2 0 0 0 2-2v-2M8 12h8',
  orders:      'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2',
  order_items: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m-6 9l2 2 4-4',
  customers:   'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 1a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm4 8v-1a3 3 0 0 0-3-3',
  admins:      'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  media:       'M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z',
}
const DEFAULT_ICON = 'M4 6h16M4 10h16M4 14h16M4 18h16'

function CollIcon({ name, size = 18 }: { name: string; size?: number }) {
  const d = COLLECTION_ICONS[name] ?? DEFAULT_ICON
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <path d={d} />
    </svg>
  )
}

export function CollectionsListPage({ storeSlug }: { storeSlug: string }) {
  const [collections, setCollections] = useState<CollectionInfo[]>([])
  const [loading, setLoading]         = useState(true)
  const [showCreate, setShowCreate]   = useState(false)
  const [form, setForm]               = useState({ name: '', label: '', label_ar: '', realtime: false, icon: 'table' })
  const [creating, setCreating]       = useState(false)
  const [error, setError]             = useState('')

  useEffect(() => {
    api.get<{ collections: CollectionInfo[] }>(`/${storeSlug}/schema`)
      .then((r) => setCollections(r.collections ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [storeSlug])

  async function handleCreate(e: Event) {
    e.preventDefault()
    setError('')
    setCreating(true)
    try {
      await api.post(`/${storeSlug}/schema`, form)
      const r = await api.get<{ collections: CollectionInfo[] }>(`/${storeSlug}/schema`)
      setCollections(r.collections ?? [])
      setShowCreate(false)
      setForm({ name: '', label: '', label_ar: '', realtime: false, icon: 'table' })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  const systemCols = collections.filter(c => c.system)
  const customCols = collections.filter(c => !c.system)

  return (
    <Layout storeSlug={storeSlug}>
      <div style="padding:28px 32px;">

        {/* Header */}
        <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:28px;">
          <div>
            <h1 style="font-size:18px;font-weight:700;color:#1c1c1c;margin-bottom:3px;">المجموعات</h1>
            <p style="font-size:13px;color:#a0a0a0;">اختر مجموعة لعرض بياناتها وإدارتها</p>
          </div>
          <button onClick={() => setShowCreate(true)} class="btn-primary" style="gap:6px;">
            <IconPlus size={13} />
            مجموعة جديدة
          </button>
        </div>

        {loading ? (
          <div>
            <div class="skeleton" style="width:80px;height:11px;margin-bottom:14px;" />
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;">
              {[1,2,3,4,5,6,7].map(i => (
                <div key={i} class="card skeleton" style="height:80px;" />
              ))}
            </div>
          </div>
        ) : (
          <div style="display:flex;flex-direction:column;gap:28px;">

            {/* System collections */}
            <div>
              <div style="font-size:11px;font-weight:600;color:#a8a8a8;letter-spacing:.06em;text-transform:uppercase;margin-bottom:10px;">
                مجموعات النظام
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;">
                {systemCols.map((col) => (
                  <button
                    key={col.name}
                    onClick={() => route(`/stores/${storeSlug}/collections/${col.name}`)}
                    class="card"
                    style="padding:16px 18px;text-align:right;cursor:pointer;border:none;transition:box-shadow .15s;display:block;width:100%;"
                    onMouseOver={(e: any) => e.currentTarget.style.boxShadow='0 0 0 1px #c0bfbe,0 2px 8px rgba(0,0,0,.05)'}
                    onMouseOut={(e: any) => e.currentTarget.style.boxShadow='0 0 0 1px #e8e8e7'}
                  >
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                      <div style="width:30px;height:30px;background:#f0f0ef;border-radius:7px;display:flex;align-items:center;justify-content:center;color:#767676;">
                        <CollIcon name={col.name} size={15} />
                      </div>
                      {!!col.realtime && (
                        <div style="display:flex;align-items:center;gap:4px;">
                          <div style="width:6px;height:6px;border-radius:50%;background:#22c55e;animation:pulse 2s infinite;" />
                          <span style="font-size:10px;color:#16a34a;font-weight:500;">Live</span>
                        </div>
                      )}
                    </div>
                    <div style="font-size:13px;font-weight:600;color:#1c1c1c;">{col.label_ar || col.label}</div>
                    <div style="font-size:11px;color:#b0b0b0;font-family:monospace;margin-top:2px;">{col.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom collections */}
            {(customCols.length > 0 || true) && (
              <div>
                <div style="font-size:11px;font-weight:600;color:#a8a8a8;letter-spacing:.06em;text-transform:uppercase;margin-bottom:10px;">
                  مجموعات مخصصة
                </div>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;">
                  {customCols.map((col) => (
                    <button
                      key={col.name}
                      onClick={() => route(`/stores/${storeSlug}/collections/${col.name}`)}
                      class="card"
                      style="padding:16px 18px;text-align:right;cursor:pointer;border:none;transition:box-shadow .15s;display:block;width:100%;"
                      onMouseOver={(e: any) => e.currentTarget.style.boxShadow='0 0 0 1px #c0bfbe,0 2px 8px rgba(0,0,0,.05)'}
                      onMouseOut={(e: any) => e.currentTarget.style.boxShadow='0 0 0 1px #e8e8e7'}
                    >
                      <div style="width:30px;height:30px;background:#f0f0ef;border-radius:7px;display:flex;align-items:center;justify-content:center;color:#767676;margin-bottom:10px;">
                        <CollIcon name={col.name} size={15} />
                      </div>
                      <div style="font-size:13px;font-weight:600;color:#1c1c1c;">{col.label_ar || col.label}</div>
                      <div style="font-size:11px;color:#b0b0b0;font-family:monospace;margin-top:2px;">{col.name}</div>
                    </button>
                  ))}

                  {/* Add new */}
                  <button
                    onClick={() => setShowCreate(true)}
                    style="
                      padding:16px 18px; border-radius:8px; text-align:right;
                      border:1.5px dashed #d4d4d2; background:transparent;
                      cursor:pointer; transition:border-color .15s, background .15s;
                      display:flex; flex-direction:column; justify-content:center;
                      min-height:88px;
                    "
                    onMouseOver={(e: any) => { e.currentTarget.style.borderColor='#a0a0a0'; e.currentTarget.style.background='#fafaf9' }}
                    onMouseOut={(e: any) => { e.currentTarget.style.borderColor='#d4d4d2'; e.currentTarget.style.background='transparent' }}
                  >
                    <div style="display:flex;align-items:center;gap:7px;color:#a0a0a0;">
                      <IconPlus size={14} />
                      <span style="font-size:13px;font-weight:500;">إضافة مجموعة</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showCreate && (
        <Modal title="مجموعة جديدة" onClose={() => { setShowCreate(false); setError('') }} footer={
          <>
            <button onClick={() => setShowCreate(false)} class="btn-secondary">إلغاء</button>
            <button onClick={handleCreate} class="btn-primary" disabled={creating}>
              {creating ? 'جاري الإنشاء...' : 'إنشاء'}
            </button>
          </>
        }>
          <form onSubmit={handleCreate} style="display:flex;flex-direction:column;gap:16px;">

            {/* Icon picker */}
            <div>
              <label class="label">الأيقونة</label>
              <div style="display:grid;grid-template-columns:repeat(8,1fr);gap:4px;">
                {TABLE_ICONS.map(ic => (
                  <button
                    key={ic.key}
                    type="button"
                    title={ic.label}
                    onClick={() => setForm(f => ({ ...f, icon: ic.key }))}
                    style={`
                      width:100%;aspect-ratio:1;border-radius:7px;border:1.5px solid;
                      display:flex;align-items:center;justify-content:center;cursor:pointer;
                      transition:all .1s;
                      ${form.icon === ic.key
                        ? 'background:#1c1c1c;border-color:#1c1c1c;color:white;'
                        : 'background:white;border-color:#e8e8e7;color:#767676;'}
                    `}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                      <path d={ic.d} />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label class="label">الاسم البرمجي (snake_case)</label>
              <input class="input" style="font-family:monospace;" value={form.name} placeholder="blog_posts"
                onInput={(e) => setForm({ ...form, name: (e.target as HTMLInputElement).value })}
                pattern="[a-z_][a-z0-9_]*" required />
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
              <div>
                <label class="label">التسمية (EN)</label>
                <input class="input" value={form.label} placeholder="Blog Posts"
                  onInput={(e) => setForm({ ...form, label: (e.target as HTMLInputElement).value })} required />
              </div>
              <div>
                <label class="label">التسمية (AR)</label>
                <input class="input" value={form.label_ar} placeholder="المقالات"
                  onInput={(e) => setForm({ ...form, label_ar: (e.target as HTMLInputElement).value })} required />
              </div>
            </div>
            {error && <div style="background:#fff8f8;border:1px solid #fecaca;border-radius:6px;padding:10px 12px;font-size:13px;color:#c62828;">{error}</div>}
          </form>
        </Modal>
      )}
    </Layout>
  )
}
