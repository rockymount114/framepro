# GEMINI.md

## Project
FramePro — AI-powered Picture Frame & Interior Visualization Platform

This document defines the overall engineering and product principles that any AI coding assistant (Gemini CLI, Gemini Code Assist, or equivalent) must follow when working on FramePro. Treat this as instructions from the CTO, not a simple prompt.

---

## Vision

FramePro is not just another picture frame supplier website. The long-term vision is to become the leading AI platform for the framing industry, enabling customers, interior designers, distributors, hotels, and art businesses to visualize, customize, quote, and order premium PS picture frame mouldings online.

The platform combines:
- AI Interior Design
- AI Room Visualization
- AI Frame Preview
- AI Product Recommendation
- B2B Distributor Portal
- Online Quotation System
- Sample Ordering
- Inventory Management
- CRM
- AR Preview

FramePro should become the **"Canva + Shopify + Houzz" for the picture framing industry**.

---

## Primary Goals

1. Generate qualified B2B leads
2. Showcase premium PS moulding collections
3. Allow customers to upload photos and preview frames
4. Allow customers to upload room photos and preview framed artwork
5. Allow distributors to place wholesale orders
6. Automate quotation generation
7. Support future AI-powered interior design
8. Build an enterprise-ready SaaS architecture

---

## Tech Stack

**Frontend**
- Next.js (latest)
- React
- TypeScript
- TailwindCSS
- Shadcn UI
- Framer Motion

**Backend**
- FastAPI
- Python 3.12+
- SQLAlchemy
- PostgreSQL
- Redis

**Storage**
- Cloudflare R2

**Authentication**
- Better Auth (or Auth.js)

**Deployment**
- Docker
- Docker Compose
- GitHub Actions
- Traefik
- Cloudflare Tunnel

**Hosting**
- Frontend: Vercel
- Backend: VPS + Docker
- Database: PostgreSQL

**Image Processing**
- Pillow
- OpenCV

**AI**
- PyTorch

**Future Models**
- SAM2
- Grounding DINO
- Florence-2
- Stable Diffusion XL
- Flux
- ControlNet

**LLM Providers**
- Gemini API
- OpenAI API
- Claude API

---

## Development Principles

**Always:**
- Strong typing
- Clean Architecture
- SOLID principles
- Repository Pattern
- Modular design
- Reusable components
- Mobile first
- Responsive
- SEO friendly
- Server-side rendering
- Accessibility (WCAG 2.1 AA)
- High performance

**Never:**
- Write duplicated code
- Hardcode secrets
- Use inline SQL
- Build monolithic files

---

## Folder Structure

```
/apps
  web
  api
/packages
  ui
  config
  database
  ai
  shared
/docker
/docs
/scripts
/assets
```

---

## UI Style

**Style:** Modern, Minimal, Luxury, Premium
**Inspired by:** Apple, Tesla, Linear, Notion, Vercel
**Avoid:** Traditional B2B websites, old Bootstrap appearance, heavy shadows, busy layouts

### Color Palette
- Primary: Black, White, Gray
- Accent: Gold, Copper, Walnut
- Optional: Dark Mode

---

## Homepage Modules

Hero, Featured Collections, AI Preview, Room Visualizer, Interior Inspiration, Hotel Projects, Gallery, Case Studies, Testimonials, Distributor Program, Latest Articles, Contact

---

## Product System

Every frame profile must contain:
SKU, Width, Height, Depth, Material, Finish, Texture, Wood Grain, Color, Application, Weight, Packing, MOQ, Container Quantity, Images, 3D Model, Normal Map, PBR Texture, Installation Guide, PDF Catalog

---

## AI Features

### AI Frame Preview
User uploads photo → Select frame → Generate realistic framed image

### AI Room Visualizer
User uploads room → Detect wall → Place artwork → Generate perspective → Apply lighting → Generate realistic result

### AI Frame Recommendation
Analyze: Photo, Room, Furniture, Color, Lighting
Recommend: Frame, Color, Width, Style

### AI Interior Designer
Generate: Gallery Wall, Luxury Hotel, Minimal Living Room, Modern Office, Restaurant, Luxury Apartment
Automatically recommend: Frame layouts, Artwork size, Spacing, Frame styles

### AI Product Search
Natural language query (e.g. "I want a luxury black frame") returns matching products.

### AI Sales Assistant
Chatbot acting as Product Consultant, Quotation Assistant, and Shipping/Technical Q&A.

---

## Future AR
Support WebXR, Apple Vision Pro, iPhone AR, Android AR — allow users to place a frame on a real wall.

---

## Distributor Portal
Distributor Login, Wholesale Pricing, Inventory, Order History, Invoices, Container Planning, Marketing Materials, Catalog Download, Sample Requests, Dealer Locations

---

## CRM
Lead Management, Customer Tags, Email Tracking, Sales Pipeline, Follow-up Reminders, Meeting Notes, File Attachments

---

## Quotation System
Generate PDF quotation supporting FOB, EXW, DDP, multiple currencies, tax, shipping, discount, validity, digital signature

---

## Ordering System
Shopping Cart, Wholesale Cart, MOQ Validation, Inventory Check, Online Payment (Stripe, PayPal, Bank Transfer), Purchase Orders

---

## Inventory
Warehouse (US, China), Container Status, Production Status, Shipment Tracking

---

## Marketing
SEO, Blog, Pinterest, Instagram, LinkedIn, Google Merchant, Structured Data, Open Graph, Schema.org

---

## Performance Targets
- Lighthouse: 95+
- CLS: Below 0.1
- LCP: Below 2 seconds
- Accessibility: 95+

---

## Security
HTTPS, Rate Limiting, CSRF, XSS Protection, CSP, Image Validation, Virus Scan, JWT, Role Permissions, Audit Logs

---

## Docker
Every service should have its own Dockerfile. Support Docker Compose and production deployment. Environment variables managed through `.env` files. No secrets inside repositories.

---

## Coding Rules
- Every component must be reusable.
- Every API must be documented.
- Every function should include clear comments where appropriate.
- Prefer composition over inheritance.
- Prefer async programming.
- Prefer server actions where appropriate.
- Avoid unnecessary dependencies.

---

## Documentation
Every major feature should include: Architecture Diagram, API Documentation, Database Schema, Sequence Diagram, Deployment Guide, Testing Guide, Future Improvements

---

## Long-term Vision

FramePro should evolve into the largest AI-powered framing ecosystem in North America, eventually connecting Manufacturers, Distributors, Retailers, Interior Designers, Hotels, Architects, Artists, Photographers, and Consumers into one intelligent platform.

---

## AI Coding Assistant Instructions

When generating code:
- Prioritize maintainability over shortcuts.
- Produce production-ready code.
- Prefer scalable architecture.
- Follow industry best practices.
- Explain major architectural decisions.
- Avoid overengineering.
- Keep APIs RESTful unless GraphQL provides a clear benefit.
- Generate tests for critical business logic.
- Suggest performance optimizations when relevant.
- Prefer reusable UI components over page-specific implementations.
- Design with future SaaS multi-tenant support in mind.

**Always think as the lead software architect for FramePro, not merely as a code generator.**

---

## Related Documents

| Document | Purpose |
|---|---|
| `CLAUDE.md` | Claude-specific coding standards |
| `AGENTS.md` | AI agent roles and responsibilities |
| `ARCHITECTURE.md` | System architecture |
| `ROADMAP.md` | Product roadmap |
| `PRD.md` | Product requirements document |
| `API_SPEC.md` | API specification |
| `DATABASE.md` | Database design |
| `AI_PIPELINE.md` | AI image processing pipeline |
| `DEPLOYMENT.md` | Docker & deployment guide |
| `UI_GUIDELINES.md` | UI/UX design guidelines |
