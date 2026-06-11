import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { route } from "preact-router";
import { api } from "../lib/api";
import { selectStore, logout } from "../lib/store";
import { Modal } from "../components/Modal";
import { IconPlus, IconLogOut } from "../components/Icons";

interface StoreItem {
  id: string;
  name: string;
  slug: string;
  plan: string;
  created_at: string;
}

const PLAN_LABEL: Record<string, string> = {
  free: "مجاني",
  starter: "مبتدئ",
  pro: "احترافي",
  agency: "وكالة",
};

export function StoresPage() {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", admin_password: "" });
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api
      .get<{ stores: StoreItem[] }>("/stores")
      .then((r) => setStores(r.stores))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleNameChange(name: string) {
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    setForm({ ...form, name, slug });
  }

  async function handleCreate(e: Event) {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      const res = await api.post<{ store: StoreItem }>("/stores", form);
      setStores([...stores, res.store]);
      setShowCreate(false);
      setForm({ name: "", slug: "", admin_password: "" });
      selectStore(res.store);
      route(`/stores/${res.store.slug}/dashboard`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  function openStore(store: StoreItem) {
    selectStore(store);
    route(`/stores/${store.slug}/dashboard`);
  }

  return (
    <div style="min-height:100vh; background:#f8fafc;" dir="rtl">
      {/* Top bar */}
      <div style="background:white; border-bottom:1px solid #e2e8f0; height:56px; display:flex; align-items:center; padding:0 24px; justify-content:space-between; position:sticky; top:0; z-index:10;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:30px;height:30px;background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:white;font-family:'Inter',sans-serif;">
            M
          </div>
          <span style="font-size:15px; font-weight:700; color:#0f172a; letter-spacing:-.2px;">
            Manzoom
          </span>
        </div>
        <button
          onClick={() => {
            logout();
            route("/login");
          }}
          style="display:flex;align-items:center;gap:6px;font-size:13px;color:#94a3b8;background:none;border:none;cursor:pointer;padding:6px 10px;border-radius:8px;transition:background .15s,color .15s;"
          onMouseOver={(e: any) => {
            e.currentTarget.style.background = "#f1f5f9";
            e.currentTarget.style.color = "#0f172a";
          }}
          onMouseOut={(e: any) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#94a3b8";
          }}
        >
          <IconLogOut size={14} />
          خروج
        </button>
      </div>

      {/* Content */}
      <div style="max-width:880px; margin:0 auto; padding:48px 24px;">
        <div style="display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:32px;">
          <div>
            <h1 style="font-size:24px; font-weight:700; color:#0f172a; margin-bottom:4px;">
              المتاجر
            </h1>
            <p style="font-size:14px; color:#64748b;">
              اختر متجراً للبدء أو أنشئ متجراً جديداً
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            class="btn-primary"
            style="gap:6px;"
          >
            <IconPlus size={14} />
            متجر جديد
          </button>
        </div>

        {loading ? (
          <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:12px;">
            {[1, 2, 3].map((i) => (
              <div key={i} class="card" style="padding:20px; height:120px;">
                <div
                  class="skeleton"
                  style="width:36px;height:36px;border-radius:8px;margin-bottom:16px;"
                />
                <div
                  class="skeleton"
                  style="width:60%;height:13px;margin-bottom:8px;"
                />
                <div class="skeleton" style="width:40%;height:11px;" />
              </div>
            ))}
          </div>
        ) : stores.length === 0 ? (
          <div style="text-align:center;padding:80px 0;">
            <div style="width:52px;height:52px;background:#f1f5f9;border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#94a3b8"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <h3 style="font-size:16px;font-weight:600;color:#0f172a;margin-bottom:6px;">
              لا توجد متاجر بعد
            </h3>
            <p style="font-size:14px;color:#64748b;margin-bottom:24px;">
              أنشئ متجرك الأول وابدأ في إدارة منتجاتك
            </p>
            <button onClick={() => setShowCreate(true)} class="btn-primary">
              إنشاء متجر
            </button>
          </div>
        ) : (
          <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:10px;">
            {stores.map((store) => (
              <button
                key={store.id}
                onClick={() => openStore(store)}
                class="card-hover"
                style="padding:22px; text-align:right; border:none; display:block; width:100%;"
              >
                <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px;">
                  <div style="width:40px;height:40px;background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-size:15px;font-weight:700;font-family:'Inter',sans-serif;flex-shrink:0;box-shadow:0 1px 4px rgba(15,23,42,0.2);">
                    {store.name.charAt(0).toUpperCase()}
                  </div>
                  <span
                    class={`badge ${store.plan === "pro" || store.plan === "agency" ? "badge-indigo" : "badge-gray"}`}
                  >
                    {PLAN_LABEL[store.plan] ?? store.plan}
                  </span>
                </div>
                <div style="font-size:15px; font-weight:600; color:#0f172a; margin-bottom:3px;">
                  {store.name}
                </div>
                <div style="font-size:12px; color:#94a3b8; font-family:monospace;">
                  {store.slug}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <Modal
          title="إنشاء متجر جديد"
          onClose={() => {
            setShowCreate(false);
            setError("");
          }}
          footer={
            <>
              <button
                onClick={() => setShowCreate(false)}
                class="btn-secondary"
              >
                إلغاء
              </button>
              <button
                onClick={handleCreate}
                class="btn-primary"
                disabled={creating}
              >
                {creating ? "جاري الإنشاء..." : "إنشاء المتجر"}
              </button>
            </>
          }
        >
          <form
            onSubmit={handleCreate}
            style="display:flex;flex-direction:column;gap:14px;"
          >
            <div>
              <label class="label">اسم المتجر</label>
              <input
                class="input"
                value={form.name}
                onInput={(e) =>
                  handleNameChange((e.target as HTMLInputElement).value)
                }
                placeholder="مثال: متجر الإلكترونيات"
                required
              />
            </div>
            <div>
              <label class="label">الرابط المختصر</label>
              <div
                style="display:flex;align-items:center;box-shadow:0 0 0 1px #e2e2e2 inset;border-radius:6px;overflow:hidden;transition:box-shadow .1s;"
                onFocusCapture={(e: any) =>
                  (e.currentTarget.style.boxShadow =
                    "0 0 0 1.5px #1c1c1c inset")
                }
                onBlurCapture={(e: any) =>
                  (e.currentTarget.style.boxShadow = "0 0 0 1px #e2e2e2 inset")
                }
              >
                <span style="padding:7px 12px;font-size:13px;color:#a0a0a0;background:#f8f8f7;border-left:1px solid #e2e2e2;white-space:nowrap;user-select:none;">
                  store/
                </span>
                <input
                  style="flex:1;padding:7px 10px;font-size:13px;outline:none;border:none;font-family:monospace;background:white;direction:ltr;"
                  value={form.slug}
                  onInput={(e) =>
                    setForm({
                      ...form,
                      slug: (e.target as HTMLInputElement).value,
                    })
                  }
                  pattern="[a-z0-9-]+"
                  required
                />
              </div>
              <p style="font-size:11px;color:#a0a0a0;margin-top:5px;">
                أحرف صغيرة وأرقام وشرطة فقط
              </p>
            </div>
            <div>
              <label class="label">كلمة مرور المدير</label>
              <input
                class="input"
                type="password"
                value={form.admin_password}
                onInput={(e) =>
                  setForm({
                    ...form,
                    admin_password: (e.target as HTMLInputElement).value,
                  })
                }
                placeholder="8 أحرف على الأقل"
                required
                minLength={8}
              />
            </div>
            {error && (
              <div style="background:#fff8f8;border:1px solid #fecaca;border-radius:6px;padding:10px 12px;font-size:13px;color:#c62828;">
                {error}
              </div>
            )}
          </form>
        </Modal>
      )}
    </div>
  );
}
