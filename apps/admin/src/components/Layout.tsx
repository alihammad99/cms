import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { route } from "preact-router";
import { currentStore, logout, collectionsCache } from "../lib/store";
import { api } from "../lib/api";
import { TABLE_ICONS } from "../pages/CollectionsList";

// ── icons ──────────────────────────────────────────────────────────────────
function Ico({ d, size = 15 }: { d: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

const IC = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  orders:
    "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2",
  products: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  categories:
    "M3 7V5a2 2 0 0 1 2-2h2m10 0h2a2 2 0 0 1 2 2v2M3 17v2a2 2 0 0 0 2 2h2m10 0h2a2 2 0 0 0 2-2v-2M8 12h8",
  customers:
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  admins: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  media:
    "M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
  team: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 1a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm4 8v-1a3 3 0 0 0-3-3",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.071-7.071A9 9 0 0 0 3 12c0 4.97 4.03 9 9 9a9 9 0 0 0 6.364-2.636M15.536 4.464A9 9 0 0 1 21 12",
  custom: "M4 6h16M4 10h16M4 14h16M4 18h16",
  stores: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  logout:
    "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1",
  plus: "M12 5v14M5 12h14",
  chevronL: "M15 18l-6-6 6-6",
};

// Arabic labels for system collections
const COL_LABELS: Record<string, { label: string; icon: string }> = {
  orders: { label: "الطلبات", icon: IC.orders },
  products: { label: "المنتجات", icon: IC.products },
  categories: { label: "الفئات", icon: IC.categories },
  customers: { label: "العملاء", icon: IC.customers },
  order_items: { label: "عناصر الطلبات", icon: IC.orders },
  admins: { label: "المديرون", icon: IC.admins },
};

function NavBtn({
  label,
  icon,
  active,
  onClick,
  indent = false,
}: {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
  indent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      class={`nav-item ${active ? "active" : ""}`}
      style={`padding:${indent ? "6px 10px 6px 22px" : "7px 10px"};`}
    >
      <span style="flex-shrink:0; color:inherit; transition:color .15s;">
        <Ico d={icon} size={15} />
      </span>
      <span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
        {label}
      </span>
    </button>
  );
}

function NavSection({ label }: { label: string }) {
  return (
    <div style="font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:.06em;text-transform:uppercase;padding:0 10px;margin:16px 0 6px;">
      {label}
    </div>
  );
}

export function Layout({
  children,
  storeSlug,
}: {
  children: any;
  storeSlug: string;
}) {
  const store = currentStore.value;
  const base = `/stores/${storeSlug}`;
  const cur = typeof window !== "undefined" ? window.location.pathname : "";

  // Use global cache to avoid re-fetching on every navigation
  useEffect(() => {
    if (collectionsCache.value?.slug === storeSlug) return;
    api
      .get<{
        collections: {
          name: string;
          label_ar: string;
          label: string;
          system: number;
          icon?: string;
        }[];
      }>(`/${storeSlug}/schema`)
      .then((r) => {
        collectionsCache.value = { slug: storeSlug, data: r.collections ?? [] };
      })
      .catch(() => {});
  }, [storeSlug]);

  const collections =
    collectionsCache.value?.slug === storeSlug
      ? collectionsCache.value.data
      : [];

  function isActive(path: string) {
    return cur === path || cur.startsWith(path + "/");
  }

  // Fixed system nav — always rendered in this order, never reordered by API
  const SYSTEM_NAV = [
    {
      name: "orders",
      label: "الطلبات",
      icon: IC.orders,
      dest: `${base}/orders`,
    },
    {
      name: "products",
      label: "المنتجات",
      icon: IC.products,
      dest: `${base}/products`,
    },
    {
      name: "categories",
      label: "الفئات",
      icon: IC.categories,
      dest: `${base}/collections/categories`,
    },
    {
      name: "customers",
      label: "العملاء",
      icon: IC.customers,
      dest: `${base}/collections/customers`,
    },
  ];
  // Only custom collections come from API (appended below system items)
  const customCols = collections.filter((c) => !c.system);

  return (
    <div style="display:flex; min-height:100vh; background:#f8fafc; direction:rtl;">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        style={`
        width:240px; flex-shrink:0;
        background:#ffffff;
        border-left:1px solid #e2e8f0;
        display:flex; flex-direction:column;
        position:fixed; top:0; right:0; bottom:0;
        z-index:30; overflow:hidden;
      `}
      >
        {/* Store switcher */}
        <div style="padding:16px 12px 10px;">
          <button
            onClick={() => route("/stores")}
            style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;width:100%;background:transparent;border:none;cursor:pointer;transition:background .15s;"
            onMouseOver={(e: any) =>
              (e.currentTarget.style.background = "#f1f5f9")
            }
            onMouseOut={(e: any) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <div style="width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#0f172a,#1e293b);color:white;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;font-family:'Inter',sans-serif;box-shadow:0 1px 3px rgba(15,23,42,0.2);">
              {store?.name?.charAt(0)?.toUpperCase() ?? "م"}
            </div>
            <div style="flex:1;min-width:0;text-align:right;">
              <div style="font-size:13.5px;font-weight:600;color:#0f172a;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:1.35;">
                {store?.name ?? storeSlug}
              </div>
              <div style="font-size:11px;color:#94a3b8;font-family:monospace;line-height:1.4;">
                {storeSlug}
              </div>
            </div>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#cbd5e1"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <div style="height:1px;background:#f1f5f9;margin:0 14px 6px;" />

        {/* Nav */}
        <nav style="flex:1;padding:4px 10px 8px;overflow-y:auto;display:flex;flex-direction:column;gap:2px;">
          {/* Overview */}
          <NavBtn
            label="لوحة التحكم"
            icon={IC.dashboard}
            active={isActive(`${base}/dashboard`)}
            onClick={() => route(`${base}/dashboard`)}
          />

          <NavSection label="المحتوى" />

          {/* System nav — fixed order, never shifts */}
          {SYSTEM_NAV.map((c) => (
            <NavBtn
              key={c.name}
              label={c.label}
              icon={c.icon}
              active={
                isActive(c.dest) ||
                (c.name === "orders" &&
                  isActive(`${base}/collections/orders`)) ||
                (c.name === "products" &&
                  isActive(`${base}/collections/products`))
              }
              onClick={() => route(c.dest)}
            />
          ))}

          {/* Custom collections */}
          {customCols.map((c) => {
            const iconDef =
              TABLE_ICONS.find((i) => i.key === c.icon) ?? TABLE_ICONS[0];
            return (
              <NavBtn
                key={c.name}
                label={c.label_ar || c.label || c.name}
                icon={iconDef.d}
                active={isActive(`${base}/collections/${c.name}`)}
                onClick={() => route(`${base}/collections/${c.name}`)}
              />
            );
          })}

          {/* Add table button */}
          <button
            onClick={() => route(`${base}/collections`)}
            style="display:flex;align-items:center;gap:6px;padding:5px 9px;border-radius:6px;font-size:11.5px;border:none;background:transparent;cursor:pointer;color:#c0bfbc;width:100%;text-align:right;margin-top:1px;transition:color .12s;"
            onMouseOver={(e: any) => (e.currentTarget.style.color = "#767676")}
            onMouseOut={(e: any) => (e.currentTarget.style.color = "#c0bfbc")}
          >
            <Ico d={IC.plus} size={11} />
            <span>إضافة جدول</span>
          </button>

          <NavSection label="الإدارة" />

          <NavBtn
            label="الوسائط"
            icon={IC.media}
            active={isActive(`${base}/media`)}
            onClick={() => route(`${base}/media`)}
          />
          <NavBtn
            label="الفريق"
            icon={IC.team}
            active={isActive(`${base}/team`)}
            onClick={() => route(`${base}/team`)}
          />
          <NavBtn
            label="الإعدادات"
            icon={IC.settings}
            active={isActive(`${base}/settings`)}
            onClick={() => route(`${base}/settings`)}
          />
        </nav>

        {/* Footer */}
        <div style="padding:8px 10px 10px;border-top:1px solid #f1f5f9;">
          <button
            onClick={() => {
              logout();
              route("/login");
            }}
            class="nav-item"
            style="color:#94a3b8;"
            onMouseOver={(e: any) => {
              e.currentTarget.style.background = "#fef2f2";
              e.currentTarget.style.color = "#dc2626";
            }}
            onMouseOut={(e: any) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#94a3b8";
            }}
          >
            <Ico d={IC.logout} size={15} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* ── Main area ────────────────────────────────────────────────────── */}
      <div style="flex:1; margin-right:240px; min-width:0; display:flex; flex-direction:column; min-height:100vh;">
        {/* ── Top bar ─────────────────────────────────────────────────── */}
        <header
          style="
          height:56px; background:white;
          border-bottom:1px solid #e2e8f0;
          display:flex; align-items:center;
          padding:0 28px;
          position:sticky; top:0; z-index:20;
          flex-shrink:0;
          gap:12px;
        "
        >
          {/* Breadcrumb */}
          <TopBarTitle storeSlug={storeSlug} />

          <div style="flex:1;" />

          {/* Search */}
          <button
            style="display:flex;align-items:center;gap:8px;padding:6px 14px;border-radius:8px;background:#f8fafc;border:1px solid #e2e8f0;color:#94a3b8;font-size:13px;cursor:pointer;transition:border-color .15s,background .15s;"
            onMouseOver={(e: any) => {
              e.currentTarget.style.borderColor = "#cbd5e1";
              e.currentTarget.style.background = "#f1f5f9";
            }}
            onMouseOut={(e: any) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.background = "#f8fafc";
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>بحث...</span>
            <kbd style="font-size:10px;color:#cbd5e1;margin-right:6px;background:#f1f5f9;padding:2px 6px;border-radius:4px;font-family:inherit;">
              ⌘K
            </kbd>
          </button>

          {/* User avatar */}
          <div
            style="
            width:32px; height:32px; border-radius:50%;
            background:linear-gradient(135deg,#6366f1,#4f46e5); color:white;
            display:flex; align-items:center; justify-content:center;
            font-size:12px; font-weight:600; cursor:pointer;
            flex-shrink:0; font-family:'Inter',sans-serif;
            box-shadow:0 1px 4px rgba(99,102,241,0.3);
          "
            title={store?.name}
          >
            {store?.name?.charAt(0)?.toUpperCase() ?? "م"}
          </div>
        </header>

        {/* ── Page content ────────────────────────────────────────────── */}
        <main style="flex:1; overflow:auto;">{children}</main>
      </div>
    </div>
  );
}

// Derive a breadcrumb title from the current URL
function TopBarTitle({ storeSlug }: { storeSlug: string }) {
  const cur = typeof window !== "undefined" ? window.location.pathname : "";
  const parts = cur.replace(`/stores/${storeSlug}/`, "").split("/");

  const SECTION_LABELS: Record<string, string> = {
    dashboard: "لوحة التحكم",
    collections: "المجموعات",
    media: "الوسائط",
    team: "الفريق",
    settings: "الإعدادات",
    schema: "هيكل البيانات",
  };
  const COL_AR: Record<string, string> = {
    orders: "الطلبات",
    products: "المنتجات",
    categories: "الفئات",
    customers: "العملاء",
    admins: "المديرون",
    order_items: "عناصر الطلبات",
    media: "الوسائط",
  };

  const section = parts[0] ?? "";
  const collection = parts[1] ?? "";
  const recordId = parts[2] ?? "";

  const items: string[] = [];

  if (SECTION_LABELS[section]) items.push(SECTION_LABELS[section]);
  if (section === "collections" && collection) {
    items.push(COL_AR[collection] ?? collection);
    if (recordId === "new") items.push("سجل جديد");
    else if (recordId) items.push("تعديل");
  }
  if (section === "schema" && collection)
    items.push(COL_AR[collection] ?? collection);

  return (
    <div style="display:flex;align-items:center;gap:6px;font-size:13px;">
      {items.map((item, i) => (
        <span key={i} style="display:flex;align-items:center;gap:6px;">
          {i > 0 && (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d0d0d0"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
          <span
            style={`color:${i === items.length - 1 ? "#0f172a" : "#94a3b8"}; font-weight:${i === items.length - 1 ? "600" : "400"};`}
          >
            {item}
          </span>
        </span>
      ))}
    </div>
  );
}
