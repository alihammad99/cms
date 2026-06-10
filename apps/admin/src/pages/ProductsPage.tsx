import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { route } from 'preact-router'
import { api } from '../lib/api'
import { Layout } from '../components/Layout'

interface Product {
  id: string; name: string; price: number; stock: number
  status: string; description?: string; sku?: string; images?: string
}

function stockStyle(n: number) {
  if (n === 0) return { label: 'نفد المخزون', color: '#991b1b', bg: '#fee2e2' }
  if (n <= 5)  return { label: `${n} متبقٍ`,  color: '#92400e', bg: '#fef9c3' }
  return            { label: `${n} في المخزون`, color: '#166534', bg: '#dcfce7' }
}

function firstImage(images?: string): string | null {
  if (!images) return null
  try {
    const arr = JSON.parse(images)
    return Array.isArray(arr) && arr[0] ? arr[0] : null
  } catch { return images.startsWith('http') ? images : null }
}

export function ProductsPage({ storeSlug }: { storeSlug: string }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState<'all'|'active'|'draft'|'low'>('all')

  useEffect(() => {
    setLoading(true)
    api.get<{ data: Product[] }>(`/${storeSlug}/collections/products?per_page=200`)
      .then(r => setProducts(r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [storeSlug])

  const filtered = products.filter(p => {
    if (search && !p.name?.toLowerCase().includes(search.toLowerCase())) return false
    if (filter === 'active') return p.status === 'active'
    if (filter === 'draft')  return p.status === 'draft'
    if (filter === 'low')    return Number(p.stock) <= 5
    return true
  })

  const counts = {
    all:    products.length,
    active: products.filter(p => p.status === 'active').length,
    draft:  products.filter(p => p.status === 'draft').length,
    low:    products.filter(p => Number(p.stock) <= 5).length,
  }

  return (
    <Layout storeSlug={storeSlug}>
      <div style="padding:28px 32px;">

        {/* Header */}
        <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:20px;">
          <div>
            <h1 style="font-size:18px;font-weight:700;color:#1c1c1c;margin-bottom:3px;">المنتجات</h1>
            <p style="font-size:13px;color:#a0a0a0;">{products.length} منتج</p>
          </div>
          <button
            onClick={() => route(`/stores/${storeSlug}/collections/products/new`)}
            style="display:inline-flex;align-items:center;gap:6px;padding:0 14px;height:34px;background:#1c1c1c;color:white;border:none;border-radius:7px;font-size:13px;font-weight:500;cursor:pointer;"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            إضافة منتج
          </button>
        </div>

        {/* Filters + search */}
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;gap:12px;flex-wrap:wrap;">
          <div style="display:flex;gap:4px;">
            {([
              { key: 'all',    label: 'الكل' },
              { key: 'active', label: 'نشط' },
              { key: 'draft',  label: 'مسودة' },
              { key: 'low',    label: 'مخزون منخفض' },
            ] as const).map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={`
                  display:inline-flex;align-items:center;gap:5px;
                  padding:5px 12px;border-radius:6px;font-size:13px;cursor:pointer;border:none;
                  transition:background .1s;font-weight:${filter === f.key ? '600' : '400'};
                  background:${filter === f.key ? 'white' : 'transparent'};
                  color:${filter === f.key ? '#1c1c1c' : '#767676'};
                  box-shadow:${filter === f.key ? '0 0 0 1px #e2e2e2' : 'none'};
                `}
              >
                {f.label}
                <span style={`font-size:11px;${filter === f.key ? 'color:#1c1c1c;' : 'color:#b0b0b0;'}`}>
                  {counts[f.key]}
                </span>
              </button>
            ))}
          </div>

          <div style="position:relative;">
            <svg style="position:absolute;top:50%;transform:translateY(-50%);right:10px;color:#c0c0c0;" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              value={search}
              onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
              placeholder="بحث عن منتج..."
              style="padding:7px 34px 7px 14px;border-radius:7px;border:1px solid #e8e8e7;font-size:13px;width:220px;outline:none;background:white;transition:border-color .15s;"
              onFocus={(e: any) => e.target.style.borderColor='#1c1c1c'}
              onBlur={(e: any) => e.target.style.borderColor='#e8e8e7'}
            />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style="background:white;border-radius:10px;box-shadow:0 0 0 1px #e8e8e7;overflow:hidden;">
                <div style="height:160px;background:#f0f0ef;animation:pulse 1.5s infinite;" />
                <div style="padding:14px;">
                  <div style="height:13px;background:#f0f0ef;border-radius:4px;margin-bottom:8px;animation:pulse 1.5s infinite;" />
                  <div style="height:11px;background:#f0f0ef;border-radius:4px;width:60%;animation:pulse 1.5s infinite;" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style="text-align:center;padding:80px 0;">
            <div style="width:52px;height:52px;background:#f0f0ef;border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b0b0b0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            </div>
            <p style="font-size:14px;font-weight:500;color:#6b6b6b;margin-bottom:4px;">لا توجد منتجات</p>
            <p style="font-size:13px;color:#b0b0b0;margin-bottom:20px;">أضف منتجك الأول وابدأ البيع</p>
            <button
              onClick={() => route(`/stores/${storeSlug}/collections/products/new`)}
              style="display:inline-flex;align-items:center;gap:6px;padding:8px 18px;background:#1c1c1c;color:white;border:none;border-radius:7px;font-size:13px;font-weight:500;cursor:pointer;"
            >
              إضافة منتج
            </button>
          </div>
        ) : (
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;">
            {filtered.map(p => {
              const img   = firstImage(p.images)
              const stock = stockStyle(Number(p.stock) || 0)
              const price = ((Number(p.price) || 0) / 100).toLocaleString('ar-SA')
              return (
                <div
                  key={p.id}
                  onClick={() => route(`/stores/${storeSlug}/collections/products/${p.id}`)}
                  style="background:white;border-radius:10px;box-shadow:0 0 0 1px #e8e8e7;overflow:hidden;cursor:pointer;transition:box-shadow .15s,transform .1s;"
                  onMouseOver={(e: any) => { e.currentTarget.style.boxShadow='0 0 0 1px #c0bfbe,0 4px 14px rgba(0,0,0,.08)'; e.currentTarget.style.transform='translateY(-2px)' }}
                  onMouseOut={(e: any) => { e.currentTarget.style.boxShadow='0 0 0 1px #e8e8e7'; e.currentTarget.style.transform='' }}
                >
                  {/* Image */}
                  <div style="height:160px;background:#f8f8f7;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;">
                    {img
                      ? <img src={img} alt={p.name} style="width:100%;height:100%;object-fit:cover;" loading="lazy" />
                      : (
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d0d0ce" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                        </svg>
                      )
                    }
                    {/* Status chip */}
                    {p.status !== 'active' && (
                      <div style="position:absolute;top:8px;right:8px;font-size:11px;font-weight:500;padding:2px 8px;border-radius:20px;background:rgba(0,0,0,.5);color:white;">
                        {p.status === 'draft' ? 'مسودة' : p.status}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style="padding:14px 14px 12px;">
                    <div style="font-size:14px;font-weight:600;color:#1c1c1c;margin-bottom:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                      {p.name || 'بدون اسم'}
                    </div>
                    {p.sku && (
                      <div style="font-size:11px;color:#b0b0b0;font-family:monospace;margin-bottom:8px;">{p.sku}</div>
                    )}
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;">
                      <div style="font-size:15px;font-weight:700;color:#1c1c1c;">{price} <span style="font-size:11px;font-weight:400;color:#a0a0a0;">ر.س</span></div>
                      <span style={`font-size:11px;font-weight:500;padding:2px 8px;border-radius:20px;color:${stock.color};background:${stock.bg};`}>
                        {stock.label}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
