import { h } from 'preact'
import { useState } from 'preact/hooks'
import { route } from 'preact-router'
import { api } from '../lib/api'
import { login } from '../lib/store'

export function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [mode, setMode]         = useState<'login' | 'signup'>('login')

  async function handleSubmit(e: Event) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const body = mode === 'login' ? { email, password } : { name, email, password }
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/signup'
      const res = await api.post<{ token: string }>(endpoint, body)
      login(res.token)
      route('/stores')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style="min-height:100vh; display:flex; background:#f8f8f7;" dir="rtl">
      {/* Left: branding strip */}
      <div style="
        display:none;
        width:360px; flex-shrink:0;
        background:#1c1c1c;
        padding:48px 40px;
        flex-direction:column;
        justify-content:space-between;
      " class="lg-show">
        <div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:48px;">
            <div style="width:32px;height:32px;background:white;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#1c1c1c;font-family:'Inter',sans-serif;">M</div>
            <span style="font-size:15px;font-weight:700;color:white;letter-spacing:-.2px;">Manzoom</span>
          </div>
          <h2 style="font-size:22px;font-weight:700;color:white;line-height:1.4;margin-bottom:12px;">
            منصة إدارة متاجرك الإلكترونية
          </h2>
          <p style="font-size:14px;color:#888;line-height:1.7;">
            قاعدة بيانات، إدارة محتوى، وواجهة برمجية تلقائية — كل ذلك في مكان واحد.
          </p>
        </div>
        <div style="display:flex;flex-direction:column;gap:14px;">
          {[
            'API تلقائي لكل مجموعة بيانات',
            'دعم كامل للعربية والـ RTL',
            'إدارة المنتجات والطلبات والعملاء',
          ].map(f => (
            <div key={f} style="display:flex;align-items:center;gap:10px;">
              <div style="width:18px;height:18px;border-radius:50%;background:#333;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <span style="font-size:13px;color:#999;">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: form */}
      <div style="flex:1; display:flex; align-items:center; justify-content:center; padding:32px;">
        <div style="width:100%; max-width:360px;">

          {/* Logo (mobile) */}
          <div style="text-align:center; margin-bottom:36px;" class="lg-hidden">
            <div style="width:36px;height:36px;background:#1c1c1c;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:white;margin:0 auto 10px;font-family:'Inter',sans-serif;">M</div>
            <span style="font-size:16px;font-weight:700;color:#1c1c1c;">Manzoom</span>
          </div>

          <h1 style="font-size:20px;font-weight:700;color:#1c1c1c;margin-bottom:6px;">
            {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}
          </h1>
          <p style="font-size:13px;color:#8f8f8f;margin-bottom:28px;">
            {mode === 'login'
              ? 'أدخل بريدك الإلكتروني وكلمة المرور'
              : 'أنشئ حسابك وابدأ في إدارة متجرك'}
          </p>

          <form onSubmit={handleSubmit} style="display:flex;flex-direction:column;gap:16px;">
            {mode === 'signup' && (
              <div>
                <label class="label">الاسم الكامل</label>
                <input
                  class="input"
                  type="text"
                  placeholder="علي محمد"
                  value={name}
                  onInput={(e) => setName((e.target as HTMLInputElement).value)}
                  required
                />
              </div>
            )}

            <div>
              <label class="label">البريد الإلكتروني</label>
              <input
                class="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
                required
                autocomplete="email"
                style="direction:ltr;text-align:right;"
              />
            </div>

            <div>
              <label class="label">كلمة المرور</label>
              <input
                class="input"
                type="password"
                placeholder={mode === 'login' ? '••••••••' : '8 أحرف على الأقل'}
                value={password}
                onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
                required
                minLength={8}
                style="direction:ltr;text-align:right;"
              />
            </div>

            {error && (
              <div style="
                background:#fff8f8; border:1px solid #fecaca;
                border-radius:7px; padding:10px 13px;
                font-size:13px; color:#c62828;
                display:flex; align-items:flex-start; gap:8px;
              ">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top:1px;flex-shrink:0;">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              class="btn-primary"
              disabled={loading}
              style="height:38px; font-size:14px; margin-top:4px;"
            >
              {loading
                ? 'جاري التحميل...'
                : mode === 'login' ? 'تسجيل الدخول' : 'إنشاء الحساب'}
            </button>
          </form>

          <p style="font-size:13px; color:#8f8f8f; text-align:center; margin-top:24px;">
            {mode === 'login' ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}{' '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
              style="color:#1c1c1c; font-weight:600; background:none; border:none; cursor:pointer; font-size:13px;"
            >
              {mode === 'login' ? 'إنشاء حساب' : 'تسجيل الدخول'}
            </button>
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .lg-show { display: flex !important; }
          .lg-hidden { display: none !important; }
        }
      `}</style>
    </div>
  )
}
