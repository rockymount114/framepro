# ARCHITECTURE.md

## Overview
FramePro is a monorepo-based, service-oriented platform consisting of a Next.js frontend, a FastAPI backend, a Postgres database, an AI processing pipeline, and supporting infrastructure for storage, auth, and background jobs.

---

## High-Level System Diagram

```
                         ┌─────────────────────┐
                         │        Users         │
                         │ (Consumers, Dealers,  │
                         │  Designers, Admins)   │
                         └──────────┬───────────┘
                                    │ HTTPS
                                    ▼
                         ┌─────────────────────┐
                         │   Next.js (Vercel)   │
                         │   apps/web           │
                         │  - SSR pages         │
                         │  - Server Actions     │
                         └──────────┬───────────┘
                                    │ REST (JSON)
                                    ▼
                         ┌─────────────────────┐
                         │  Traefik (VPS)       │
                         │  Reverse proxy + TLS  │
                         └──────────┬───────────┘
                                    ▼
                         ┌─────────────────────┐
                         │  FastAPI (apps/api)  │
                         │  - Auth              │
                         │  - Products          │
                         │  - Quotations         │
                         │  - Orders             │
                         │  - CRM                │
                         │  - AI orchestration   │
                         └───┬─────────┬────────┘
                             │         │
                 ┌───────────┘         └───────────┐
                 ▼                                  ▼
      ┌─────────────────────┐          ┌─────────────────────────┐
      │  PostgreSQL          │          │  AI Pipeline Service     │
      │  (SQLAlchemy +       │          │  (packages/ai)           │
      │   Repository Pattern)│          │  - Wall detection         │
      └─────────────────────┘          │  - Frame compositing      │
                 ▲                     │  - SDXL / Flux / ControlNet│
                 │                     └──────────┬───────────────┘
      ┌─────────────────────┐                     │
      │  Redis                │◄────────────────────┘
      │  Cache + Job Queue    │
      └─────────────────────┘
                 ▲
                 │
      ┌─────────────────────┐
      │  Cloudflare R2        │
      │  Image / Asset Storage│
      └─────────────────────┘
```

---

## Component Breakdown

### apps/web (Next.js)
- Renders public site (marketing, catalog, AI preview UI) and authenticated portals (customer, distributor, admin).
- Uses Server Components for data-heavy pages (product catalog, dashboards) and Client Components for interactive tools (room visualizer canvas, cart).
- Server Actions used for form submissions and simple mutations; complex mutations go through the FastAPI REST API.

### apps/api (FastAPI)
- Stateless REST API, horizontally scalable behind Traefik.
- Organized by domain module: `auth`, `products`, `quotations`, `orders`, `crm`, `inventory`, `ai`.
- Each module follows: `router → service → repository → model`.
- Async throughout; uses SQLAlchemy 2.0 async engine.

### packages/database
- SQLAlchemy models, Alembic migrations, and repository implementations shared by the API.
- No business logic — pure data access layer.

### packages/ai
- Provider-agnostic wrapper around LLM APIs (Gemini, OpenAI, Claude) for text/chat features.
- Vision pipeline for frame preview and room visualization (see `AI_PIPELINE.md`).
- Exposes a clean internal interface so the API layer never talks to model providers directly.

### packages/ui
- Shared design system built on Shadcn UI + Tailwind, consumed by `apps/web`.

### packages/shared
- Shared TypeScript/Python types, constants, and validation schemas (kept in sync manually or via codegen from `API_SPEC.md`).

### packages/config
- Centralized environment/config loading and validation (no scattered `process.env` / `os.environ` access).

---

## Data Flow: AI Room Visualizer (example)

1. User uploads a room photo via `apps/web`.
2. Image is uploaded directly to Cloudflare R2 via a pre-signed URL (avoids proxying large files through the API).
3. `apps/web` calls `POST /api/ai/room-visualizer` with the R2 object key and selected artwork/frame SKU.
4. FastAPI enqueues a job in Redis; the AI Pipeline Service picks it up asynchronously.
5. Pipeline: wall detection → artwork placement → perspective correction → lighting/shadow synthesis → composite render.
6. Result is written back to R2; job status updated in Postgres/Redis.
7. `apps/web` polls (or subscribes via WebSocket/SSE) for job completion and displays the result.

This asynchronous, queue-based pattern is used for all AI generation tasks to avoid blocking API workers and to allow cost/latency control (rate limiting, GPU batching).

---

## Multi-Tenancy Considerations (Future SaaS)

Even though FramePro launches as a single-tenant platform, the schema and service boundaries are designed to support multi-tenancy later:
- All core tables include a nullable `tenant_id` from day one (unused initially, avoids painful migration later).
- Auth and RBAC are designed around organization membership (distributor accounts already imply a lightweight tenant model).
- Config/service layer avoids any global singletons that would break per-tenant isolation.

---

## Environments

| Environment | Frontend | Backend | Database |
|---|---|---|---|
| Local | `next dev` | `uvicorn --reload` | Docker Compose Postgres |
| Staging | Vercel Preview | VPS (staging container) | Managed/staging Postgres |
| Production | Vercel Production | VPS (production container, behind Traefik) | Managed Postgres (with backups) |

---

## Key Architectural Decisions (ADR Summary)

| Decision | Rationale |
|---|---|
| Next.js + FastAPI split (not full-stack Next.js) | Python ecosystem needed for AI/ML (PyTorch, OpenCV); keeps AI workloads isolated from the web tier |
| Repository Pattern for all DB access | Testability, and insulates business logic from ORM specifics |
| Queue-based AI processing (Redis) | AI generation is slow/expensive; must not block request/response cycle |
| Cloudflare R2 over S3 | Cost (no egress fees), good enough S3-compatible API |
| Monorepo (apps/ + packages/) | Shared types and UI components across web/api without duplicate publishing overhead |

See `DEPLOYMENT.md` for infrastructure/deployment details and `DATABASE.md` for schema details.
