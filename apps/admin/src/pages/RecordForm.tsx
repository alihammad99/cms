import { h } from 'preact'
import { useState, useEffect, useRef } from 'preact/hooks'
import { route } from 'preact-router'
import { api } from '../lib/api'

const API_BASE = (import.meta as any).env?.VITE_API_URL ?? '/api'
import { t } from '../lib/i18n'
import { Layout } from '../components/Layout'
import { PageHeader } from '../components/PageHeader'

// Single image upload (media type)
function SingleImageUpload({ storeSlug, value, onChange }: {
  storeSlug: string; value: string; onChange: (url: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const ref = useRef<HTMLInputElement>(null)

  async function upload(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const token = localStorage.getItem('mz_token') ?? ''
      const res = await fetch(`${API_BASE}/${storeSlug}/media/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      const json = await res.json()
      if (json.media?.url) onChange(json.media.url)
    } catch {}
    finally { setUploading(false) }
  }

  return (
    <div style="display:flex;flex-direction:column;gap:10px;">
      {value && (
        <div style="position:relative;display:inline-block;">
          <img src={value} style="max-height:160px;max-width:100%;border-radius:8px;border:1px solid #e8e8e7;object-fit:cover;" />
          <button
            type="button"
            onClick={() => onChange('')}
            style="position:absolute;top:6px;left:6px;width:22px;height:22px;border-radius:50%;background:rgba(0,0,0,.55);border:none;color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;line-height:1;"
          >×</button>
        </div>
      )}
      <div>
        <input ref={ref} type="file" accept="image/*" style="display:none;" onChange={(e) => {
          const f = (e.target as HTMLInputElement).files?.[0]
          if (f) upload(f)
        }} />
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          style="display:inline-flex;align-items:center;gap:6px;padding:0 12px;height:32px;background:white;border:1px solid #e8e8e7;border-radius:6px;font-size:13px;cursor:pointer;color:#6b6b6b;transition:border-color .15s;"
          onMouseOver={(e: any) => e.currentTarget.style.borderColor='#a0a0a0'}
          onMouseOut={(e: any) => e.currentTarget.style.borderColor='#e8e8e7'}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          {uploading ? 'جاري الرفع...' : value ? 'تغيير الصورة' : 'رفع صورة'}
        </button>
      </div>
    </div>
  )
}

// Multi-image upload (photos/json type)
function MultiImageUpload({ storeSlug, value, onChange }: {
  storeSlug: string; value: string; onChange: (v: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const ref = useRef<HTMLInputElement>(null)

  function parseUrls(v: string): string[] {
    try { const a = JSON.parse(v); return Array.isArray(a) ? a : [] } catch { return [] }
  }
  const urls = parseUrls(value)

  async function upload(files: FileList) {
    setUploading(true)
    const token = localStorage.getItem('mz_token') ?? ''
    const newUrls: string[] = []
    for (const file of Array.from(files)) {
      try {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch(`${API_BASE}/${storeSlug}/media/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        })
        const json = await res.json()
        if (json.media?.url) newUrls.push(json.media.url)
      } catch {}
    }
    onChange(JSON.stringify([...urls, ...newUrls]))
    setUploading(false)
  }

  function remove(i: number) {
    const next = urls.filter((_, idx) => idx !== i)
    onChange(JSON.stringify(next))
  }

  return (
    <div style="display:flex;flex-direction:column;gap:10px;">
      {urls.length > 0 && (
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          {urls.map((url, i) => (
            <div key={i} style="position:relative;">
              <img src={url} style="width:80px;height:80px;border-radius:7px;border:1px solid #e8e8e7;object-fit:cover;" />
              <button
                type="button"
                onClick={() => remove(i)}
                style="position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:rgba(0,0,0,.55);border:none;color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px;line-height:1;"
              >×</button>
            </div>
          ))}
        </div>
      )}
      <div>
        <input ref={ref} type="file" accept="image/*" multiple style="display:none;" onChange={(e) => {
          const fs = (e.target as HTMLInputElement).files
          if (fs?.length) upload(fs)
        }} />
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          style="display:inline-flex;align-items:center;gap:6px;padding:0 12px;height:32px;background:white;border:1px solid #e8e8e7;border-radius:6px;font-size:13px;cursor:pointer;color:#6b6b6b;transition:border-color .15s;"
          onMouseOver={(e: any) => e.currentTarget.style.borderColor='#a0a0a0'}
          onMouseOut={(e: any) => e.currentTarget.style.borderColor='#e8e8e7'}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          {uploading ? 'جاري الرفع...' : 'إضافة صور'}
        </button>
      </div>
    </div>
  )
}

export function RecordFormPage({
  storeSlug,
  collection,
  id,
}: {
  storeSlug: string
  collection: string
  id?: string
}) {
  const isNew = !id || id === 'new'
  const [fields, setFields] = useState<any[]>([])
  const [values, setValues] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const schemaPromise = api.get<{ system_fields: any[]; custom_fields: any[] }>(
      `/${storeSlug}/schema/${collection}`
    )
    const recordPromise = isNew
      ? Promise.resolve(null)
      : api.get<{ data: Record<string, unknown> }>(
          `/${storeSlug}/collections/${collection}/${id}`
        )

    Promise.all([schemaPromise, recordPromise])
      .then(([schema, record]) => {
        const allFields = [
          ...(schema.system_fields ?? []).filter(
            (f: any) => !['id', 'created_at', 'updated_at'].includes(f.field)
          ),
          ...(schema.custom_fields ?? []),
        ]
        setFields(allFields)
        if (record) setValues(record.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [storeSlug, collection, id])

  async function handleSubmit(e: Event) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (isNew) {
        await api.post(`/${storeSlug}/collections/${collection}`, values)
      } else {
        await api.patch(`/${storeSlug}/collections/${collection}/${id}`, values)
      }
      route(`/stores/${storeSlug}/collections/${collection}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function renderField(field: any) {
    const val = values[field.field]
    const onChange = (v: unknown) => setValues({ ...values, [field.field]: v })

    const commonProps = {
      id: field.field,
      required: field.required,
    }

    // Single image upload
    if (field.type === 'media') {
      return (
        <SingleImageUpload
          storeSlug={storeSlug}
          value={String(val ?? '')}
          onChange={(url) => onChange(url)}
        />
      )
    }

    // Multi-image upload (photos field or json field named *image* / *photo*)
    if (field.type === 'json' && /photo|image/i.test(field.field)) {
      return (
        <MultiImageUpload
          storeSlug={storeSlug}
          value={String(val ?? '[]')}
          onChange={(v) => onChange(v)}
        />
      )
    }

    if (field.type === 'boolean') {
      return (
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={!!val}
            onChange={(e) => onChange((e.target as HTMLInputElement).checked)}
            class="w-4 h-4 rounded border-gray-300 text-brand-600"
          />
          <span class="text-sm text-gray-700">{field.label_ar ?? field.label}</span>
        </label>
      )
    }

    if (field.type === 'long_text') {
      return (
        <textarea
          {...commonProps}
          class="input min-h-24"
          value={String(val ?? '')}
          onInput={(e) => onChange((e.target as HTMLTextAreaElement).value)}
          rows={4}
        />
      )
    }

    if (field.type === 'enum' && field.enum_options) {
      const options = field.enum_options.split(',').map((o: string) => o.trim())
      return (
        <select
          {...commonProps}
          class="input"
          value={String(val ?? '')}
          onChange={(e) => onChange((e.target as HTMLSelectElement).value)}
        >
          <option value="">— اختر —</option>
          {options.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )
    }

    const inputType =
      field.type === 'integer' || field.type === 'number' ? 'number' : 'text'

    return (
      <input
        {...commonProps}
        class="input"
        type={inputType}
        value={String(val ?? '')}
        onInput={(e) => onChange((e.target as HTMLInputElement).value)}
        step={field.type === 'number' ? 'any' : undefined}
      />
    )
  }

  return (
    <Layout storeSlug={storeSlug}>
      <div class="p-8 max-w-2xl">
        <PageHeader
          title={isNew ? `إضافة ${collection}` : `تعديل ${collection}`}
          actions={
            <button
              onClick={() => route(`/stores/${storeSlug}/collections/${collection}`)}
              class="btn-secondary"
            >
              ← رجوع
            </button>
          }
        />

        {loading ? (
          <div class="text-gray-400">{t('loading')}</div>
        ) : (
          <form onSubmit={handleSubmit} class="card p-6 space-y-5">
            {fields.map((field) => (
              <div key={field.field}>
                <label for={field.field} class="label">
                  {field.label_ar ?? field.label}
                  {field.required && <span class="text-red-500 ms-1">*</span>}
                </label>
                {renderField(field)}
              </div>
            ))}

            {error && (
              <div class="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div class="flex gap-3 pt-2">
              <button type="submit" class="btn-primary" disabled={saving}>
                {saving ? t('loading') : t('save')}
              </button>
              <button
                type="button"
                onClick={() => route(`/stores/${storeSlug}/collections/${collection}`)}
                class="btn-secondary"
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  )
}
