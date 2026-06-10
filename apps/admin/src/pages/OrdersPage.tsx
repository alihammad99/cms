import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { route } from 'preact-router'
import { api } from '../lib/api'
import { Layout } from '../components/Layout'

interface Order {
  id: string; status: string; total: number; currency: string
  customer_id: string; created_at: string; notes?: string
}

const STATUSES: { key: string; label: string; color: string; bg: string; border: string }[] = [
  { key: 'all',       label: 'الكل',     color: '#6b6b6b', bg: '#f0f0ef', border: '#e0e0de' },
  { key: 'pending',   label: 'معلق',     color: '#92400e', bg: '#fef9c3', border: '#fde68a' },
  { key: 'confirmed', label: 'مؤكد',     color: '#1d4ed8', bg: '#dbeafe', border: '#bfdbfe' },
  { key: 'shipped',   label: 'مشحون',    color: '#0369a1', bg: '#e0f2fe', border: '#bae6fd' },
  { key: 'delivered', label: 'مسلّم',    color: '#166534', bg: '#dcfce7', border: '#bbf7d0' },
  { key: 'cancelled', label: 'ملغي',     color: '#991b1b', bg: '#fee2e2', border: '#fecaca' },
]

const ST = Object.fromEntries(STATUSES.map(s => [s.key, s]))

function fmt(cents: number) {
  return (cents / 100).toLocaleString('ar-SA', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

function timeAgo(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const mins = Math.floor((now.getTime() - d.getTime()) / 60000)
  if (mins < 1) return 'الآن'
  if (mins < 60) return `منذ ${mins} دقيقة`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `منذ ${hrs} ساعة`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `منذ ${days} يوم`
  return d.toLocaleDateString('ar-SA')
}

export function OrdersPage({ storeSlug }: { storeSlug: string }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    setLoading(true)
    api.get<{ data: Order[]; total: number }>(`/${storeSlug}/collections/orders?per_page=100&sort=created_at&order=desc`)
      .then(r => setOrders(r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [storeSlug])

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)
  const counts = Object.fromEntries(STATUSES.map(s => [s.key, s.key === 'all' ? orders.length : orders.filter(o => o.status === s.key).length]))

  return (
    <Layout storeSlug={storeSlug}>
      <div style="padding:28px 32px;">

        {/* Header */}
        <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:20px;">
          <div>
            <h1 style="font-size:18px;font-weight:700;color:#1c1c1c;margin-bottom:3px;">الطلبات</h1>
            <p style="font-size:13px;color:#a0a0a0;">{orders.length} طلب إجمالاً</p>
          </div>
          <button
            onClick={() => route(`/stores/${storeSlug}/collections/orders/new`)}
            style="display:inline-flex;align-items:center;gap:6px;padding:0 14px;height:34px;background:#1c1c1c;color:white;border:none;border-radius:7px;font-size:13px;font-weight:500;cursor:pointer;"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            طلب جديد
          </button>
        </div>

        {/* Status filter tabs */}
        <div style="display:flex;gap:6px;margin-bottom:20px;flex-wrap:wrap;">
          {STATUSES.map(s => (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              style={`
                display:inline-flex;align-items:center;gap:6px;
                padding:5px 12px;border-radius:20px;font-size:13px;font-weight:500;
                cursor:pointer;border:1px solid;transition:all .1s;
                ${filter === s.key
                  ? `background:${s.bg};color:${s.color};border-color:${s.border};`
                  : 'background:white;color:#6b6b6b;border-color:#e8e8e7;'
                }
              `}
            >
              {s.label}
              {counts[s.key] > 0 && (
                <span style={`
                  font-size:11px;font-weight:600;min-width:18px;height:18px;
                  border-radius:9px;display:flex;align-items:center;justify-content:center;
                  padding:0 5px;
                  ${filter === s.key ? `background:${s.color};color:white;` : 'background:#f0f0ef;color:#767676;'}
                `}>
                  {counts[s.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders */}
        {loading ? (
          <div style="display:flex;flex-direction:column;gap:8px;">
            {[1,2,3,4,5].map(i => (
              <div key={i} style="background:white;border-radius:8px;box-shadow:0 0 0 1px #e8e8e7;padding:16px 20px;display:flex;align-items:center;gap:16px;">
                <div style="width:60px;height:12px;background:#f0f0ef;border-radius:4px;animation:pulse 1.5s infinite;" />
                <div style="flex:1;height:12px;background:#f0f0ef;border-radius:4px;animation:pulse 1.5s infinite;" />
                <div style="width:60px;height:22px;background:#f0f0ef;border-radius:12px;animation:pulse 1.5s infinite;" />
                <div style="width:80px;height:12px;background:#f0f0ef;border-radius:4px;animation:pulse 1.5s infinite;" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style="text-align:center;padding:80px 0;">
            <div style="font-size:32px;margin-bottom:12px;">🛒</div>
            <p style="font-size:14px;font-weight:500;color:#6b6b6b;margin-bottom:4px;">
              {filter === 'all' ? 'لا توجد طلبات بعد' : `لا توجد طلبات ${ST[filter]?.label ?? ''}`}
            </p>
            <p style="font-size:13px;color:#b0b0b0;">ستظهر هنا الطلبات الواردة من متجرك</p>
          </div>
        ) : (
          <div style="display:flex;flex-direction:column;gap:6px;">
            {filtered.map(order => {
              const st = ST[order.status] ?? ST.all
              return (
                <div
                  key={order.id}
                  onClick={() => route(`/stores/${storeSlug}/collections/orders/${order.id}`)}
                  style={`
                    background:white;border-radius:8px;
                    box-shadow:0 0 0 1px #e8e8e7;
                    padding:14px 20px;
                    display:flex;align-items:center;gap:20px;
                    cursor:pointer;transition:box-shadow .15s;
                  `}
                  onMouseOver={(e: any) => e.currentTarget.style.boxShadow='0 0 0 1px #c0bfbe,0 2px 8px rgba(0,0,0,.06)'}
                  onMouseOut={(e: any) => e.currentTarget.style.boxShadow='0 0 0 1px #e8e8e7'}
                >
                  {/* Status accent bar */}
                  <div style={`width:3px;height:36px;border-radius:2px;background:${st.color};flex-shrink:0;`} />

                  {/* Order number */}
                  <div style="flex-shrink:0;min-width:80px;">
                    <div style="font-size:13px;font-weight:700;color:#1c1c1c;font-family:monospace;">
                      #{order.id.slice(-6).toUpperCase()}
                    </div>
                    <div style="font-size:11px;color:#b0b0b0;margin-top:2px;">{timeAgo(order.created_at)}</div>
                  </div>

                  {/* Customer placeholder */}
                  <div style="flex:1;min-width:0;">
                    <div style="font-size:13px;color:#6b6b6b;">
                      {order.notes ? order.notes.slice(0, 60) : 'لا توجد ملاحظات'}
                    </div>
                  </div>

                  {/* Status */}
                  <span style={`
                    font-size:12px;font-weight:500;
                    padding:3px 10px;border-radius:20px;
                    color:${st.color};background:${st.bg};
                    flex-shrink:0;
                  `}>
                    {st.label}
                  </span>

                  {/* Total */}
                  <div style="text-align:left;flex-shrink:0;min-width:90px;">
                    <div style="font-size:15px;font-weight:700;color:#1c1c1c;font-variant-numeric:tabular-nums;">
                      {fmt(Number(order.total) || 0)}
                    </div>
                    <div style="font-size:11px;color:#b0b0b0;">{order.currency || 'SAR'}</div>
                  </div>

                  {/* Arrow */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c8c8c8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
