import { h } from 'preact'
import { useState, useEffect, useRef } from 'preact/hooks'
import { api } from '../lib/api'
import { Layout } from '../components/Layout'

interface MediaItem { id: string; filename: string; mime_type: string; size: number; url: string; created_at: string }

function fmt(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes/1024).toFixed(1)} KB`
  return `${(bytes/1048576).toFixed(1)} MB`
}

function FileIcon({ mime }: { mime: string }) {
  if (mime.startsWith('image/')) return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
    </svg>
  )
  if (mime === 'application/pdf') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    </svg>
  )
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
    </svg>
  )
}

export function MediaPage({ storeSlug }: { storeSlug: string }) {
  const [media, setMedia]       = useState<MediaItem[]>([])
  const [loading, setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadMedia() }, [storeSlug])

  async function loadMedia() {
    setLoading(true)
    const r = await api.get<{ media: MediaItem[] }>(`/${storeSlug}/media`).catch(() => ({ media: [] }))
    setMedia(r.media ?? [])
    setLoading(false)
  }

  async function handleUpload(e: Event) {
    const files = (e.target as HTMLInputElement).files
    if (!files?.length) return
    setUploading(true)
    const token = localStorage.getItem('mz_token')
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      const r = await fetch(`/api/${storeSlug}/media/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      }).then(r => r.json()).catch(() => null)
      if (r?.media) setMedia(prev => [r.media, ...prev])
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleDelete(item: MediaItem) {
    if (!confirm('حذف هذا الملف؟')) return
    await api.delete(`/${storeSlug}/media/${item.id}`)
    setMedia(m => m.filter(x => x.id !== item.id))
    if (selected === item.id) setSelected(null)
  }

  function copyUrl(item: MediaItem) {
    navigator.clipboard.writeText(item.url)
    setCopiedId(item.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const selectedItem = selected ? media.find(m => m.id === selected) : null

  return (
    <Layout storeSlug={storeSlug}>
      <div style="display:flex; height:100vh; overflow:hidden;">

        {/* Main area */}
        <div style="flex:1; overflow:auto; padding:28px 32px;">

          {/* Header */}
          <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:24px;">
            <div>
              <h1 style="font-size:18px;font-weight:700;color:#1c1c1c;margin-bottom:3px;">الوسائط</h1>
              <p style="font-size:13px;color:#a0a0a0;">{loading ? '' : `${media.length} ملف`}</p>
            </div>
            <label style={`display:inline-flex;align-items:center;gap:6px;cursor:${uploading?'not-allowed':'pointer'};`}>
              <span class="btn-primary" style="gap:6px;pointer-events:none;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
                {uploading ? 'جاري الرفع...' : 'رفع ملفات'}
              </span>
              <input ref={fileRef} type="file" multiple accept="image/*,video/mp4,application/pdf"
                style="display:none;" onChange={handleUpload} disabled={uploading} />
            </label>
          </div>

          {loading ? (
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;">
              {[...Array(12)].map((_, i) => (
                <div key={i} class="card skeleton" style="aspect-ratio:1;" />
              ))}
            </div>
          ) : media.length === 0 ? (
            <label style="
              display:flex; flex-direction:column; align-items:center; justify-content:center;
              border:1.5px dashed #d4d4d2; border-radius:10px;
              padding:80px 20px; cursor:pointer;
              transition:border-color .15s, background .15s;
            "
              onMouseOver={(e: any) => { e.currentTarget.style.borderColor='#a0a0a0'; e.currentTarget.style.background='#fafaf9' }}
              onMouseOut={(e: any) => { e.currentTarget.style.borderColor='#d4d4d2'; e.currentTarget.style.background='transparent' }}
            >
              <div style="width:44px;height:44px;background:#f0f0ef;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#a0a0a0;margin-bottom:14px;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
              </div>
              <p style="font-size:14px;font-weight:500;color:#6f6f6f;margin-bottom:4px;">اسحب الملفات هنا أو اضغط للرفع</p>
              <p style="font-size:12px;color:#b0b0b0;">PNG, JPG, WebP, PDF, MP4</p>
              <input type="file" multiple accept="image/*,video/mp4,application/pdf" style="display:none;" onChange={handleUpload} />
            </label>
          ) : (
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;">
              {/* Upload tile */}
              <label style="
                aspect-ratio:1; border:1.5px dashed #d4d4d2; border-radius:8px;
                display:flex; flex-direction:column; align-items:center; justify-content:center;
                cursor:pointer; transition:border-color .15s, background .15s; gap:6px;
                color:#b0b0b0;
              "
                onMouseOver={(e: any) => { e.currentTarget.style.borderColor='#a0a0a0'; e.currentTarget.style.background='#fafaf9'; e.currentTarget.style.color='#6f6f6f' }}
                onMouseOut={(e: any) => { e.currentTarget.style.borderColor='#d4d4d2'; e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#b0b0b0' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
                <span style="font-size:12px;font-weight:500;">رفع</span>
                <input type="file" multiple accept="image/*,video/mp4,application/pdf" style="display:none;" onChange={handleUpload} />
              </label>

              {media.map((item) => {
                const isImg = item.mime_type.startsWith('image/')
                const isSel = selected === item.id
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelected(isSel ? null : item.id)}
                    style={`
                      position:relative; cursor:pointer;
                      border-radius:8px; overflow:hidden;
                      box-shadow:${isSel ? '0 0 0 2px #1c1c1c' : '0 0 0 1px #e8e8e7'};
                      transition:box-shadow .15s;
                      background:white;
                    `}
                  >
                    <div style="aspect-ratio:1; background:#f8f8f7; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                      {isImg
                        ? <img src={item.url} alt={item.filename} style="width:100%;height:100%;object-fit:cover;" loading="lazy" />
                        : <div style="color:#b0b0b0;"><FileIcon mime={item.mime_type} /></div>
                      }
                    </div>
                    <div style="padding:8px 9px;">
                      <div style="font-size:11px;font-weight:500;color:#1c1c1c;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{item.filename}</div>
                      <div style="font-size:10px;color:#b0b0b0;margin-top:2px;">{fmt(item.size)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedItem && (
          <div style="
            width:260px; flex-shrink:0;
            border-right:1px solid #e8e8e7;
            background:white;
            overflow:auto;
            display:flex; flex-direction:column;
          ">
            {/* Preview */}
            <div style="aspect-ratio:1; background:#f8f8f7; display:flex; align-items:center; justify-content:center; border-bottom:1px solid #f0f0ef; overflow:hidden;">
              {selectedItem.mime_type.startsWith('image/')
                ? <img src={selectedItem.url} alt={selectedItem.filename} style="max-width:100%;max-height:100%;object-fit:contain;" />
                : <div style="color:#c0c0c0;"><FileIcon mime={selectedItem.mime_type} /></div>
              }
            </div>

            <div style="padding:16px; flex:1;">
              <div style="font-size:13px;font-weight:600;color:#1c1c1c;margin-bottom:12px;word-break:break-all;">{selectedItem.filename}</div>
              <div style="display:flex;flex-direction:column;gap:8px;">
                {[
                  { label: 'الحجم', value: fmt(selectedItem.size) },
                  { label: 'النوع', value: selectedItem.mime_type },
                  { label: 'التاريخ', value: selectedItem.created_at?.slice(0,10) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style="font-size:11px;color:#a0a0a0;margin-bottom:2px;">{label}</div>
                    <div style="font-size:12px;color:#374151;font-family:monospace;">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style="padding:12px 16px; border-top:1px solid #f0f0ef; display:flex;flex-direction:column;gap:6px;">
              <button
                onClick={() => copyUrl(selectedItem)}
                class="btn-secondary"
                style="width:100%; justify-content:center; gap:6px;"
              >
                {copiedId === selectedItem.id
                  ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> تم النسخ</>
                  : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> نسخ الرابط</>
                }
              </button>
              <button
                onClick={() => handleDelete(selectedItem)}
                class="btn-danger"
                style="width:100%; justify-content:center; gap:6px;"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                حذف
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
