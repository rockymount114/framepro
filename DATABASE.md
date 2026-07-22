# DATABASE.md

## Overview
FramePro uses PostgreSQL as its primary datastore, accessed exclusively through the Repository Pattern in `packages/database` (SQLAlchemy 2.0, async). Redis is used for caching and job queues, not as a source of truth. Migrations are managed with Alembic.

---

## Design Principles

- Every table has `id` (UUID, primary key), `created_at`, `updated_at`.
- Every core table includes a nullable `tenant_id` (UUID, indexed) to support future multi-tenancy without a painful migration.
- Soft deletes (`deleted_at` nullable timestamp) for records with business/legal retention value (orders, quotations, invoices); hard deletes acceptable for ephemeral data (AI job records after retention window).
- Foreign keys are always indexed.
- Monetary values stored as `bigint` minor units (cents) + a `currency` `char(3)` column — never `float`.
- No business logic in the database (no complex triggers/stored procedures) — logic lives in the service layer.

---

## Core Entities (ER Overview)

```
users ──< distributor_profiles
  │
  ├──< leads (CRM)
  ├──< orders ──< order_items >── frame_profiles
  │       │
  │       └──< payments
  │
  ├──< quotations ──< quotation_items >── frame_profiles
  │
  └──< ai_jobs

frame_profiles ──< frame_images
frame_profiles ──< frame_variants (color/finish/width)

warehouses ──< inventory_levels >── frame_profiles
containers ──< container_items >── order_items
```

---

## Table Definitions (selected core tables)

### `users`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| tenant_id | uuid, nullable | future multi-tenancy |
| email | text, unique | |
| password_hash | text | nullable if using OAuth only |
| role | enum(`consumer`,`designer`,`distributor`,`admin`) | |
| full_name | text | |
| created_at / updated_at | timestamptz | |

### `distributor_profiles`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → users.id |
| company_name | text | |
| wholesale_tier | enum(`bronze`,`silver`,`gold`) | drives pricing |
| tax_id | text | |
| approved_at | timestamptz, nullable | null = pending application |

### `frame_profiles`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| sku | text, unique | |
| name | text | |
| material | text | |
| finish | text | |
| texture | text | |
| wood_grain | text, nullable | |
| color | text | |
| width_mm | numeric | |
| depth_mm | numeric | |
| application | text | e.g. "wall art", "mirror" |
| weight_g_per_m | numeric | |
| moq | integer | minimum order quantity |
| container_qty | integer | quantity per container |
| retail_price_cents | bigint | |
| wholesale_price_cents | bigint, nullable | |
| currency | char(3) | default `USD` |
| model_3d_url | text, nullable | |
| normal_map_url | text, nullable | |
| pbr_texture_url | text, nullable | |
| installation_guide_url | text, nullable | |
| pdf_catalog_url | text, nullable | |

### `frame_images`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| frame_profile_id | uuid | FK |
| url | text | R2 asset URL |
| alt_text | text | for accessibility/SEO |
| sort_order | integer | |

### `orders`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → users.id |
| status | enum(`pending`,`confirmed`,`in_production`,`shipped`,`delivered`,`cancelled`) | |
| total_cents | bigint | |
| currency | char(3) | |
| incoterm | enum(`FOB`,`EXW`,`DDP`), nullable | B2B only |
| quotation_id | uuid, nullable | FK → quotations.id, if converted from a quote |

### `order_items`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| order_id | uuid | FK |
| frame_profile_id | uuid | FK |
| quantity | integer | |
| unit_price_cents | bigint | snapshot at time of order |

### `quotations`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| distributor_id | uuid, nullable | FK → distributor_profiles.id |
| status | enum(`draft`,`sent`,`signed`,`expired`,`cancelled`) | |
| incoterm | enum(`FOB`,`EXW`,`DDP`) | |
| currency | char(3) | |
| subtotal_cents | bigint | |
| tax_cents | bigint | |
| shipping_cents | bigint | |
| discount_cents | bigint | |
| total_cents | bigint | |
| valid_until | date | |
| signed_at | timestamptz, nullable | |
| signature_data | text, nullable | e-signature payload/reference |

### `ai_jobs`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid, nullable | anonymous previews allowed pre-login |
| job_type | enum(`frame_preview`,`room_visualizer`,`recommendation`) | |
| status | enum(`pending`,`processing`,`completed`,`failed`) | |
| input_payload | jsonb | source image keys, selected SKUs, etc. |
| result_url | text, nullable | |
| error_message | text, nullable | |
| cost_cents | integer, nullable | for internal cost tracking |
| retention_expires_at | timestamptz | for cleanup of ephemeral job data |

### `ai_chat_sessions` & `ai_chat_messages` (AI Consultant History)
| Table | Columns | Notes |
|---|---|---|
| `ai_chat_sessions` | `id` (PK), `user_id` (FK → users.id, nullable), `session_title`, `created_at`, `updated_at` | Tracks AI Consultant chat threads |
| `ai_chat_messages` | `id` (PK), `session_id` (FK → ai_chat_sessions.id), `sender` (`user`/`assistant`), `content`, `suggested_skus` (jsonb), `created_at` | Full message transcript for user & staff audit |

### `warehouses`, `inventory_levels`
Standard warehouse/stock tracking: `warehouses(id, name, country, region)`, `inventory_levels(id, warehouse_id, frame_profile_id, quantity_on_hand, quantity_reserved, updated_at)`.

### `containers`, `container_items`
Tracks container-level logistics for production/shipment planning: `containers(id, status, origin_warehouse_id, destination, eta)`, `container_items(id, container_id, order_item_id, quantity)`.

### `leads` (CRM)
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| source | text | e.g. "contact_form", "chatbot", "sample_request" |
| status | enum(`new`,`contacted`,`qualified`,`won`,`lost`) | |
| owner_user_id | uuid, nullable | sales rep assigned |
| tags | text[] / jsonb | |
| email / phone / company | text | |
| follow_up_at | timestamptz, nullable | scheduled follow-up date |

### `permissions` & `role_permissions` (Admin RBAC)
| Table | Columns | Notes |
|---|---|---|
| `permissions` | `id` (PK), `key` (unique text, e.g. `products:write`), `description` | Fine-grained permission definitions |
| `role_permissions` | `id` (PK), `role` (text), `permission_id` (FK → permissions.id) | Maps user roles to permission keys |

### `product_view_daily` (Product View Analytics Rollup)
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| frame_profile_id | uuid | FK → frame_profiles.id |
| view_date | date | Rollup date |
| view_count | integer | Daily view aggregate count |

### `admin_audit_logs` (Admin Audit Log)
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| actor_user_id | uuid | FK → users.id |
| action | text | Action name e.g. `product.updated`, `crm.lead_status_changed` |
| target_type | text | Entity target type |
| target_id | uuid, nullable | Entity target ID |
| diff | jsonb, nullable | Snapshot of changes |
| created_at | timestamptz | Log timestamp |


---

## Indexing Strategy

- All foreign keys indexed.
- `frame_profiles(sku)` unique index (primary lookup path).
- `frame_profiles` composite index on `(material, finish, color)` for catalog filtering.
- `ai_jobs(status, created_at)` for queue/worker polling and cleanup jobs.
- `orders(user_id, status)` and `quotations(distributor_id, status)` for dashboard queries.

---

## Migrations

- Managed via Alembic, one migration per logical schema change.
- Every migration must be reversible (`downgrade()` implemented, not a no-op) unless explicitly irreversible (documented in the migration message why).
- Schema changes must be accompanied by an update to this document in the same PR (see `CLAUDE.md` rules).

---

## Data Retention & Privacy

- `ai_jobs` input images are retained per `retention_expires_at` (default: 30 days) then purged from R2 and the DB row soft-deleted.
- User-uploaded room/artwork photos are never used for model training without explicit opt-in consent, tracked via a `users.ai_training_opt_in` boolean.
- Financial records (`orders`, `quotations`, `payments`) are retained per applicable tax/legal requirements regardless of soft-delete status elsewhere.
