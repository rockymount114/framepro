# PRD.md — Product Requirements Document

## Product Name
FramePro — AI-powered Picture Frame & Interior Visualization Platform

## Owner
Product/Engineering leadership (see `AGENTS.md` for AI-assisted contributors)

---

## 1. Problem Statement

Buying premium picture frame mouldings — whether as a consumer, interior designer, or B2B distributor — is currently a low-trust, low-visualization process. Customers can't easily see how a frame will look on their wall or with their artwork before committing, and B2B buyers (distributors, hotels) face slow, manual quotation and ordering workflows. FramePro solves both problems with AI-powered visualization and a modern, self-serve B2B commerce layer.

---

## 2. Target Users / Personas

### Consumer — "Design-conscious Homeowner"
Wants to frame art/photos, cares about aesthetics, unsure about size/color/style, wants to see the result before buying.

### Interior Designer
Sourcing frames at scale for client projects, needs fast visualization and professional presentation materials.

### Hotel / Hospitality Buyer
Needs large-volume, consistent framing across many rooms, cares about durability, lead time, and container logistics.

### Distributor / Dealer
Needs wholesale pricing, inventory visibility, easy reordering, and marketing materials to resell FramePro products.

### Architect / Art Business
Needs technical specs (PBR textures, 3D models) for renders and specification documents.

---

## 3. Core User Journeys

### 3.1 Consumer: Preview & Purchase
1. Lands on homepage or product page.
2. Uploads a photo of artwork or their room.
3. Selects a frame from the catalog.
4. Sees an AI-generated realistic preview.
5. Adjusts frame width/color and sees updated preview.
6. Adds to cart or requests a sample.
7. Checks out (or contacts sales for custom sizes).

**Acceptance criteria:**
- Preview generation completes in a bounded, communicated time (target: under 15s, with loading state).
- Preview accurately reflects selected frame color/width/finish.
- Works on mobile (majority of traffic expected to be mobile).

### 3.2 Distributor: Wholesale Order
1. Logs into Distributor Portal.
2. Browses catalog with wholesale pricing.
3. Adds items to wholesale cart; system validates MOQ and container quantities.
4. Requests or auto-generates a quotation (FOB/EXW/DDP, multi-currency).
5. Approves quotation, submits purchase order.
6. Tracks order status through production → shipment → delivery.

**Acceptance criteria:**
- MOQ violations are blocked with a clear message before checkout.
- Quotation PDF is generated and downloadable within seconds.
- Order status is visible and updates without manual admin intervention where possible.

### 3.3 Interior Designer: Room Visualization
1. Uploads a photo of the client's room.
2. System detects wall(s) automatically.
3. Designer places one or more artworks/frames on the wall.
4. System generates a photorealistic composite with correct perspective and lighting.
5. Designer downloads/exports the visualization for a client presentation.

**Acceptance criteria:**
- Wall detection works reliably across a range of room photo qualities/angles.
- Multiple frame placement (gallery wall) is supported.
- Exported image is high-resolution enough for presentation use.

---

## 4. Feature Requirements

### 4.1 AI Frame Preview (P0)
- Input: user photo (artwork or wall) + selected frame SKU.
- Output: composited image showing frame applied realistically (correct proportions, material/texture rendering).
- Must support common frame shapes/sizes in the initial catalog.

### 4.2 AI Room Visualizer (P0 for Phase 3)
- Wall detection, artwork placement, perspective correction, lighting/shadow synthesis.
- Support single and multi-frame (gallery wall) layouts.

### 4.3 AI Frame Recommendation (P1)
- Analyze uploaded photo/room for color palette, lighting, furniture style.
- Recommend frame color, width, and style with a brief rationale.

### 4.4 AI Product Search (P1)
- Natural language search box ("I want a luxury black frame") returns ranked, relevant catalog matches.

### 4.5 AI Interior Designer (P2)
- Generate full room/gallery-wall concepts (e.g., "minimal living room", "luxury hotel corridor") with recommended frame layouts, sizes, and spacing.

### 4.6 AI Sales Assistant (P2)
- Chatbot capable of product consultation, quotation assistance, and shipping/technical Q&A, with graceful handoff to a human for complex/high-value inquiries.

### 4.7 Distributor Portal (P0 for Phase 2)
- Login, wholesale pricing tiers, inventory visibility, order history, invoices, container planning, marketing material downloads, sample requests, dealer locator.

### 4.8 Quotation System (P0 for Phase 2)
- PDF generation with FOB/EXW/DDP terms, multi-currency, tax, shipping, discounts, validity period, digital signature support.

### 4.9 CRM (P1)
- Lead management, customer tags, email tracking, sales pipeline, follow-up reminders, meeting notes, file attachments.

### 4.10 Inventory Management (P1)
- Warehouse tracking (US + China), container status, production status, shipment tracking.

### 4.11 AR Preview (P3, Phase 5)
- WebXR-based, place frame on a real wall via phone camera.

---

## 5. Non-Functional Requirements

- **Performance:** Lighthouse 95+, LCP < 2s, CLS < 0.1 (see `GEMINI.md` performance targets).
- **Accessibility:** WCAG 2.1 AA compliance across all customer-facing pages.
- **SEO:** Server-side rendering, structured data (Schema.org), Open Graph tags on all public pages.
- **Security:** See security checklist in `CLAUDE.md` and `DEPLOYMENT.md`.
- **Scalability:** AI generation workloads must be queue-based and horizontally scalable; must not degrade core site performance under load.
- **Internationalization readiness:** Multi-currency support required for Phase 2; full i18n (multi-language UI) is a future consideration, not required for MVP.

---

## 6. Out of Scope (MVP)

- Native mobile apps
- Full custom payment gateway (use Stripe/PayPal)
- Multi-tenant SaaS (architecture should allow it later — see `ARCHITECTURE.md` — but not required at launch)
- AR preview (Phase 5, not MVP)

---

## 7. Open Questions

- Which vision models (SAM2 vs Grounding DINO vs a hybrid) give the best wall-detection accuracy/cost tradeoff? (Owned by AI Pipeline agent — see `AGENTS.md`.)
- What is the pricing/tiering model for the future SaaS platform expansion?
- Do we need real-time FX rates for multi-currency quotations at launch, or is a daily-refreshed static rate acceptable?

---

## 8. Related Documents
`ROADMAP.md` (phasing/timeline), `ARCHITECTURE.md` (system design), `API_SPEC.md` (contract-level detail), `AI_PIPELINE.md` (AI implementation detail), `UI_GUIDELINES.md` (design system).
