# Manzoom CMS

منصة متكاملة لإدارة المتاجر الإلكترونية العربية — قاعدة بيانات، إدارة محتوى، وواجهة برمجية تلقائية في مكان واحد.

> Directus, but opinionated for Arabic ecommerce.

---

## What it is

Manzoom is a self-hosted CMS built for Arab developers and agencies. It gives every store:

- **Auto-generated REST API** for every collection (products, orders, customers, etc.)
- **Admin dashboard** designed for sellers, not developers
- **Per-store databases** via Turso (libSQL) — full data isolation
- **Arabic-first UI** with RTL layout
- **Real-time updates** via SSE for orders

---

## Stack

| Layer | Tech |
|-------|------|
| API | [Elysia.js](https://elysiajs.com/) on Bun |
| Admin UI | Preact + Vite + TailwindCSS |
| Database | Turso (libSQL) — one platform DB + one per store |
| Auth | JWT (argon2id password hashing) |
| Monorepo | Turborepo + Bun workspaces |

---

## Project Structure

```
manzoom/
├── apps/
│   ├── api/          # Elysia.js REST API (port 3000)
│   └── admin/        # Preact admin UI (port 5173)
├── packages/
│   ├── config/       # Shared config: roles, plans, system fields
│   └── db/           # Database client + store seeding
```

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.2+
- A [Turso](https://turso.tech) account (or use local SQLite for dev)

### 1. Install dependencies

```bash
bun install
```

### 2. Configure environment

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env`:

```env
# JWT
JWT_SECRET=your-secret-key-here

# Platform database (stores owner accounts and store registry)
PLATFORM_TURSO_URL=libsql://your-db.turso.io
PLATFORM_TURSO_TOKEN=your-token

# Turso provisioning (for creating per-store databases)
# Leave blank to use local SQLite files under apps/api/uploads/stores/
TURSO_API_TOKEN=
TURSO_ORG=
TURSO_GROUP=default
```

> **Dev tip:** If you leave `TURSO_API_TOKEN` empty, store databases fall back to local SQLite files automatically.

### 3. Run in development

```bash
bun dev
```

- API: `http://localhost:3000`
- Admin: `http://localhost:5173`
- API docs: `http://localhost:3000/swagger`

---

## API Overview

All store routes are scoped to `/:storeSlug/`:

```
POST   /auth/signup                        Create owner account
POST   /auth/login                         Owner login

GET    /stores                             List your stores
POST   /stores                             Create a store

GET    /:storeSlug/collections/:name       List records
POST   /:storeSlug/collections/:name       Create record
GET    /:storeSlug/collections/:name/:id   Get record
PATCH  /:storeSlug/collections/:name/:id   Update record
DELETE /:storeSlug/collections/:name/:id   Delete record

GET    /:storeSlug/schema                  List collections
POST   /:storeSlug/schema                  Create custom collection
GET    /:storeSlug/schema/:name            Get collection fields
POST   /:storeSlug/schema/:name/fields     Add a field

GET    /:storeSlug/media                   List media
POST   /:storeSlug/media/upload            Upload file

GET    /:storeSlug/events                  SSE real-time stream
```

---

## System Collections

Every store comes with these collections pre-seeded:

| Collection | Arabic | Description |
|------------|--------|-------------|
| `products` | المنتجات | Products with price, stock, images |
| `categories` | الفئات | Product categories |
| `orders` | الطلبات | Customer orders (real-time enabled) |
| `order_items` | — | Line items per order (internal) |
| `customers` | العملاء | Customer accounts |
| `admins` | — | Store staff (internal) |
| `media` | الوسائط | Uploaded files |

---

## Roles

| Role | Level | Can do |
|------|-------|--------|
| `owner` | 4 | Everything — manages the store |
| `admin` | 3 | Full CRUD on all collections |
| `editor` | 2 | Create and edit, no delete |
| `fulfillment` | 1 | View orders only |

---

## Custom Collections

Add your own collections via the API or the admin UI:

```bash
POST /:storeSlug/schema
{
  "name": "blog_posts",
  "label": "Blog Posts",
  "label_ar": "المقالات",
  "realtime": false
}
```

Then add fields:

```bash
POST /:storeSlug/schema/blog_posts/fields
{
  "field": "title",
  "type": "text",
  "required": true,
  "label": "Title",
  "label_ar": "العنوان"
}
```

The REST endpoints for `blog_posts` are created automatically.

---

## Plans

| Plan | Price | Stores | Storage |
|------|-------|--------|---------|
| Free | $0 | 1 | 500 MB |
| Starter | $19/mo | 3 | 5 GB |
| Pro | $49/mo | 10 | 20 GB |
| Agency | $149/mo | Unlimited | 100 GB |

---

## License

MIT
