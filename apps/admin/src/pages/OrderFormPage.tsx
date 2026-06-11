import { h } from 'preact'
import { useState, useEffect, useRef } from 'preact/hooks'
import { route } from 'preact-router'
import { api } from '../lib/api'
import { Layout } from '../components/Layout'

interface Product { id: string; name: string; price: number; stock: number; sku?: string }
interface Customer { id: string; name: string; email: string; phone?: string }
interface LineItem { product: Product; quantity: number; unit_price: number }

const STATUS_OPTIONS = [
  { value: 'pending',   label: 'معلق' },
  { value: 'confirmed', label: 'مؤكد' },
  { value: 'shipped',   label: 'مشحون' },
  { value: 'delivered', label: 'مسلّم' },
  { value: 'cancelled', label: 'ملغي' },
]

function fmt(cents: number) {
  return (cents / 100).toLocaleString('ar-SA', { minimumFractionDigits: 2 })
}

// ── Product Picker ─────────────────────────────────────────────────────────
function ProductPicker({ storeSlug, onAdd }: { storeSlug: string; onAdd: (p: Product) => void }) {
  const [open, setOpen]         = useState(false)
  const [search, setSearch]     = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    api.get<{ data: Product[] }>(`/${storeSlug}/collections/products?per_page=200`)
      .then(r => setProducts(r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [open, storeSlug])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = products.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div ref={ref} style="position:relative;">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style="display:flex;align-items:center;gap:8px;padding:8px 14px;border-radius:7px;border:1.5px dashed #d4d4d2;background:transparent;cursor:pointer;font-size:13px;font-weight:500;color:#767676;transition:border-color .15s,color .15s,background .15s;width:100%;"
        onMouseOver={(e: any) => { e.currentTarget.style.borderColor='#a0a0a0'; e.currentTarget.style.color='#1c1c1c'; e.currentTarget.style.background='#fafaf9' }}
        onMouseOut={(e: any) => { e.currentTarget.style.borderColor='#d4d4d2'; e.currentTarget.style.color='#767676'; e.currentTarget.style.background='transparent' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        إضافة منتج للطلب
      </button>

      {open && (
        <div style="
          position:absolute; top:calc(100% + 6px); right:0; left:0; z-index:50;
          background:white; border-radius:10px; box-shadow:0 4px 24px rgba(0,0,0,.12),0 0 0 1px #e8e8e7;
          overflow:hidden;
        ">
          {/* Search */}
          <div style="padding:10px;border-bottom:1px solid #f0f0ef;">
            <div style="position:relative;">
              <svg style="position:absolute;top:50%;transform:translateY(-50%);right:10px;color:#c0c0c0;" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                autoFocus
                value={search}
                onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
                placeholder="ابحث عن منتج..."
                style="width:100%;padding:7px 32px 7px 10px;border-radius:6px;border:1px solid #e8e8e7;font-size:13px;outline:none;background:#f8f8f7;"
              />
            </div>
          </div>

          {/* List */}
          <div style="max-height:260px;overflow-y:auto;">
            {loading ? (
              <div style="padding:20px;text-align:center;font-size:13px;color:#c0c0c0;">جاري التحميل...</div>
            ) : filtered.length === 0 ? (
              <div style="padding:20px;text-align:center;font-size:13px;color:#c0c0c0;">لا توجد منتجات</div>
            ) : (
              filtered.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { onAdd(p); setOpen(false); setSearch('') }}
                  style="display:flex;align-items:center;gap:12px;width:100%;padding:10px 14px;background:transparent;border:none;cursor:pointer;text-align:right;transition:background .1s;border-bottom:1px solid #f8f8f7;"
                  onMouseOver={(e: any) => e.currentTarget.style.background='#f8f8f7'}
                  onMouseOut={(e: any) => e.currentTarget.style.background='transparent'}
                >
                  {/* Product icon */}
                  <div style="width:34px;height:34px;border-radius:7px;background:#f0f0ef;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a0a0a0" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                  </div>
                  <div style="flex:1;min-width:0;">
                    <div style="font-size:13px;font-weight:500;color:#1c1c1c;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{p.name}</div>
                    {p.sku && <div style="font-size:11px;color:#b0b0b0;font-family:monospace;">{p.sku}</div>}
                  </div>
                  <div style="text-align:left;flex-shrink:0;">
                    <div style="font-size:13px;font-weight:600;color:#1c1c1c;">{fmt(Number(p.price)||0)} <span style="font-size:10px;color:#b0b0b0;">ر.س</span></div>
                    <div style="font-size:11px;color:#b0b0b0;">{Number(p.stock)||0} متاح</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Customer Search ────────────────────────────────────────────────────────
function CustomerSearch({ storeSlug, value, onChange }: {
  storeSlug: string; value: string; onChange: (id: string, name: string) => void
}) {
  const [open, setOpen]         = useState(false)
  const [search, setSearch]     = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selected, setSelected] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.get<{ data: Customer[] }>(`/${storeSlug}/collections/customers?per_page=200`)
      .then(r => setCustomers(r.data ?? []))
      .catch(() => {})
  }, [storeSlug])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = customers.filter(c =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  )

  return (
    <div ref={ref} style="position:relative;">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={`
          display:flex;align-items:center;gap:8px;width:100%;
          padding:8px 12px;border-radius:7px;
          border:1px solid ${selected ? '#1c1c1c' : '#e8e8e7'};
          background:white;cursor:pointer;text-align:right;
          font-size:13px;transition:border-color .15s;
        `}
        onMouseOver={(e: any) => { if (!selected) e.currentTarget.style.borderColor='#c0c0c0' }}
        onMouseOut={(e: any) => { if (!selected) e.currentTarget.style.borderColor='#e8e8e7' }}
      >
        <div style="width:22px;height:22px;border-radius:50%;background:#f0f0ef;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#a0a0a0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <span style={`flex:1;color:${selected ? '#1c1c1c' : '#a8a8a8'};`}>{selected || 'اختر عميلاً (اختياري)'}</span>
        {selected && (
          <button
            type="button"
            onClick={(e: any) => { e.stopPropagation(); setSelected(''); onChange('', '') }}
            style="padding:2px;border-radius:4px;border:none;background:transparent;cursor:pointer;color:#b0b0b0;"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
      </button>

      {open && (
        <div style="position:absolute;top:calc(100%+6px);right:0;left:0;z-index:50;background:white;border-radius:10px;box-shadow:0 4px 24px rgba(0,0,0,.12),0 0 0 1px #e8e8e7;overflow:hidden;">
          <div style="padding:10px;border-bottom:1px solid #f0f0ef;">
            <input
              autoFocus
              value={search}
              onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
              placeholder="ابحث بالاسم أو الجوال..."
              style="width:100%;padding:7px 10px;border-radius:6px;border:1px solid #e8e8e7;font-size:13px;outline:none;background:#f8f8f7;"
            />
          </div>
          <div style="max-height:200px;overflow-y:auto;">
            {filtered.length === 0 ? (
              <div style="padding:16px;text-align:center;font-size:13px;color:#c0c0c0;">لا يوجد عملاء</div>
            ) : (
              filtered.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { setSelected(c.name || c.email); onChange(c.id, c.name); setOpen(false); setSearch('') }}
                  style="display:flex;align-items:center;gap:10px;width:100%;padding:10px 14px;background:transparent;border:none;cursor:pointer;text-align:right;transition:background .1s;border-bottom:1px solid #f8f8f7;"
                  onMouseOver={(e: any) => e.currentTarget.style.background='#f8f8f7'}
                  onMouseOut={(e: any) => e.currentTarget.style.background='transparent'}
                >
                  <div style="width:30px;height:30px;border-radius:50%;background:#1c1c1c;color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;flex-shrink:0;">
                    {(c.name || c.email || '?').charAt(0).toUpperCase()}
                  </div>
                  <div style="flex:1;min-width:0;">
                    <div style="font-size:13px;font-weight:500;color:#1c1c1c;">{c.name || '—'}</div>
                    <div style="font-size:11px;color:#b0b0b0;">{c.phone || c.email}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Form ──────────────────────────────────────────────────────────────
export function OrderFormPage({ storeSlug, id }: { storeSlug: string; id: string }) {
  const isNew = !id || id === 'new'

  const [items, setItems]         = useState<LineItem[]>([])
  const [customerId, setCustomerId] = useState('')
  const [status, setStatus]       = useState('pending')
  const [notes, setNotes]         = useState('')
  const [currency]                = useState('SAR')
  const [saving, setSaving]       = useState(false)
  const [loading, setLoading]     = useState(!isNew)
  const [error, setError]         = useState('')

  useEffect(() => {
    if (isNew) return
    setLoading(true)
    api.get<{ data: any }>(`/${storeSlug}/collections/orders/${id}`)
      .then(r => {
        const d = r.data
        setStatus(d.status ?? 'pending')
        setNotes(d.notes ?? '')
        setCustomerId(d.customer_id ?? '')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [storeSlug, id])

  function addProduct(p: Product) {
    const existing = items.findIndex(i => i.product.id === p.id)
    if (existing >= 0) {
      const updated = [...items]
      updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + 1 }
      setItems(updated)
    } else {
      setItems([...items, { product: p, quantity: 1, unit_price: Number(p.price) || 0 }])
    }
  }

  function updateQty(index: number, qty: number) {
    if (qty < 1) return removeItem(index)
    const updated = [...items]
    updated[index] = { ...updated[index], quantity: qty }
    setItems(updated)
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  const subtotal = items.reduce((s, i) => s + i.unit_price * i.quantity, 0)

  async function handleSubmit(e: Event) {
    e.preventDefault()
    if (isNew && items.length === 0) { setError('أضف منتجاً واحداً على الأقل'); return }
    setError('')
    setSaving(true)
    try {
      const payload = {
        customer_id: customerId || null,
        status,
        total: subtotal,
        currency,
        notes: notes || null,
      }
      if (isNew) {
        const res = await api.post<{ data: any }>(`/${storeSlug}/collections/orders`, payload)
        const orderId = res.data?.id
        if (orderId) {
          await Promise.all(items.map(item =>
            api.post(`/${storeSlug}/collections/order_items`, {
              order_id: orderId,
              product_id: item.product.id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total: item.unit_price * item.quantity,
            })
          ))
        }
      } else {
        await api.patch(`/${storeSlug}/collections/orders/${id}`, payload)
      }
      route(`/stores/${storeSlug}/orders`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <Layout storeSlug={storeSlug}>
      <div style="padding:28px 32px;font-size:13px;color:#b0b0b0;">جاري التحميل...</div>
    </Layout>
  )

  return (
    <Layout storeSlug={storeSlug}>
      <div style="padding:28px 32px;max-width:760px;">

        {/* Header */}
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
          <button
            onClick={() => route(`/stores/${storeSlug}/orders`)}
            style="width:32px;height:32px;border-radius:7px;border:1px solid #e8e8e7;background:white;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#767676;transition:border-color .15s;"
            onMouseOver={(e: any) => e.currentTarget.style.borderColor='#a0a0a0'}
            onMouseOut={(e: any) => e.currentTarget.style.borderColor='#e8e8e7'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div>
            <h1 style="font-size:18px;font-weight:700;color:#1c1c1c;">{isNew ? 'طلب جديد' : `تعديل الطلب`}</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} style="display:flex;flex-direction:column;gap:14px;">

          {/* Products section — only on new */}
          {isNew && (
            <div style="background:white;border-radius:10px;box-shadow:0 0 0 1px #e8e8e7;overflow:hidden;">
              <div style="padding:14px 18px;border-bottom:1px solid #f0f0ef;">
                <h2 style="font-size:13px;font-weight:600;color:#1c1c1c;">المنتجات</h2>
              </div>
              <div style="padding:14px 18px;">

                {/* Line items */}
                {items.length > 0 && (
                  <div style="margin-bottom:12px;display:flex;flex-direction:column;gap:2px;">
                    {items.map((item, i) => (
                      <div key={item.product.id} style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:8px;background:#f8f8f7;">
                        <div style="width:32px;height:32px;border-radius:7px;background:#f0f0ef;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a0a0a0" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                        </div>
                        <div style="flex:1;min-width:0;">
                          <div style="font-size:13px;font-weight:500;color:#1c1c1c;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{item.product.name}</div>
                          <div style="font-size:11px;color:#b0b0b0;">{fmt(item.unit_price)} ر.س / الوحدة</div>
                        </div>

                        {/* Qty controls */}
                        <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                          <button type="button" onClick={() => updateQty(i, item.quantity - 1)}
                            style="width:24px;height:24px;border-radius:6px;border:1px solid #e8e8e7;background:white;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;color:#6b6b6b;line-height:1;">−</button>
                          <span style="font-size:13px;font-weight:600;color:#1c1c1c;min-width:20px;text-align:center;">{item.quantity}</span>
                          <button type="button" onClick={() => updateQty(i, item.quantity + 1)}
                            style="width:24px;height:24px;border-radius:6px;border:1px solid #e8e8e7;background:white;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;color:#6b6b6b;line-height:1;">+</button>
                        </div>

                        <div style="font-size:13px;font-weight:700;color:#1c1c1c;min-width:80px;text-align:left;flex-shrink:0;">
                          {fmt(item.unit_price * item.quantity)} ر.س
                        </div>

                        <button type="button" onClick={() => removeItem(i)}
                          style="width:24px;height:24px;border-radius:6px;border:none;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#c0c0c0;transition:color .1s,background .1s;"
                          onMouseOver={(e: any) => { e.currentTarget.style.color='#c62828'; e.currentTarget.style.background='#fff0f0' }}
                          onMouseOut={(e: any) => { e.currentTarget.style.color='#c0c0c0'; e.currentTarget.style.background='transparent' }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        </button>
                      </div>
                    ))}

                    {/* Subtotal */}
                    <div style="display:flex;justify-content:space-between;padding:10px 12px;margin-top:4px;">
                      <span style="font-size:13px;color:#767676;">الإجمالي</span>
                      <span style="font-size:15px;font-weight:700;color:#1c1c1c;">{fmt(subtotal)} <span style="font-size:11px;font-weight:400;color:#b0b0b0;">ر.س</span></span>
                    </div>
                  </div>
                )}

                <ProductPicker storeSlug={storeSlug} onAdd={addProduct} />
              </div>
            </div>
          )}

          {/* Customer + Status */}
          <div style="background:white;border-radius:10px;box-shadow:0 0 0 1px #e8e8e7;overflow:hidden;">
            <div style="padding:14px 18px;border-bottom:1px solid #f0f0ef;">
              <h2 style="font-size:13px;font-weight:600;color:#1c1c1c;">تفاصيل الطلب</h2>
            </div>
            <div style="padding:16px 18px;display:flex;flex-direction:column;gap:14px;">

              <div>
                <label style="display:block;font-size:12px;font-weight:500;color:#767676;margin-bottom:6px;">العميل</label>
                <CustomerSearch storeSlug={storeSlug} value={customerId} onChange={(id) => setCustomerId(id)} />
              </div>

              <div>
                <label style="display:block;font-size:12px;font-weight:500;color:#767676;margin-bottom:6px;">حالة الطلب</label>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                  {STATUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStatus(opt.value)}
                      style={`
                        padding:6px 14px;border-radius:20px;font-size:13px;font-weight:500;cursor:pointer;border:1px solid;transition:all .1s;
                        ${status === opt.value
                          ? 'background:#1c1c1c;color:white;border-color:#1c1c1c;'
                          : 'background:white;color:#767676;border-color:#e8e8e7;'
                        }
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style="display:block;font-size:12px;font-weight:500;color:#767676;margin-bottom:6px;">ملاحظات</label>
                <textarea
                  value={notes}
                  onInput={(e) => setNotes((e.target as HTMLTextAreaElement).value)}
                  placeholder="أي ملاحظات إضافية للطلب..."
                  rows={3}
                  style="width:100%;padding:9px 12px;border-radius:7px;border:1px solid #e8e8e7;font-size:13px;outline:none;resize:vertical;font-family:inherit;transition:border-color .15s;"
                  onFocus={(e: any) => e.target.style.borderColor='#1c1c1c'}
                  onBlur={(e: any) => e.target.style.borderColor='#e8e8e7'}
                />
              </div>
            </div>
          </div>

          {error && (
            <div style="background:#fff8f8;border:1px solid #fecaca;border-radius:7px;padding:10px 14px;font-size:13px;color:#c62828;">
              {error}
            </div>
          )}

          {/* Actions */}
          <div style="display:flex;gap:8px;">
            <button
              type="submit"
              disabled={saving}
              style="padding:0 20px;height:36px;background:#1c1c1c;color:white;border:none;border-radius:7px;font-size:13px;font-weight:500;cursor:pointer;opacity:${saving?'.5':'1'};"
            >
              {saving ? 'جاري الحفظ...' : isNew ? 'إنشاء الطلب' : 'حفظ التغييرات'}
            </button>
            <button
              type="button"
              onClick={() => route(`/stores/${storeSlug}/orders`)}
              style="padding:0 16px;height:36px;background:white;border:1px solid #e8e8e7;border-radius:7px;font-size:13px;color:#767676;cursor:pointer;transition:border-color .15s;"
              onMouseOver={(e: any) => e.currentTarget.style.borderColor='#a0a0a0'}
              onMouseOut={(e: any) => e.currentTarget.style.borderColor='#e8e8e7'}
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
