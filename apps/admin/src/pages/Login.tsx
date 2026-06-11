import { h } from "preact";
import { useState } from "preact/hooks";
import { route } from "preact-router";
import { api } from "../lib/api";
import { login } from "../lib/store";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");

  async function handleSubmit(e: Event) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body =
        mode === "login" ? { email, password } : { name, email, password };
      const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";
      const res = await api.post<{ token: string }>(endpoint, body);
      login(res.token);
      route("/stores");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style="min-height:100vh; display:flex; background:#f8fafc;" dir="rtl">
      {/* Left: branding strip */}
      <div
        style="
        display:none;
        width:380px; flex-shrink:0;
        background:linear-gradient(180deg,#0f172a,#1e293b);
        padding:48px 40px;
        flex-direction:column;
        justify-content:space-between;
      "
        class="lg-show"
      >
        <div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:48px;">
            <div style="width:34px;height:34px;background:white;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:#0f172a;font-family:'Inter',sans-serif;">
              M
            </div>
            <span style="font-size:16px;font-weight:700;color:white;letter-spacing:-.2px;">
              Manzoom
            </span>
          </div>
          <h2 style="font-size:24px;font-weight:700;color:white;line-height:1.4;margin-bottom:12px;">
            منصة إدارة متاجرك الإلكترونية
          </h2>
          <p style="font-size:14px;color:#94a3b8;line-height:1.7;">
            قاعدة بيانات، إدارة محتوى، وواجهة برمجية تلقائية — كل ذلك في مكان
            واحد.
          </p>
        </div>
        <div style="display:flex;flex-direction:column;gap:14px;">
          {[
            "API تلقائي لكل مجموعة بيانات",
            "دعم كامل للعربية والـ RTL",
            "إدارة المنتجات والطلبات والعملاء",
          ].map((f) => (
            <div key={f} style="display:flex;align-items:center;gap:10px;">
              <div style="width:20px;height:20px;border-radius:50%;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6366f1"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span style="font-size:13.5px;color:#cbd5e1;">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: form */}
      <div style="flex:1; display:flex; align-items:center; justify-content:center; padding:32px;">
        <div style="width:100%; max-width:360px;">
          {/* Logo (mobile) */}
          <div style="text-align:center; margin-bottom:36px;" class="lg-hidden">
            <div style="width:40px;height:40px;background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:white;margin:0 auto 10px;font-family:'Inter',sans-serif;">
              M
            </div>
            <span style="font-size:17px;font-weight:700;color:#0f172a;">
              Manzoom
            </span>
          </div>

          <h1 style="font-size:22px;font-weight:700;color:#0f172a;margin-bottom:6px;">
            {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"}
          </h1>
          <p style="font-size:14px;color:#64748b;margin-bottom:28px;">
            {mode === "login"
              ? "أدخل بريدك الإلكتروني وكلمة المرور"
              : "أنشئ حسابك وابدأ في إدارة متجرك"}
          </p>

          <form
            onSubmit={handleSubmit}
            style="display:flex;flex-direction:column;gap:16px;"
          >
            {mode === "signup" && (
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
                placeholder={mode === "login" ? "••••••••" : "8 أحرف على الأقل"}
                value={password}
                onInput={(e) =>
                  setPassword((e.target as HTMLInputElement).value)
                }
                required
                minLength={8}
                style="direction:ltr;text-align:right;"
              />
            </div>

            {error && (
              <div
                style="
                background:#fef2f2; border:1px solid #fecaca;
                border-radius:8px; padding:10px 14px;
                font-size:13px; color:#dc2626;
                display:flex; align-items:flex-start; gap:8px;
              "
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  style="margin-top:1px;flex-shrink:0;"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
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
                ? "جاري التحميل..."
                : mode === "login"
                  ? "تسجيل الدخول"
                  : "إنشاء الحساب"}
            </button>
          </form>

          <p style="font-size:14px; color:#64748b; text-align:center; margin-top:24px;">
            {mode === "login" ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}{" "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
              }}
              style="color:#4338ca; font-weight:600; background:none; border:none; cursor:pointer; font-size:14px;"
            >
              {mode === "login" ? "إنشاء حساب" : "تسجيل الدخول"}
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
  );
}
