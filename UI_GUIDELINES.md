# UI_GUIDELINES.md

## Design Philosophy
FramePro's visual identity should feel **modern, minimal, luxury, and premium** — closer to Apple, Tesla, Linear, Notion, and Vercel than a traditional B2B supplier site. Every screen should feel intentional, uncluttered, and confident. Avoid anything that reads as a generic Bootstrap template or a dated B2B catalog site.

**Avoid:**
- Heavy drop shadows and skeuomorphic effects
- Busy, information-dense layouts
- Default form styling / unstyled native inputs
- Stock "corporate" imagery or clip-art icons

---

## Color System

### Primary Palette
- **Black** — primary text, high-emphasis UI elements, dark-mode backgrounds
- **White** — primary background (light mode)
- **Gray** — secondary text, borders, subtle backgrounds (use a restrained gray scale, e.g. 5–7 steps)

### Accent Palette
- **Gold** — premium accents, CTAs tied to luxury/premium tiers, highlights
- **Copper** — secondary accent, warm highlights, hover states
- **Walnut** — used sparingly for materials/texture-adjacent UI (e.g. representing wood-finish frame options)

### Usage Rules
- Accent colors (gold/copper/walnut) should be used sparingly — as highlights, not as dominant fills. The base palette should carry ~90% of the UI.
- Maintain WCAG AA contrast ratios (4.5:1 for body text, 3:1 for large text/UI components) for every color combination used.
- Dark mode is optional but should reuse the same palette logic (inverted black/white base, same accent colors) rather than introducing a separate color system.

---

## Typography

- Use a single, high-quality sans-serif typeface family for UI text (headings + body), consistent with the "Apple/Linear/Vercel" reference aesthetic — clean, geometric, excellent readability at small sizes.
- Establish a clear type scale (e.g., a modular scale) rather than ad hoc font sizes — recommend defining this centrally in `packages/ui` as design tokens.
- Generous line height for body copy (1.5–1.6) to reinforce the "minimal, premium" feel.
- Avoid more than 2 font weights in a single view (e.g., Regular + Semibold) to keep hierarchy clean.

---

## Spacing & Layout

- Use a consistent spacing scale (4px or 8px base unit) applied via Tailwind's spacing tokens — no arbitrary pixel values in component code.
- Generous white space is a deliberate part of the "luxury" feel — resist the urge to fill every area with content.
- Grid-based layouts with clear alignment; avoid layouts that feel cramped or asymmetrically cluttered.
- Mobile-first: design and build for narrow viewports first, then progressively enhance for larger screens.

---

## Components

- All shared components live in `packages/ui`, built on Shadcn UI primitives + Tailwind, and must be:
  - Fully typed (props interface, no `any`)
  - Accessible by default (correct ARIA attributes, keyboard navigable, visible focus states)
  - Responsive without component-specific overrides in consuming pages
- Buttons: clear primary/secondary/tertiary hierarchy. Primary CTA uses the accent (gold) sparingly and only for the single most important action per view.
- Forms: custom-styled inputs (never raw browser defaults), clear validation states, accessible error messaging tied to the relevant field via `aria-describedby`.
- Cards/product tiles: consistent aspect ratios for product imagery, minimal border/shadow treatment (prefer subtle 1px borders over drop shadows).

---

## Motion (Framer Motion)

- Motion should be **purposeful, not decorative** — used to communicate state changes (loading, transitions between views, AI preview generation) rather than for flourish.
- Prefer subtle, fast transitions (150–300ms) with easing curves that feel natural (ease-in-out) rather than bouncy/playful easing, to preserve the premium tone.
- AI generation states (frame preview, room visualizer) should use clear, calm loading indicators — avoid gimmicky spinners; prefer a clean progress indicator or skeleton state consistent with the rest of the UI.
- Respect `prefers-reduced-motion` — disable non-essential animation for users who request it.

---

## Imagery & Iconography

- Product photography should be shot/processed consistently: neutral backgrounds, consistent lighting, consistent aspect ratios across the catalog.
- Icons: use a single consistent icon set (line-style, consistent stroke width) — avoid mixing icon styles/sources.
- AI-generated preview images should be visually distinguished subtly (e.g., a small "AI Preview" label) so users always know which images are real product photography vs. generated composites — important for trust.

---

## Homepage Module Guidelines

Reflecting the modules defined in `GEMINI.md` / `PRD.md`:

- **Hero** — a single strong statement + one primary CTA (e.g., "Preview your frame" or "Explore Collections"). Avoid carousel/slider heroes — they hurt performance and engagement.
- **Featured Collections** — visually led, minimal text, consistent card treatment.
- **AI Preview / Room Visualizer** — should feel like the centerpiece interactive tool of the homepage, not a buried feature — give it real visual weight.
- **Gallery / Case Studies / Hotel Projects** — large, high-quality imagery; let the work speak, minimal chrome around it.
- **Testimonials** — understated, no cheesy 5-star iconography; prefer real names/companies with a short, credible quote.
- **Distributor Program** — clearly separated from the consumer-facing sections, with its own concise value proposition and CTA into the Distributor Portal.

---

## Accessibility Requirements (WCAG 2.1 AA)

- All interactive elements reachable and operable via keyboard.
- Visible focus indicators on all focusable elements (never `outline: none` without a replacement).
- Alt text required for all product and AI-generated preview images (see `frame_images.alt_text` in `DATABASE.md`).
- Color is never the only means of conveying information (e.g., error states pair color with an icon/text, not red alone).
- Form errors are programmatically associated with their fields and announced to screen readers.

---

## Performance-Conscious Design

Design decisions should account for the performance targets in `GEMINI.md` (Lighthouse 95+, LCP < 2s, CLS < 0.1):
- Reserve space for images/AI preview results to avoid layout shift (explicit width/height or aspect-ratio containers).
- Avoid heavy above-the-fold animation that delays perceived load.
- Lazy-load below-the-fold imagery (galleries, case studies).
- Prefer SVG/vector icons and optimized (AVIF/WebP) imagery throughout.

---

## Design Tokens & Governance

- All colors, spacing, typography, and radii should be defined as design tokens in `packages/ui` (Tailwind config + CSS variables), not hardcoded per component.
- Any new pattern used more than twice should be extracted into `packages/ui` rather than duplicated.
- Significant visual/UX changes to shared components should be reviewed against this document before merging.

Related: `GEMINI.md` (style direction, color palette source), `PRD.md` (feature-level UX requirements), `ARCHITECTURE.md` (`packages/ui` structure).
