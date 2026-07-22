# ADMIN.md

## Purpose
This document defines the architecture and build plan for FramePro's internal admin panel: role-based access control, product management, CRM, and product analytics (view tracking). It complements `ARCHITECTURE.md` (system design), `DATABASE.md` (schema), and `API_SPEC.md` (API contract) — admin-specific additions to those documents are called out below.

---

## Design Principles

- The admin panel is **not a separate application** — it lives inside the existing Next.js app (`apps/web`) under a dedicated route group, sharing `packages/ui` and the same design system, rather than adopting a third-party admin framework (e.g. React Admin) that would fight the existing Shadcn/Tailwind setup.
- **Backend is the source of truth for authorization.** The frontend hides/shows UI for a good UX, but every admin API route independently enforces role/permission checks. Never rely on the frontend as the only gate.
- **Read-heavy admin views (analytics) must never hit raw event tables directly.** Aggregate first, query the aggregate.
- Admin actions that mutate data (product edits, CRM changes, bulk imports) are logged for accountability (see Audit Log section).

---

## 1. Role-Based Access Control (RBAC)

### Data Model

Extends the `users` table already defined in `DATABASE.md`.

```
users.role: enum(consumer, designer, distributor, admin)
```

For coarse gating (e.g. "is this an admin route at all"), `role` is sufficient. For finer-grained control within the admin panel (e.g. a sales rep who can manage CRM but not edit product pricing), introduce:

```
permissions (
  id uuid primary key,
  key text unique          -- e.g. "products:write", "crm:write", "analytics:read"
  description text
)

role_permissions (
  role text,                -- matches users.role enum
  permission_id uuid references permissions(id)
)
```

This avoids adding a new role enum value every time a new access pattern is needed — new permissions can be created and assigned to roles without a schema migration to `users`.

### Token Claims

- Better Auth / Auth.js issues a JWT containing `role` and a compact permission list (or a `permissions_version` the backend can use to invalidate stale tokens after a role change).
- Both frontend and backend read from this token — the frontend avoids an extra round-trip for simple show/hide decisions; the backend never trusts the token alone for sensitive writes (see Enforcement below).

### Enforcement

**Backend (authoritative):**
```python
# FastAPI dependency, applied to every /admin/* route
def require_permission(permission_key: str):
    def dependency(user: CurrentUser = Depends(get_current_user)):
        if not user.has_permission(permission_key):
            raise HTTPException(403, detail={"code": "FORBIDDEN"})
        return user
    return dependency

@router.post("/admin/products", dependencies=[Depends(require_permission("products:write"))])
async def create_product(...): ...
```

**Frontend (UX convenience only):**
- `apps/web/middleware.ts` inspects the session/JWT role claim and redirects unauthenticated or under-privileged users away from `/admin/*` before the page renders.
- Individual admin UI elements (buttons, nav items) are conditionally rendered based on permissions, but this is purely cosmetic — the backend check is what actually protects the data.

---

## 2. Admin Shell

### Routing
```
apps/web/src/app/admin/
  layout.tsx          # admin-only layout: sidebar nav, role-aware menu, auth session check
  login/              # admin login portal (/admin/login)
  page.tsx            # dashboard landing (key metrics summary)
  users/              # user & staff RBAC management UI (/admin/users)
  products/
  crm/
  analytics/
  audit-log/
```

### Tech Choices (why, not just what)

| Concern | Choice | Rationale |
|---|---|---|
| Data grids (products, leads, orders) | TanStack Table | Headless, composes cleanly with Shadcn table primitives; no design system conflict |
| Data fetching/caching | TanStack Query | Handles caching, pagination, optimistic updates against FastAPI endpoints |
| Forms | react-hook-form + Zod | Matches validation approach already used elsewhere in the app |
| Charts | Recharts | Already available in the stack (see `GEMINI.md` tech stack) |
| Kanban / drag-and-drop (CRM pipeline) | `@dnd-kit` | Lightweight, accessible, no legacy dependency baggage |

### Auth-aware Navigation
Sidebar nav items are generated from the current user's permission list, not hardcoded per role — so adding a new permission automatically surfaces (or hides) the corresponding nav entry without a frontend code change.

---

## 3. Product Management Module

### Scope
CRUD for `frame_profiles`, `frame_variants`, `frame_images` (see `DATABASE.md`).

### API Surface (new, admin-only — extends `API_SPEC.md`)

| Method | Path | Notes |
|---|---|---|
| GET | `/admin/products` | Paginated, includes cost/wholesale fields not exposed publicly |
| POST | `/admin/products` | Create a frame profile |
| PATCH | `/admin/products/{sku}` | Update fields |
| DELETE | `/admin/products/{sku}` | Soft delete (never hard-delete a SKU with order history) |
| POST | `/admin/products/{sku}/images` | Upload/attach images |
| POST | `/admin/products/import` | Bulk CSV import (see below) |
| GET | `/admin/products/export` | CSV export of current catalog |

These are distinct from the public `/products` endpoints in `API_SPEC.md` — different auth requirement, and the response includes internal fields (`wholesale_price_cents`, `moq`, `container_qty`) that should never leak to unauthenticated catalog requests.

### Image Uploads
Direct-to-R2 via pre-signed URL, same pattern already used for AI pipeline uploads (see `AI_PIPELINE.md` / `ARCHITECTURE.md`) — the admin UI requests a pre-signed URL, uploads directly to R2, then registers the resulting object key against `frame_images`.

### Bulk CSV Import
Given how many attributes each `frame_profiles` row carries (SKU, dimensions, material, finish, MOQ, container quantity, PBR texture links, etc.), a bad import can silently corrupt the catalog. Required flow:

1. Admin uploads CSV.
2. Backend validates and returns a **diff preview** (rows to be created / updated / flagged as invalid) — nothing is committed yet.
3. Admin reviews the diff in the UI and confirms.
4. Only then does the import commit, wrapped in a single transaction (all-or-nothing).

---

## 4. CRM Module

### Scope
Builds on the `leads` table in `DATABASE.md`.

### Pipeline View
- Kanban board: `New → Contacted → Qualified → Won / Lost`, matching `leads.status`.
- Drag-and-drop status changes (`@dnd-kit`) call `PATCH /crm/leads/{id}` (already defined in `API_SPEC.md`).

### Lead Detail View
- Timeline combining notes, tagged emails, and meeting records tied to the lead.
- Surfaces related `orders`/`quotations` for that contact/company, so a sales rep sees full context without switching screens.
- Tag management (`leads.tags`) for segmentation (e.g. "hotel", "high-volume", "cold").

### Follow-up Reminders (v1 scope — deliberately simple)
- Add `follow_up_at timestamptz` to `leads`.
- A daily worker job queries leads with `follow_up_at <= now()` and unresolved status, and sends a digest (email or in-app notification) to the assigned owner.
- Explicitly **not** building a full scheduling/calendar system for v1 — revisit only if this proves insufficient.

---

## 5. Product View Analytics ("most viewed by week/month/year/all-time")

### Why not a naive `COUNT(*)`
A raw `product_views` events table grows unbounded with traffic; querying `COUNT(*) WHERE viewed_at BETWEEN ...` against it gets slow and expensive as volume grows, especially for "all-time" queries. The design below avoids that from day one.

### Write path — cheap and fast
- On each product page view, increment a Redis counter (already part of the stack per `ARCHITECTURE.md`):
  ```
  INCR product_views:{sku}:{YYYY-MM-DD}
  ```
- Redis absorbs write volume with no impact on Postgres or API latency.

### Rollup — nightly (or hourly) worker job
- A scheduled job reads the prior period's Redis counters and upserts into a small aggregate table in Postgres:

```sql
CREATE TABLE product_view_daily (
  product_id  uuid NOT NULL REFERENCES frame_profiles(id),
  view_date   date NOT NULL,
  view_count  integer NOT NULL DEFAULT 0,
  PRIMARY KEY (product_id, view_date)
);

CREATE INDEX idx_product_view_daily_date ON product_view_daily (view_date);
```

- Redis keys are given a short TTL (~48h) after rollup — Postgres becomes the durable source of truth.

### Read path — trivial and fast regardless of history size
"Most viewed this week/month/year/all-time" becomes a simple aggregate query against a small, indexed table:

```sql
SELECT product_id, SUM(view_count) AS total_views
FROM product_view_daily
WHERE view_date >= :range_start
GROUP BY product_id
ORDER BY total_views DESC
LIMIT 20;
```

This stays fast even with years of history behind it, because reporting queries never scan raw events.

### API Surface

| Method | Path | Notes |
|---|---|---|
| GET | `/admin/analytics/products/top?range=week` | `range` ∈ `week`, `month`, `year`, `all_time`, or explicit `from`/`to` |
| GET | `/admin/analytics/products/{sku}/views` | Time series for a single product (for a detail chart) |

### Admin UI
- `/admin/analytics` page: date-range toggle (week/month/year/all-time), Recharts bar chart of top N products, plus a ranked table (product, views, % change vs. prior period).
- Product detail admin page includes a small embedded views-over-time chart for that SKU.

### Explicitly Out of Scope (v1)
Session-level detail (who viewed, referrer, device, funnel analysis) requires a proper event pipeline (and likely a column store like ClickHouse at real scale) — not justified until there's a concrete need. The daily-rollup approach above fully covers "most viewed" reporting without that complexity.

---

## 6. Audit Log

- Every admin mutation (product create/update/delete, CRM status change, bulk import commit, permission change) is recorded:

```sql
CREATE TABLE admin_audit_log (
  id uuid PRIMARY KEY,
  actor_user_id uuid NOT NULL REFERENCES users(id),
  action text NOT NULL,           -- e.g. "product.updated"
  target_type text NOT NULL,      -- e.g. "frame_profiles"
  target_id uuid,
  diff jsonb,                     -- before/after snapshot for key fields
  created_at timestamptz NOT NULL DEFAULT now()
);
```

- Written via a lightweight service-layer decorator/middleware around admin write endpoints, not scattered manually through each handler.
- Surfaced in `/admin/settings/audit-log` for accountability, especially important once multiple admins/sales reps have write access.

---

## Suggested Build Order

| Phase | Deliverable |
|---|---|
| 1 | RBAC data model, backend `require_permission` dependency, Next.js middleware gating `/admin` |
| 2 | Admin shell: layout, auth-aware nav, dashboard landing page |
| 3 | Product management: CRUD, image upload, CSV import/export with diff preview |
| 4 | CRM: leads table, Kanban pipeline, lead detail + notes, follow-up digest job |
| 5 | View tracking: Redis counters, nightly rollup worker, `product_view_daily` table, analytics dashboard |
| 6 | Audit log + fine-grained permission management UI |

---

## Related Documents
`ARCHITECTURE.md` (system context, Redis/worker infrastructure), `DATABASE.md` (schema this module extends), `API_SPEC.md` (public API conventions the `/admin/*` routes follow), `AI_PIPELINE.md` (pre-signed upload pattern reused for product images), `UI_GUIDELINES.md` (design system the admin UI must stay consistent with).