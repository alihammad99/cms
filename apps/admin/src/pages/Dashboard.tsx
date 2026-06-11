import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { route } from "preact-router";
import { api } from "../lib/api";
import { currentStore } from "../lib/store";
import { Layout } from "../components/Layout";

const STATUS_META: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  pending: { label: "معلق", color: "#92400e", bg: "#fef9c3" },
  confirmed: { label: "مؤكد", color: "#1d4ed8", bg: "#dbeafe" },
  shipped: { label: "مشحون", color: "#0369a1", bg: "#e0f2fe" },
  delivered: { label: "مسلّم", color: "#166534", bg: "#dcfce7" },
  cancelled: { label: "ملغي", color: "#991b1b", bg: "#fee2e2" },
  refunded: { label: "مسترجع", color: "#6b21a8", bg: "#f3e8ff" },
};

function fmt(cents: number) {
  return (cents / 100).toLocaleString("ar-SA", { minimumFractionDigits: 0 });
}

function timeAgo(iso: string) {
  if (!iso) return "";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `${mins} د`;
  if (mins < 1440) return `${Math.floor(mins / 60)} س`;
  return `${Math.floor(mins / 1440)} ي`;
}

export function DashboardPage({ storeSlug }: { storeSlug: string }) {
  const store = currentStore.value;
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeSlug) return;
    Promise.all([
      api
        .get<{
          data: any[];
        }>(`/${storeSlug}/collections/orders?per_page=100&sort=created_at&order=desc`)
        .catch(() => ({ data: [] })),
      api
        .get<{ data: any[] }>(`/${storeSlug}/collections/products?per_page=200`)
        .catch(() => ({ data: [] })),
    ])
      .then(([o, p]) => {
        setOrders(o.data ?? []);
        setProducts(p.data ?? []);
      })
      .finally(() => setLoading(false));
  }, [storeSlug]);

  const today = new Date().toISOString().slice(0, 10);
  const revenue = orders
    .filter((o) => !["cancelled", "refunded"].includes(o.status))
    .reduce((s, o) => s + (Number(o.total) || 0), 0);
  const todayRev = orders
    .filter(
      (o) =>
        o.created_at?.startsWith(today) &&
        !["cancelled", "refunded"].includes(o.status),
    )
    .reduce((s, o) => s + (Number(o.total) || 0), 0);
  const pending = orders.filter((o) => o.status === "pending").length;
  const lowStock = products.filter(
    (p) => Number(p.stock) <= 5 && p.status === "active",
  );
  const todayOrders = orders.filter((o) =>
    o.created_at?.startsWith(today),
  ).length;

  // Pipeline counts
  const pipeline = ["pending", "confirmed", "shipped", "delivered"].map(
    (s) => ({
      ...STATUS_META[s],
      key: s,
      count: orders.filter((o) => o.status === s).length,
    }),
  );

  return (
    <Layout storeSlug={storeSlug}>
      <div style="padding:28px 32px;">
        {/* Greeting */}
        <div style="margin-bottom:28px;">
          <h1 style="font-size:22px;font-weight:700;color:#0f172a;margin-bottom:4px;letter-spacing:-.3px;">
            مرحباً 👋
          </h1>
          <p style="font-size:14px;color:#64748b;">
            {store?.name} — إليك ملخص متجرك اليوم
          </p>
        </div>

        {/* KPI cards */}
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;">
          {[
            {
              label: "الإيرادات الكلية",
              value: loading ? null : `${fmt(revenue)} ر.س`,
              sub: `${fmt(todayRev)} ر.س اليوم`,
              icon: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
              accent: "#16a34a",
              accentBg: "#f0fdf4",
              borderAccent: "#16a34a",
            },
            {
              label: "إجمالي الطلبات",
              value: loading ? null : orders.length,
              sub: `${todayOrders} طلب اليوم`,
              icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2",
              accent: "#2563eb",
              accentBg: "#eff6ff",
              borderAccent: "#2563eb",
            },
            {
              label: "طلبات بانتظارك",
              value: loading ? null : pending,
              sub: pending > 0 ? "بحاجة لمراجعة" : "لا يوجد معلق",
              icon: "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
              accent: pending > 0 ? "#d97706" : "#16a34a",
              accentBg: pending > 0 ? "#fffbeb" : "#f0fdf4",
              borderAccent: pending > 0 ? "#d97706" : "#16a34a",
              urgent: pending > 0,
            },
            {
              label: "منتجات نشطة",
              value: loading
                ? null
                : products.filter((p) => p.status === "active").length,
              sub: `${lowStock.length} مخزون منخفض`,
              icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
              accent: lowStock.length > 0 ? "#d97706" : "#6b6b6b",
              accentBg: lowStock.length > 0 ? "#fffbeb" : "#fafaf9",
              borderAccent: lowStock.length > 0 ? "#d97706" : "#e0e0e0",
            },
          ].map((kpi, i) => (
            <div
              key={i}
              class="card"
              style={`padding:20px; border-top:3px solid ${(kpi as any).borderAccent};`}
            >
              <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px;">
                <div
                  style={`width:36px;height:36px;border-radius:10px;background:${kpi.accentBg};display:flex;align-items:center;justify-content:center;`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={kpi.accent}
                    stroke-width="1.75"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d={kpi.icon} />
                  </svg>
                </div>
              </div>
              <div style="font-size:28px;font-weight:800;color:#0f172a;letter-spacing:-.5px;margin-bottom:4px;font-variant-numeric:tabular-nums;line-height:1;">
                {kpi.value === null ? (
                  <div
                    style="width:70px;height:30px;background:#f1f5f9;border-radius:6px;"
                    class="skeleton"
                  />
                ) : (
                  kpi.value
                )}
              </div>
              <div style="font-size:13px;font-weight:500;color:#475569;margin-bottom:3px;margin-top:8px;">
                {kpi.label}
              </div>
              <div style="font-size:12px;color:#94a3b8;">{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Order pipeline */}
        <div class="card" style="padding:20px 22px;margin-bottom:20px;">
          <h2 style="font-size:12px;font-weight:700;color:#94a3b8;letter-spacing:.06em;text-transform:uppercase;margin-bottom:16px;">
            مسار الطلبات
          </h2>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">
            {pipeline.map((stage) => (
              <div
                key={stage.key}
                onClick={() => route(`/stores/${storeSlug}/orders`)}
                style={`
                  padding:16px 18px;
                  background:${stage.count > 0 ? stage.bg : "#f8fafc"};
                  border-radius:10px;
                  border:1px solid ${stage.count > 0 ? stage.bg : "#f1f5f9"};
                  text-align:center;
                  cursor:pointer;
                  transition:all .2s ease;
                `}
                onMouseOver={(e: any) => {
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(15,23,42,0.06)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e: any) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "";
                }}
              >
                <div
                  style={`font-size:26px;font-weight:800;color:${stage.count > 0 ? stage.color : "#cbd5e1"};margin-bottom:4px;line-height:1;`}
                >
                  {loading ? "—" : stage.count}
                </div>
                <div
                  style={`font-size:12px;font-weight:600;color:${stage.count > 0 ? stage.color : "#cbd5e1"};`}
                >
                  {stage.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 320px;gap:16px;">
          {/* Recent orders */}
          <div class="card" style="overflow:hidden;">
            <div style="padding:16px 22px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;">
              <h2 style="font-size:14px;font-weight:600;color:#0f172a;">
                آخر الطلبات
              </h2>
              <button
                onClick={() => route(`/stores/${storeSlug}/orders`)}
                style="font-size:13px;color:#64748b;background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:4px;font-weight:500;"
                onMouseOver={(e: any) =>
                  (e.currentTarget.style.color = "#4338ca")
                }
                onMouseOut={(e: any) =>
                  (e.currentTarget.style.color = "#64748b")
                }
              >
                عرض الكل
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            {loading ? (
              <div style="padding:14px 20px;display:flex;flex-direction:column;gap:10px;">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f8fafc;"
                  >
                    <div style="width:3px;height:30px;border-radius:2px;background:#f1f5f9;" />
                    <div style="flex:1;display:flex;gap:10px;align-items:center;">
                      <div style="width:70px;height:12px;background:#f1f5f9;border-radius:4px;" />
                      <div style="flex:1;height:12px;background:#f1f5f9;border-radius:4px;" />
                    </div>
                    <div style="width:50px;height:20px;background:#f1f5f9;border-radius:12px;" />
                    <div style="width:60px;height:14px;background:#f1f5f9;border-radius:4px;" />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div style="padding:48px;text-align:center;font-size:14px;color:#94a3b8;">
                لا توجد طلبات بعد
              </div>
            ) : (
              <div style="padding:0 20px;">
                {orders.slice(0, 8).map((order, i) => {
                  const st = STATUS_META[order.status] ?? {
                    label: order.status,
                    color: "#64748b",
                    bg: "#f1f5f9",
                  };
                  return (
                    <div
                      key={order.id}
                      onClick={() =>
                        route(
                          `/stores/${storeSlug}/collections/orders/${order.id}`,
                        )
                      }
                      style={`
                        display:flex;align-items:center;gap:14px;
                        padding:14px 0;
                        border-bottom:${i < 7 ? "1px solid #f8fafc" : "none"};
                        cursor:pointer;
                        transition:opacity .15s;
                      `}
                      onMouseOver={(e: any) =>
                        (e.currentTarget.style.opacity = "0.7")
                      }
                      onMouseOut={(e: any) =>
                        (e.currentTarget.style.opacity = "1")
                      }
                    >
                      <div
                        style={`width:3px;height:34px;border-radius:2px;background:${st.color};flex-shrink:0;`}
                      />
                      <div style="flex-shrink:0;">
                        <div style="font-size:13.5px;font-weight:700;color:#0f172a;font-family:monospace;">
                          #{order.id.slice(-5).toUpperCase()}
                        </div>
                        <div style="font-size:12px;color:#94a3b8;">
                          {timeAgo(order.created_at)}
                        </div>
                      </div>
                      <div style="flex:1" />
                      <span
                        class="badge"
                        style={`color:${st.color};background:${st.bg};`}
                      >
                        {st.label}
                      </span>
                      <div style="font-size:15px;font-weight:700;color:#0f172a;font-variant-numeric:tabular-nums;flex-shrink:0;min-width:70px;text-align:left;">
                        {fmt(Number(order.total) || 0)}{" "}
                        <span style="font-size:11px;font-weight:400;color:#94a3b8;">
                          ر.س
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right column */}
          <div style="display:flex;flex-direction:column;gap:14px;">
            {/* Quick actions */}
            <div class="card" style="padding:18px 20px;">
              <h2 style="font-size:12px;font-weight:700;color:#94a3b8;letter-spacing:.06em;text-transform:uppercase;margin-bottom:12px;">
                إجراءات سريعة
              </h2>
              <div style="display:flex;flex-direction:column;gap:4px;">
                {[
                  {
                    label: "إضافة منتج جديد",
                    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
                    path: `/stores/${storeSlug}/collections/products/new`,
                  },
                  {
                    label: "عرض الطلبات المعلقة",
                    icon: "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
                    path: `/stores/${storeSlug}/orders`,
                  },
                  {
                    label: "رفع صورة",
                    icon: "M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
                    path: `/stores/${storeSlug}/media`,
                  },
                ].map((a) => (
                  <button
                    key={a.label}
                    onClick={() => route(a.path)}
                    style="display:flex;align-items:center;gap:10px;padding:10px 10px;border-radius:8px;border:none;background:transparent;cursor:pointer;text-align:right;width:100%;transition:background .15s;"
                    onMouseOver={(e: any) =>
                      (e.currentTarget.style.background = "#f8fafc")
                    }
                    onMouseOut={(e: any) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <div style="width:32px;height:32px;background:#f1f5f9;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#64748b"
                        stroke-width="1.75"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d={a.icon} />
                      </svg>
                    </div>
                    <span style="font-size:13.5px;color:#334155;font-weight:500;">
                      {a.label}
                    </span>
                    <svg
                      style="margin-right:auto;"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#cbd5e1"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Low stock alert */}
            {lowStock.length > 0 && (
              <div style="background:#fffbeb;border-radius:12px;box-shadow:0 0 0 1px #fde68a;padding:18px 20px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#92400e"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <h2 style="font-size:14px;font-weight:600;color:#92400e;">
                    تنبيه مخزون
                  </h2>
                </div>
                {lowStock.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    onClick={() =>
                      route(`/stores/${storeSlug}/collections/products/${p.id}`)
                    }
                    style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;cursor:pointer;border-bottom:1px solid #fde68a;"
                    onMouseOver={(e: any) =>
                      (e.currentTarget.style.opacity = "0.7")
                    }
                    onMouseOut={(e: any) =>
                      (e.currentTarget.style.opacity = "1")
                    }
                  >
                    <span style="font-size:13.5px;color:#78350f;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:170px;">
                      {p.name}
                    </span>
                    <span class="badge-orange" style="flex-shrink:0;">
                      {p.stock === 0 ? "نفد" : `${p.stock} متبقٍ`}
                    </span>
                  </div>
                ))}
                {lowStock.length > 4 && (
                  <button
                    onClick={() => route(`/stores/${storeSlug}/products`)}
                    style="margin-top:10px;font-size:13px;color:#92400e;background:none;border:none;cursor:pointer;font-weight:500;"
                  >
                    +{lowStock.length - 4} منتجات أخرى
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
