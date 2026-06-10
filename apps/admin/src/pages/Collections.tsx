import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { route } from 'preact-router'
import { api } from '../lib/api'
import { Layout } from '../components/Layout'

interface Row extends Record<string, unknown> { id: string }

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  active:      { label: 'نشط',    color: '#166534', bg: '#dcfce7' },
  draft:       { label: 'مسودة',  color: '#6f6f6f', bg: '#f0f0ef' },
  archived:    { label: 'مؤرشف', color: '#6f6f6f', bg: '#f0f0ef' },
  pending:     { label: 'معلق',   color: '#92400e', bg: '#fef9c3' },
  confirmed:   { label: 'مؤكد',   color: '#1d4ed8', bg: '#dbeafe' },
  shipped:     { label: 'مشحون',  color: '#0369a1', bg: '#e0f2fe' },
  delivered:   { label: 'مسلّم',  color: '#166534', bg: '#dcfce7' },
  cancelled:   { label: 'ملغي',   color: '#991b1b', bg: '#fee2e2' },
  refunded:    { label: 'مسترجع', color: '#6b21a8', bg: '#f3e8ff' },
}

export function CollectionPage({ storeSlug, collection }: { storeSlug: string; collection: string }) {
  const [data, setData]       = useState<Row[]>([])
  const [total, setTotal]     = useState(0)
  const [columns, setColumns] = useState<{ key: string; label: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState('')
  const perPage = 20

  function load(p = page) {
    setLoading(true)
    Promise.all([
      api.get<{ data: Row[]; total: number }>(`/${storeSlug}/collections/${collection}?page=${p}&per_page=${perPage}`),
      api.get<{ system_fields: any[]; custom_fields: any[] }>(`/${storeSlug}/schema/${collection}`),
    ])
      .then(([records, schema]) => {
        setData(records.data)
        setTotal(records.total)
        const sys = (schema.system_fields ?? [])
          .filter((f: any) => !['hashed_password','otp_code','otp_expires_at'].includes(f.field))
          .slice(0, 6)
          .map((f: any) => ({ key: f.field, label: f.label_ar || f.label }))
        const custom = (schema.custom_fields ?? []).slice(0, 3)
          .map((f: any) => ({ key: f.field, label: f.label_ar || f.label }))
        setColumns([...sys, ...custom])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(1); setPage(1) }, [storeSlug, collection])

  async function handleDelete(e: MouseEvent, row: Row) {
    e.stopPropagation()
    if (!confirm('حذف هذا السجل؟')) return
    await api.delete(`/${storeSlug}/collections/${collection}/${row.id}`)
    setData(d => d.filter(r => r.id !== row.id))
    setTotal(t => t - 1)
  }

  const filtered = search
    ? data.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(search.toLowerCase())))
    : data

  const totalPages = Math.ceil(total / perPage)

  function cell(val: unknown): string {
    if (val === null || val === undefined) return '—'
    if (typeof val === 'boolean') return val ? 'نعم' : 'لا'
    const s = String(val)
    if (s.startsWith('{') || s.startsWith('[')) { try { return JSON.stringify(JSON.parse(s)).slice(0, 40) + '…' } catch {} }
    return s.length > 60 ? s.slice(0, 60) + '…' : s || '—'
  }

  return (
    <Layout storeSlug={storeSlug}>
      <div style="padding:28px 32px;">

        {/* Header */}
        <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:24px;">
          <div>
            <div style="font-size:12px;color:#a0a0a0;margin-bottom:4px;">
              <button onClick={() => route(`/stores/${storeSlug}/collections`)}
                style="background:none;border:none;cursor:pointer;color:#a0a0a0;font-size:12px;padding:0;"
                onMouseOver={(e: any) => e.currentTarget.style.color='#1c1c1c'}
                onMouseOut={(e: any) => e.currentTarget.style.color='#a0a0a0'}
              >المجموعات</button>
              {' / '}
              <span style="color:#6f6f6f;">{collection}</span>
            </div>
            <h1 style="font-size:18px;font-weight:700;color:#1c1c1c;display:flex;align-items:center;gap:10px;">
              {collection}
              {!loading && <span style="font-size:13px;font-weight:400;color:#b0b0b0;">{total.toLocaleString('ar')} سجل</span>}
            </h1>
          </div>
          <div style="display:flex;gap:8px;align-items:center;">
            <button
              onClick={() => route(`/stores/${storeSlug}/schema/${collection}`)}
              class="btn-secondary"
              style="gap:6px; font-size:12px;"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              هيكل البيانات
            </button>
            <button
              onClick={() => route(`/stores/${storeSlug}/collections/${collection}/new`)}
              class="btn-primary"
              style="gap:6px;"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              إضافة سجل
            </button>
          </div>
        </div>

        {/* Search */}
        <div style="margin-bottom:14px;">
          <div style="position:relative;max-width:320px;">
            <svg style="position:absolute;top:50%;transform:translateY(-50%);right:10px;color:#b0b0b0;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              class="input"
              style="padding-right:34px;"
              placeholder="بحث..."
              value={search}
              onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
            />
          </div>
        </div>

        {/* Table */}
        <div class="card" style="overflow:hidden;">
          <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;min-width:560px;">
              <thead>
                <tr style="border-bottom:1px solid #f0f0ef;">
                  {columns.map(col => (
                    <th key={col.key} class="th">{col.label}</th>
                  ))}
                  <th class="th" style="width:80px;text-align:left;" />
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [...Array(8)].map((_, i) => (
                    <tr key={i}>
                      {columns.map(c => (
                        <td key={c.key} class="td">
                          <div class="skeleton" style={`height:12px;width:${35+Math.random()*45}%;`} />
                        </td>
                      ))}
                      <td class="td" />
                    </tr>
                  ))
                  : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={columns.length + 1} style="padding:60px;text-align:center;font-size:13px;color:#c0c0c0;">
                        لا توجد سجلات بعد
                      </td>
                    </tr>
                  )
                  : filtered.map((row, i) => (
                    <tr
                      key={row.id}
                      onClick={() => route(`/stores/${storeSlug}/collections/${collection}/${row.id}`)}
                      style="cursor:pointer;transition:background .1s;"
                      class="row-hover"
                      onMouseOver={(e: any) => e.currentTarget.style.background='#fafaf9'}
                      onMouseOut={(e: any) => e.currentTarget.style.background='transparent'}
                    >
                      {columns.map(col => (
                        <td key={col.key} class="td">
                          {col.key === 'status' && STATUS_STYLE[String(row[col.key] ?? '')] ? (
                            (() => {
                              const st = STATUS_STYLE[String(row[col.key])]
                              return <span style={`font-size:11px;font-weight:500;padding:2px 8px;border-radius:20px;color:${st.color};background:${st.bg};`}>{st.label}</span>
                            })()
                          ) : (
                            <span style="color:#374151;">{cell(row[col.key])}</span>
                          )}
                        </td>
                      ))}
                      <td class="td" onClick={(e: any) => e.stopPropagation()}>
                        <div style="display:flex;align-items:center;gap:4px;opacity:0;transition:opacity .1s;" class="row-actions">
                          <button
                            onClick={() => route(`/stores/${storeSlug}/collections/${collection}/${row.id}`)}
                            style="width:26px;height:26px;border-radius:5px;display:flex;align-items:center;justify-content:center;background:transparent;border:none;cursor:pointer;color:#a0a0a0;transition:background .1s,color .1s;"
                            onMouseOver={(e: any) => { e.currentTarget.style.background='#f0f0ef'; e.currentTarget.style.color='#1c1c1c' }}
                            onMouseOut={(e: any) => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#a0a0a0' }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button
                            onClick={(e: any) => handleDelete(e, row)}
                            style="width:26px;height:26px;border-radius:5px;display:flex;align-items:center;justify-content:center;background:transparent;border:none;cursor:pointer;color:#a0a0a0;transition:background .1s,color .1s;"
                            onMouseOver={(e: any) => { e.currentTarget.style.background='#fff0f0'; e.currentTarget.style.color='#c62828' }}
                            onMouseOut={(e: any) => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#a0a0a0' }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-top:1px solid #f0f0ef;">
              <span style="font-size:12px;color:#a0a0a0;">
                {(page-1)*perPage+1}–{Math.min(page*perPage, total)} من {total}
              </span>
              <div style="display:flex;align-items:center;gap:4px;">
                <button onClick={() => { setPage(p => p-1); load(page-1) }} disabled={page===1} class="btn-ghost" style="padding:0 10px;height:28px;font-size:12px;disabled:opacity-30;">السابق</button>
                <span style="font-size:12px;color:#a0a0a0;padding:0 8px;">{page} / {totalPages}</span>
                <button onClick={() => { setPage(p => p+1); load(page+1) }} disabled={page>=totalPages} class="btn-ghost" style="padding:0 10px;height:28px;font-size:12px;">التالي</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        tr:hover .row-actions { opacity: 1 !important; }
      `}</style>
    </Layout>
  )
}
