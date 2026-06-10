import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { route } from 'preact-router'
import { api } from '../lib/api'
import { t } from '../lib/i18n'
import { Layout } from '../components/Layout'
import { PageHeader } from '../components/PageHeader'

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
