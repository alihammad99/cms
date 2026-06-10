import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { api } from '../lib/api'
import { t } from '../lib/i18n'
import { Layout } from '../components/Layout'
import { PageHeader } from '../components/PageHeader'
import { Modal } from '../components/Modal'

const FIELD_TYPES = [
  'text', 'long_text', 'number', 'integer', 'boolean',
  'enum', 'json', 'timestamp', 'relation', 'media',
] as const

export function SchemaEditorPage({ storeSlug, collection }: { storeSlug: string; collection: string }) {
  const [systemFields, setSystemFields] = useState<any[]>([])
  const [customFields, setCustomFields] = useState<any[]>([])
  const [colInfo, setColInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    field: '',
    type: 'text' as typeof FIELD_TYPES[number],
    required: false,
    label: '',
    label_ar: '',
    enum_options: '',
    relation_collection: '',
    default_value: '',
  })

  useEffect(() => {
    api
      .get<{ collection: any; system_fields: any[]; custom_fields: any[] }>(
        `/${storeSlug}/schema/${collection}`
      )
      .then((res) => {
        setColInfo(res.collection)
        setSystemFields(res.system_fields ?? [])
        setCustomFields(res.custom_fields ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [storeSlug, collection])

  async function handleAddField(e: Event) {
    e.preventDefault()
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        field: form.field,
        type: form.type,
        required: form.required,
        label: form.label,
        label_ar: form.label_ar,
      }
      if (form.enum_options) body.enum_options = form.enum_options
      if (form.relation_collection) body.relation_collection = form.relation_collection
      if (form.default_value) body.default_value = form.default_value

      const res = await api.post<{ field: any }>(`/${storeSlug}/schema/${collection}/fields`, body)
      setCustomFields([...customFields, res.field])
      setShowAdd(false)
      setForm({ field: '', type: 'text', required: false, label: '', label_ar: '', enum_options: '', relation_collection: '', default_value: '' })
    } catch {}
    setSaving(false)
  }

  async function handleDeleteField(fieldName: string) {
    if (!confirm(t('confirm_delete'))) return
    try {
      await api.delete(`/${storeSlug}/schema/${collection}/fields/${fieldName}`)
      setCustomFields(customFields.filter((f) => f.field !== fieldName))
    } catch {}
  }

  async function toggleRealtime() {
    if (!colInfo) return
    const newVal = !colInfo.realtime
    await api.patch(`/${storeSlug}/schema/${collection}`, { realtime: newVal })
    setColInfo({ ...colInfo, realtime: newVal })
  }

  return (
    <Layout storeSlug={storeSlug}>
      <div class="p-8 max-w-3xl">
        <PageHeader
          title={`${t('schema')}: ${collection}`}
          actions={
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-2 cursor-pointer">
                <span class="text-sm text-gray-600">{t('realtime')}</span>
                <div
                  onClick={toggleRealtime}
                  class={`relative w-10 h-6 rounded-full transition-colors ${colInfo?.realtime ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <div class={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${colInfo?.realtime ? 'start-5' : 'start-1'}`} />
                </div>
              </label>
              <button onClick={() => setShowAdd(true)} class="btn-primary">
                + {t('add')} {t('field_name')}
              </button>
            </div>
          }
        />

        {loading ? (
          <div class="text-gray-400">{t('loading')}</div>
        ) : (
          <div class="space-y-6">
            {/* System fields */}
            <div class="card overflow-hidden">
              <div class="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                <span class="text-sm font-semibold text-gray-700">حقول النظام</span>
                <span class="badge-gray">مقفلة</span>
              </div>
              <table class="w-full text-sm">
                <thead class="border-b border-gray-100">
                  <tr>
                    <th class="px-6 py-3 text-start text-xs font-semibold text-gray-500">{t('field_name')}</th>
                    <th class="px-6 py-3 text-start text-xs font-semibold text-gray-500">{t('field_type')}</th>
                    <th class="px-6 py-3 text-start text-xs font-semibold text-gray-500">التسمية</th>
                    <th class="px-6 py-3 text-start text-xs font-semibold text-gray-500">{t('required')}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  {systemFields.map((f) => (
                    <tr key={f.field} class="bg-gray-50/50">
                      <td class="px-6 py-3">
                        <div class="flex items-center gap-2">
                          <span class="font-mono text-gray-700">{f.field}</span>
                          <span class="text-gray-300">🔒</span>
                        </div>
                      </td>
                      <td class="px-6 py-3"><span class="badge-gray">{f.type}</span></td>
                      <td class="px-6 py-3 text-gray-600">{f.label_ar}</td>
                      <td class="px-6 py-3">{f.required ? '✓' : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Custom fields */}
            <div class="card overflow-hidden">
              <div class="px-6 py-3 bg-white border-b border-gray-200">
                <span class="text-sm font-semibold text-gray-700">الحقول المخصصة</span>
              </div>
              {customFields.length === 0 ? (
                <div class="py-10 text-center text-gray-400 text-sm">
                  لا توجد حقول مخصصة بعد
                </div>
              ) : (
                <table class="w-full text-sm">
                  <thead class="border-b border-gray-100">
                    <tr>
                      <th class="px-6 py-3 text-start text-xs font-semibold text-gray-500">{t('field_name')}</th>
                      <th class="px-6 py-3 text-start text-xs font-semibold text-gray-500">{t('field_type')}</th>
                      <th class="px-6 py-3 text-start text-xs font-semibold text-gray-500">التسمية</th>
                      <th class="px-6 py-3 text-start text-xs font-semibold text-gray-500">{t('required')}</th>
                      <th class="px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-50">
                    {customFields.map((f) => (
                      <tr key={f.field}>
                        <td class="px-6 py-3 font-mono text-gray-700">{f.field}</td>
                        <td class="px-6 py-3"><span class="badge-gray">{f.type}</span></td>
                        <td class="px-6 py-3 text-gray-600">{f.label_ar}</td>
                        <td class="px-6 py-3">{f.required ? '✓' : '—'}</td>
                        <td class="px-6 py-3 text-end">
                          <button
                            onClick={() => handleDeleteField(f.field)}
                            class="text-red-500 hover:text-red-700 text-xs"
                          >
                            {t('delete')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {showAdd && (
          <Modal
            title={`إضافة حقل إلى ${collection}`}
            onClose={() => setShowAdd(false)}
            footer={
              <>
                <button onClick={() => setShowAdd(false)} class="btn-secondary">{t('cancel')}</button>
                <button onClick={handleAddField} class="btn-primary" disabled={saving}>
                  {saving ? t('loading') : t('add')}
                </button>
              </>
            }
          >
            <form onSubmit={handleAddField} class="space-y-4">
              <div>
                <label class="label">{t('field_name')} (snake_case)</label>
                <input
                  class="input font-mono"
                  value={form.field}
                  onInput={(e) => setForm({ ...form, field: (e.target as HTMLInputElement).value })}
                  pattern="[a-z_][a-z0-9_]*"
                  required
                />
              </div>
              <div>
                <label class="label">{t('field_type')}</label>
                <select
                  class="input"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: (e.target as HTMLSelectElement).value as any })}
                >
                  {FIELD_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="label">التسمية (EN)</label>
                  <input class="input" value={form.label} onInput={(e) => setForm({ ...form, label: (e.target as HTMLInputElement).value })} required />
                </div>
                <div>
                  <label class="label">التسمية (AR)</label>
                  <input class="input" value={form.label_ar} onInput={(e) => setForm({ ...form, label_ar: (e.target as HTMLInputElement).value })} required />
                </div>
              </div>
              {form.type === 'enum' && (
                <div>
                  <label class="label">الخيارات (مفصولة بفاصلة)</label>
                  <input class="input" value={form.enum_options} onInput={(e) => setForm({ ...form, enum_options: (e.target as HTMLInputElement).value })} placeholder="draft,active,archived" />
                </div>
              )}
              {form.type === 'relation' && (
                <div>
                  <label class="label">المجموعة المرتبطة</label>
                  <input class="input" value={form.relation_collection} onInput={(e) => setForm({ ...form, relation_collection: (e.target as HTMLInputElement).value })} />
                </div>
              )}
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.required}
                  onChange={(e) => setForm({ ...form, required: (e.target as HTMLInputElement).checked })}
                  class="w-4 h-4"
                />
                <span class="text-sm">{t('required')}</span>
              </label>
            </form>
          </Modal>
        )}
      </div>
    </Layout>
  )
}
