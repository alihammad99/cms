import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { api } from '../lib/api'
import { t } from '../lib/i18n'
import { Layout } from '../components/Layout'
import { PageHeader } from '../components/PageHeader'
import { CURRENCIES } from '@manzoom/config'

export function SettingsPage({ storeSlug }: { storeSlug: string }) {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api
      .get<{ settings: Record<string, string> }>(`/${storeSlug}/settings`)
      .then((res) => setSettings(res.settings))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [storeSlug])

  async function handleSave(e: Event) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch(`/${storeSlug}/settings`, settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
    setSaving(false)
  }

  return (
    <Layout storeSlug={storeSlug}>
      <div class="p-8 max-w-2xl">
        <PageHeader title={t('settings')} />

        {loading ? (
          <div class="text-gray-400">{t('loading')}</div>
        ) : (
          <form onSubmit={handleSave} class="space-y-6">
            <div class="card p-6 space-y-5">
              <h2 class="font-semibold text-gray-900 border-b border-gray-100 pb-3">إعدادات المتجر</h2>

              <div>
                <label class="label">{t('currency')}</label>
                <select
                  class="input"
                  value={settings.currency ?? 'SAR'}
                  onChange={(e) =>
                    setSettings({ ...settings, currency: (e.target as HTMLSelectElement).value })
                  }
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label class="label">المنطقة الزمنية</label>
                <input
                  class="input"
                  value={settings.timezone ?? 'Asia/Riyadh'}
                  onInput={(e) =>
                    setSettings({ ...settings, timezone: (e.target as HTMLInputElement).value })
                  }
                />
              </div>
            </div>

            <div class="card p-6 space-y-5">
              <h2 class="font-semibold text-gray-900 border-b border-gray-100 pb-3">إعدادات العملاء</h2>

              <label class="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() =>
                    setSettings({
                      ...settings,
                      customer_auth_required:
                        settings.customer_auth_required === 'true' ? 'false' : 'true',
                    })
                  }
                  class={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${
                    settings.customer_auth_required === 'true' ? 'bg-brand-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    class={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                      settings.customer_auth_required === 'true' ? 'start-5' : 'start-1'
                    }`}
                  />
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    تسجيل الدخول مطلوب للعملاء
                  </div>
                  <div class="text-xs text-gray-500">
                    إذا كان مفعلاً، يجب على العملاء تسجيل الدخول بـ OTP قبل إتمام الطلب
                  </div>
                </div>
              </label>
            </div>

            <div class="flex items-center gap-3">
              <button type="submit" class="btn-primary" disabled={saving}>
                {saving ? t('loading') : t('save')}
              </button>
              {saved && (
                <span class="text-sm text-green-600 font-medium">تم الحفظ ✓</span>
              )}
            </div>
          </form>
        )}
      </div>
    </Layout>
  )
}
