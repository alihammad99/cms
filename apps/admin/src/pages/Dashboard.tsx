import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { route } from 'preact-router'
import { api } from '../lib/api'
import { currentStore } from '../lib/store'
import { Layout } from '../components/Layout'

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'معلق',   color: '#92400e', bg: '#fef9c3' },
  confirmed: { label: 'مؤكد',   color: '#1d4ed8', bg: '#dbeafe' },
  shipped:   { label: 'مشحون',  color: '#0369a1', bg: '#e0f2fe' },
  delivered: { label: 'مسلّم',  color: '#166534', bg: '#dcfce7' },
  cancelled: { label: 'ملغي',   color: '#991b1b', bg: '#fee2e2' },
  refunded:  { label: 'مسترجع', color: '#6b21a8', bg: '#f3e8ff' },
}

function fmt(cents: number) {
  return (cents / 100).toLocaleString('ar-SA', { minimumFractionDigits: 0 })
}

function timeAgo(iso: string) {
  if (!iso) return ''
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'الآن'
  if (mins < 60) return `${mins} د`
  if (mins < 1440) return `${Math.floor(mins/60)} س`
  return `${Math.floor(mins/1440)} ي`
}

export function DashboardPage({ storeSlug }: { storeSlug: string }) {
  const store = currentStore.value
  const [orders, setOrders]     = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!storeSlug) return
    Promise.all([
      api.get<{ data: any[] }>(`/${storeSlug}/collections/orders?per_page=100&sort=created_at&order=desc`).catch(() => ({ data: [] })),
      api.get<{ data: any[] }>(`/${storeSlug}/collections/products?per_page=200`).catch(() => ({ data: [] })),
    ]).then(([o, p]) => {
      setOrders(o.data ?? [])
      setProducts(p.data ?? [])
    }).finally(() => setLoading(false))
  }, [storeSlug])

  const today   = new Date().toISOString().slice(0, 10)
  const revenue = orders.filter(o => !['cancelled','refunded'].includes(o.status)).reduce((s,o) => s + (Number(o.total)||0), 0)
  const todayRev = orders.filter(o => o.created_at?.startsWith(today) && !['cancelled','refunded'].includes(o.status)).reduce((s,o) => s + (Number(o.total)||0), 0)
  const pending  = orders.filter(o => o.status === 'pending').length
  const lowStock = products.filter(p => Number(p.stock) <= 5 && p.status === 'active')
  const todayOrders = orders.filter(o => o.created_at?.startsWith(today)).length

  // Pipeline counts
  const pipeline = ['pending','confirmed','shipped','delivered'].map(s => ({
    ...STATUS_META[s],
    key: s,
    count: orders.filter(o => o.status === s).length,
  }))

  return (
    <Layout storeSlug={storeSlug}>
      <div style="padding:28px 32px;">

        {/* Greeting */}
        <div style="margin-bottom:24px;">
          <h1 style="font-size:20px;font-weight:700;color:#1c1c1c;margin-bottom:4px;">
            مرحباً 👋
          </h1>
          <p style="font-size:13px;color:#a0a0a0;">
            {store?.name} — إليك ملخص متجرك اليوم
          </p>
        </div>

        {/* KPI cards */}
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;">
          {[
            {
              label: 'الإيرادات الكلية',
              value: loading ? null : `${fmt(revenue)} ر.س`,
              sub: `${fmt(todayRev)} ر.س اليوم`,
              icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
              accent: '#166534', accentBg: '#dcfce7',
            },
            {
              label: 'إجمالي الطلبات',
              value: loading ? null : orders.length,
              sub: `${todayOrders} طلب اليوم`,
              icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2',
              accent: '#1d4ed8', accentBg: '#dbeafe',
            },
            {
              label: 'طلبات بانتظارك',
              value: loading ? null : pending,
              sub: pending > 0 ? 'بحاجة لمراجعة' : 'لا يوجد معلق',
              icon: 'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
              accent: pending > 0 ? '#92400e' : '#166534',
              accentBg: pending > 0 ? '#fef9c3' : '#dcfce7',
              urgent: pending > 0,
            },
            {
              label: 'منتجات نشطة',
              value: loading ? null : products.filter(p => p.status === 'active').length,
              sub: `${lowStock.length} مخزون منخفض`,
              icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
              accent: lowStock.length > 0 ? '#92400e' : '#6b6b6b',
              accentBg: lowStock.length > 0 ? '#fef9c3' : '#f0f0ef',
            },
          ].map((kpi, i) => (
            <div key={i} style={`
              background:white; border-radius:10px;
              box-shadow:0 0 0 1px ${kpi.urgent ? '#fde68a' : '#e8e8e7'};
              padding:18px 20px;
              ${kpi.urgent ? 'animation:pulse 2s ease-in-out infinite;' : ''}
            `}>
              <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px;">
                <div style={`width:34px;height:34px;border-radius:8px;background:${kpi.accentBg};display:flex;align-items:center;justify-content:center;`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={kpi.accent} stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <path d={kpi.icon}/>
                  </svg>
                </div>
              </div>
              <div style="font-size:24px;font-weight:800;color:#1c1c1c;letter-spacing:-.5px;margin-bottom:4px;font-variant-numeric:tabular-nums;">
                {kpi.value === null
                  ? <div style="width:70px;height:28px;background:#f0f0ef;border-radius:4px;animation:pulse 1.5s infinite;" />
                  : kpi.value
                }
              </div>
              <div style="font-size:12px;font-weight:500;color:#6b6b6b;margin-bottom:2px;">{kpi.label}</div>
              <div style="font-size:11px;color:#b0b0b0;">{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Order pipeline */}
        <div style="background:white;border-radius:10px;box-shadow:0 0 0 1px #e8e8e7;padding:18px 20px;margin-bottom:20px;">
          <h2 style="font-size:13px;font-weight:600;color:#1c1c1c;margin-bottom:14px;">مسار الطلبات</h2>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:2px;">
            {pipeline.map((stage, i) => (
              <div
                key={stage.key}
                onClick={() => route(`/stores/${storeSlug}/orders`)}
                style="cursor:pointer;"
              >
                <div style={`
                  padding:16px;
                  background:${stage.count > 0 ? stage.bg : '#fafaf9'};
                  border-radius:${i===0 ? '8px 0 0 8px' : i===3 ? '0 8px 8px 0' : '0'};
                  border-left:${i>0 ? '1px solid white' : 'none'};
                  text-align:center;
                  transition:opacity .15s;
                `}
                  onMouseOver={(e: any) => e.currentTarget.style.opacity='0.8'}
                  onMouseOut={(e: any) => e.currentTarget.style.opacity='1'}
                >
                  <div style={`font-size:22px;font-weight:800;color:${stage.count > 0 ? stage.color : '#c8c8c8'};margin-bottom:4px;`}>
                    {loading ? '—' : stage.count}
                  </div>
                  <div style={`font-size:12px;font-weight:500;color:${stage.count > 0 ? stage.color : '#c8c8c8'};`}>
                    {stage.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 320px;gap:16px;">

          {/* Recent orders */}
          <div style="background:white;border-radius:10px;box-shadow:0 0 0 1px #e8e8e7;overflow:hidden;">
            <div style="padding:14px 18px;border-bottom:1px solid #f0f0ef;display:flex;align-items:center;justify-content:space-between;">
              <h2 style="font-size:13px;font-weight:600;color:#1c1c1c;">آخر الطلبات</h2>
              <button
                onClick={() => route(`/stores/${storeSlug}/orders`)}
                style="font-size:12px;color:#767676;background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:3px;"
                onMouseOver={(e: any) => e.currentTarget.style.color='#1c1c1c'}
                onMouseOut={(e: any) => e.currentTarget.style.color='#767676'}
              >
                عرض الكل
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>

            {loading ? (
              <div style="padding:12px 18px;display:flex;flex-direction:column;gap:10px;">
                {[1,2,3,4].map(i => (
                  <div key={i} style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid #f8f8f7;">
                    <div style="width:3px;height:28px;border-radius:2px;background:#f0f0ef;" />
                    <div style="flex:1;display:flex;gap:10px;align-items:center;">
                      <div style="width:70px;height:12px;background:#f0f0ef;border-radius:4px;" />
                      <div style="flex:1;height:12px;background:#f0f0ef;border-radius:4px;" />
                    </div>
                    <div style="width:50px;height:20px;background:#f0f0ef;border-radius:12px;" />
                    <div style="width:60px;height:14px;background:#f0f0ef;border-radius:4px;" />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div style="padding:48px;text-align:center;font-size:13px;color:#c0c0c0;">لا توجد طلبات بعد</div>
            ) : (
              <div style="padding:0 18px;">
                {orders.slice(0, 8).map((order, i) => {
                  const st = STATUS_META[order.status] ?? { label: order.status, color: '#767676', bg: '#f0f0ef' }
                  return (
                    <div
                      key={order.id}
                      onClick={() => route(`/stores/${storeSlug}/collections/orders/${order.id}`)}
                      style={`
                        display:flex;align-items:center;gap:14px;
                        padding:12px 0;
                        border-bottom:${i < 7 ? '1px solid #f8f8f7' : 'none'};
                        cursor:pointer;
                      `}
                      onMouseOver={(e: any) => e.currentTarget.style.opacity='0.75'}
                      onMouseOut={(e: any) => e.currentTarget.style.opacity='1'}
                    >
                      <div style={`width:3px;height:32px;border-radius:2px;background:${st.color};flex-shrink:0;`} />
                      <div style="flex-shrink:0;">
                        <div style="font-size:13px;font-weight:700;color:#1c1c1c;font-family:monospace;">#{order.id.slice(-5).toUpperCase()}</div>
                        <div style="font-size:11px;color:#c0c0c0;">{timeAgo(order.created_at)}</div>
                      </div>
                      <div style="flex:1" />
                      <span style={`font-size:11px;font-weight:500;padding:2px 9px;border-radius:20px;color:${st.color};background:${st.bg};flex-shrink:0;`}>
                        {st.label}
                      </span>
                      <div style="font-size:14px;font-weight:700;color:#1c1c1c;font-variant-numeric:tabular-nums;flex-shrink:0;min-width:70px;text-align:left;">
                        {fmt(Number(order.total)||0)} <span style="font-size:10px;font-weight:400;color:#b0b0b0;">ر.س</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right column */}
          <div style="display:flex;flex-direction:column;gap:14px;">

            {/* Quick actions */}
            <div style="background:white;border-radius:10px;box-shadow:0 0 0 1px #e8e8e7;padding:16px 18px;">
              <h2 style="font-size:13px;font-weight:600;color:#1c1c1c;margin-bottom:12px;">إجراءات سريعة</h2>
              <div style="display:flex;flex-direction:column;gap:6px;">
                {[
                  { label: 'إضافة منتج جديد',    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', path: `/stores/${storeSlug}/collections/products/new` },
                  { label: 'عرض الطلبات المعلقة', icon: 'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z', path: `/stores/${storeSlug}/orders` },
                  { label: 'رفع صورة',             icon: 'M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z', path: `/stores/${storeSlug}/media` },
                ].map(a => (
                  <button
                    key={a.label}
                    onClick={() => route(a.path)}
                    style="display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:7px;border:none;background:transparent;cursor:pointer;text-align:right;width:100%;transition:background .1s;"
                    onMouseOver={(e: any) => e.currentTarget.style.background='#f8f8f7'}
                    onMouseOut={(e: any) => e.currentTarget.style.background='transparent'}
                  >
                    <div style="width:28px;height:28px;background:#f0f0ef;border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#767676" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d={a.icon}/></svg>
                    </div>
                    <span style="font-size:13px;color:#374151;font-weight:500;">{a.label}</span>
                    <svg style="margin-right:auto;" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Low stock alert */}
            {lowStock.length > 0 && (
              <div style="background:#fffbeb;border-radius:10px;box-shadow:0 0 0 1px #fde68a;padding:16px 18px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#92400e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <h2 style="font-size:13px;font-weight:600;color:#92400e;">تنبيه مخزون</h2>
                </div>
                {lowStock.slice(0,4).map(p => (
                  <div
                    key={p.id}
                    onClick={() => route(`/stores/${storeSlug}/collections/products/${p.id}`)}
                    style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;cursor:pointer;border-bottom:1px solid #fde68a;"
                    onMouseOver={(e: any) => e.currentTarget.style.opacity='0.7'}
                    onMouseOut={(e: any) => e.currentTarget.style.opacity='1'}
                  >
                    <span style="font-size:13px;color:#78350f;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:170px;">{p.name}</span>
                    <span style="font-size:12px;font-weight:700;color:#92400e;flex-shrink:0;">{p.stock === 0 ? 'نفد' : `${p.stock} متبقٍ`}</span>
                  </div>
                ))}
                {lowStock.length > 4 && (
                  <button onClick={() => route(`/stores/${storeSlug}/products`)} style="margin-top:8px;font-size:12px;color:#92400e;background:none;border:none;cursor:pointer;">
                    +{lowStock.length - 4} منتجات أخرى
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
