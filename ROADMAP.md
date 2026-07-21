# ROADMAP.md

## Purpose
High-level phased roadmap for FramePro, from MVP launch to a full AI-powered framing ecosystem. Timelines are illustrative (quarters, not fixed dates) and should be adjusted based on team capacity and validated demand.

---

## Phase 0 — Foundation (Pre-launch)
**Goal:** Technical foundation and core catalog live.

- [ ] Monorepo scaffolding (`apps/web`, `apps/api`, `packages/*`)
- [ ] Design system setup (Shadcn UI + Tailwind theme: black/white/gray + gold/copper/walnut accents)
- [ ] Product data model (frame profiles, SKUs, pricing tiers)
- [ ] Static/SSR product catalog pages (SEO-friendly)
- [ ] Basic auth (customer + admin roles)
- [ ] CI/CD pipeline (GitHub Actions → Docker → VPS via Traefik)
- [ ] Analytics + SEO baseline (structured data, Open Graph, sitemap)

---

## Phase 1 — MVP Launch
**Goal:** Public site live with core lead-gen and preview functionality.

- [ ] Homepage with all core modules (Hero, Featured Collections, Gallery, Testimonials, Contact)
- [ ] AI Frame Preview v1 (upload photo → overlay frame, 2D compositing only)
- [ ] Product detail pages with full spec sheet (SKU, dimensions, material, finish, MOQ, etc.)
- [ ] Contact/lead capture forms wired into CRM (basic lead management)
- [ ] Sample request flow
- [ ] Basic quotation request (manual/semi-automated, no PDF generation yet)
- [ ] Performance targets met: Lighthouse 95+, LCP < 2s, CLS < 0.1

---

## Phase 2 — B2B & Commerce Core
**Goal:** Distributors can log in, browse wholesale pricing, and place orders.

- [ ] Distributor Portal (login, wholesale pricing, catalog download)
- [ ] Automated PDF Quotation System (FOB/EXW/DDP, multi-currency, tax, shipping, digital signature)
- [ ] Wholesale ordering with MOQ validation and inventory checks
- [ ] Payment integration (Stripe, PayPal, bank transfer / purchase orders)
- [ ] Inventory management (US + China warehouses, container/production/shipment status)
- [ ] CRM v2: sales pipeline, follow-up reminders, email tracking

---

## Phase 3 — AI Room Visualizer & Recommendation
**Goal:** Move from static frame preview to full room-context AI visualization.

- [ ] AI Room Visualizer (wall detection, artwork placement, perspective + lighting correction)
- [ ] AI Frame Recommendation engine (analyze photo/room/furniture/lighting → recommend frame color/width/style)
- [ ] AI Product Search (natural language → matching products)
- [ ] Result caching + cost/latency optimization for AI pipeline
- [ ] A/B testing framework for AI-driven recommendations vs manual browsing

---

## Phase 4 — AI Interior Designer & Sales Assistant
**Goal:** Higher-value AI experiences that differentiate FramePro from commodity frame suppliers.

- [ ] AI Interior Designer (generate full gallery wall / room concepts: hotel, living room, office, restaurant)
- [ ] AI Sales Assistant chatbot (product consultant, quotation assistant, shipping/technical Q&A)
- [ ] Personalized recommendations based on browsing/order history
- [ ] Expanded case studies / hotel project showcase pipeline

---

## Phase 5 — AR & Immersive Preview
**Goal:** Let users place frames on their actual wall in real time.

- [ ] WebXR-based AR preview (mobile browser)
- [ ] iPhone AR / Android AR native-quality experience
- [ ] Apple Vision Pro exploration
- [ ] AR-to-cart flow (place in AR → add to cart with size auto-detected)

---

## Phase 6 — Platform & Ecosystem
**Goal:** Evolve from a single company's storefront into a multi-tenant industry platform.

- [ ] Multi-tenant SaaS support (manufacturers, distributors, retailers as separate tenants)
- [ ] Public API for partners (interior designers, architects, hotels)
- [ ] Marketplace features connecting manufacturers ↔ distributors ↔ retailers
- [ ] Advanced analytics/BI dashboards for tenants
- [ ] White-label options for large distributor/hotel accounts

---

## Success Metrics by Phase

| Phase | Primary Metric |
|---|---|
| Phase 1 | Qualified lead volume, bounce rate, Lighthouse scores |
| Phase 2 | Distributor sign-ups, wholesale order volume, quotation turnaround time |
| Phase 3 | AI preview engagement rate, conversion lift from recommendations |
| Phase 4 | AI chatbot resolution rate, interior-design-to-quote conversion |
| Phase 5 | AR session count, AR-to-cart conversion |
| Phase 6 | Number of active tenants, GMV across the platform |

---

## Out of Scope (for now)

- Native mobile apps (web-first, PWA-capable, revisit post Phase 5)
- Full 3D room reconstruction (beyond wall-plane detection) — revisit if AR adoption is strong
- In-house payment processing (rely on Stripe/PayPal rather than building a payment gateway)

This roadmap should be reviewed quarterly and updated in coordination with `PRD.md` for feature-level detail.
