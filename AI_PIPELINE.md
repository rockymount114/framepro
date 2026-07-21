# AI_PIPELINE.md

## Overview
This document describes the AI image-processing pipeline that powers Frame Preview, Room Visualizer, Frame Recommendation, and (future) AI Interior Designer features. It lives conceptually in `packages/ai` and runs as an asynchronous, queue-driven service separate from the main API request/response cycle (see `ARCHITECTURE.md`).

---

## Pipeline Goals

- Produce photorealistic, trustworthy previews — inaccurate previews damage trust more than no preview at all.
- Keep latency and GPU cost bounded and predictable.
- Be provider/model agnostic where possible, so individual models can be swapped as better ones become available.

---

## Feature 1: AI Frame Preview

**Input:** A photo of artwork (or a flat image) + a selected frame SKU (material, color, width, texture).

**Steps:**
1. **Preprocessing** — normalize orientation/EXIF, resize to a working resolution, validate file type/size.
2. **Subject extraction** — detect the artwork boundary (if the photo includes background) using edge detection / segmentation (OpenCV, optionally SAM2 for irregular cases).
3. **Frame compositing** — apply the frame's PBR texture and geometry around the detected artwork boundary, respecting selected width/depth proportions.
4. **Lighting normalization** — adjust frame shading to roughly match the artwork's apparent lighting direction.
5. **Output** — composited image written to Cloudflare R2, job marked `completed`.

**Models/tools:** OpenCV (classic CV) for v1; SAM2 introduced for more complex/irregular artwork boundaries in later iterations.

---

## Feature 2: AI Room Visualizer

**Input:** A photo of a room + one or more artwork/frame selections + placement intent (single piece or gallery wall).

**Steps:**
1. **Preprocessing** — same normalization as above; additional check for minimum resolution (low-res room photos degrade wall detection).
2. **Wall detection** — segment candidate wall planes using a vision model (Grounding DINO for object/region grounding + a segmentation step; Florence-2 evaluated as an alternative for combined detection+captioning).
3. **Perspective estimation** — estimate the wall plane's orientation/vanishing points to compute a homography for correct artwork perspective.
4. **Placement** — position the frame(s) on the detected wall according to user input (center, gallery layout template, custom drag position from the frontend).
5. **Compositing & lighting** — use a diffusion-based compositing/inpainting model (Stable Diffusion XL or Flux, with ControlNet conditioning on the wall geometry) to blend the frame into the scene with realistic shadows and lighting.
6. **Post-processing** — resolution upscaling if needed, color correction, watermark (for free-tier previews, if applicable).
7. **Output** — final composite to R2; job marked `completed`.

**Models/tools:** Grounding DINO / Florence-2 (wall & object detection), SAM2 (fine segmentation), SDXL or Flux + ControlNet (photorealistic compositing).

**Failure handling:** If wall detection confidence is below threshold, the job returns a `needs_manual_placement` status rather than a low-quality guess — the frontend then allows the user to manually mark wall corners.

---

## Feature 3: AI Frame Recommendation

**Input:** Uploaded photo/room (reuses artifacts from Feature 1/2 where available) + optional user preferences (style, budget).

**Steps:**
1. Extract dominant colors and general style descriptors from the image (classic CV + a lightweight vision-language model call).
2. Prompt an LLM (Gemini/OpenAI/Claude, provider-agnostic) with structured image features + product catalog constraints to produce a ranked recommendation (frame color, width, style) with a short rationale.
3. Validate the LLM's SKU references against the actual catalog (never trust the LLM to invent valid SKUs — always cross-check against `frame_profiles`).

**Output:** Ranked list of recommended frame SKUs with short natural-language rationale, returned via `/ai/recommend`.

---

## Feature 4: AI Product Search

**Input:** Free-text query (e.g., "I want a luxury black frame").

**Steps:**
1. Query embedding generated via an embedding model.
2. Vector similarity search against pre-computed embeddings of product descriptions/attributes (stored in a vector index — evaluate pgvector on Postgres before introducing a separate vector DB).
3. Optional LLM re-ranking step for ambiguous queries.

**Output:** Ranked product results, same shape as standard catalog search results.

---

## Feature 5: AI Interior Designer (future, Phase 4)

**Input:** Room type/style prompt (e.g., "minimal living room gallery wall").

**Steps:**
1. LLM generates a layout plan (number of frames, relative sizes, spacing, suggested styles) constrained to realistic gallery-wall templates.
2. Layout plan is rendered either as a schematic diagram (fast, cheap) or as a full photorealistic generated room scene (SDXL/Flux, slower/costlier) depending on user tier/request.
3. Recommended frame SKUs are validated against the catalog, as in Feature 3.

---

## Feature 6: AI Sales Assistant

**Input:** User chat message + conversation history + relevant context (current product page, cart contents, order status if authenticated).

**Steps:**
1. Retrieve relevant context (RAG over product catalog, FAQ, shipping policy documents).
2. LLM call (streaming) with system prompt constraining scope to FramePro products/policies; explicit instruction not to fabricate pricing, lead times, or SKU details — always defer to live catalog/inventory data pulled via function calling / tool use.
3. Escalation: if the user's intent matches "high-value" signals (large wholesale quantity, custom project, complaint), the assistant offers a handoff to a human sales rep and creates a CRM lead automatically.

---

## Job Queue & Infrastructure

- All AI jobs are enqueued in Redis and processed by dedicated worker processes (potentially GPU-backed, separate from the web-facing API containers).
- Job records live in the `ai_jobs` table (see `DATABASE.md`) with `status`, `input_payload`, `result_url`, `cost_cents`.
- Workers report cost and latency metrics per job for budgeting and model comparison.
- Idempotency: identical `(input image hash, frame SKU, options)` combinations reuse a cached result rather than regenerating.

---

## Cost & Latency Controls

- Rate limiting per user/IP on all `/ai/*` endpoints.
- Tiered quality: default previews use faster/cheaper models; a "high quality" option (if offered) uses slower diffusion-based rendering, clearly communicated as taking longer.
- Aggressive caching (by image hash + SKU + options) to avoid regenerating identical results.
- Timeouts with graceful fallback: if generation exceeds a max duration, the job fails gracefully and the user is offered a retry rather than an indefinite spinner.

---

## Model Evaluation Process

New models (or model versions) are evaluated on:
1. **Accuracy** — wall detection precision/recall, frame compositing realism (human eval + automated metrics where applicable).
2. **Latency** — p50/p95 generation time.
3. **Cost** — per-generation GPU/API cost.
4. **Safety** — no generation of inappropriate content; input images are validated before being sent to any generative model.

Evaluation results and model version decisions should be logged (e.g., in a changelog section of this document or a linked internal doc) so architecture decisions remain traceable over time.

---

## Related Documents
`ARCHITECTURE.md` (where this pipeline fits in the system), `API_SPEC.md` (public API contract for AI endpoints), `DATABASE.md` (`ai_jobs` schema).
