# AGENTS.md

## Purpose
FramePro is developed with the help of multiple AI coding assistants (Gemini, Claude, Codex/OpenAI, and potentially task-specific sub-agents). This document defines how work is divided, how agents should hand off context to each other, and the shared rules every agent must respect regardless of vendor.

---

## Shared Ground Rules (apply to every agent)

1. `GEMINI.md` is the source of truth for vision, tech stack, and architecture.
2. `CLAUDE.md` is the source of truth for code-level style and review standards.
3. No agent hardcodes secrets, bypasses auth, or writes inline SQL.
4. No agent merges/ships a change without tests for critical business logic (pricing, quotation, inventory, payments).
5. Any agent that changes a database schema must update `DATABASE.md` in the same change.
6. Any agent that changes an API contract must update `API_SPEC.md` in the same change.
7. When an agent is uncertain about scope, it should propose the smallest viable change and flag open questions rather than guessing silently.

---

## Agent Roles

### 1. Gemini — Chief Architect / Project Orchestrator
**Responsibilities:**
- Owns overall architecture decisions and cross-cutting concerns (folder structure, service boundaries, tech stack choices).
- Reviews large-scale changes for consistency with `GEMINI.md`.
- Coordinates multi-step features that span frontend, backend, and AI pipeline.
- First point of contact for "how should this system be designed" questions.

**Typical tasks:**
- Designing new service boundaries (e.g. splitting out a quotation microservice)
- Reviewing/updating `ARCHITECTURE.md` and `ROADMAP.md`
- Making build-vs-buy calls (e.g. Better Auth vs Auth.js)

---

### 2. Claude — Senior Implementation Engineer / Code Reviewer
**Responsibilities:**
- Implements features end-to-end (frontend + backend) following `CLAUDE.md` standards.
- Performs code review on PRs, focused on security, correctness, and maintainability.
- Writes and maintains tests for critical business logic.
- Refactors code that has drifted from Clean Architecture / SOLID principles.

**Typical tasks:**
- Building the quotation PDF generation service
- Implementing the distributor portal order flow
- Reviewing AI-generated code from other agents before merge

---

### 3. Codex / OpenAI-based agents — Rapid Prototyping & Scripting
**Responsibilities:**
- Fast prototyping of UI components, one-off scripts, and data migration utilities.
- Generating boilerplate (CRUD scaffolding, seed data, test fixtures).
- Not responsible for final architecture decisions — output should be reviewed by Claude or Gemini before merging into `main`.

**Typical tasks:**
- Scaffolding a new admin dashboard page
- Writing a data migration script for legacy product SKUs
- Generating mock data for AI pipeline testing

---

### 4. Specialized AI Pipeline Agent (image/vision-focused)
**Responsibilities:**
- Owns the AI image processing pipeline (`packages/ai`): frame preview, room visualizer, wall detection, artwork placement.
- Evaluates and integrates vision models (SAM2, Grounding DINO, Florence-2, SDXL, Flux, ControlNet).
- Maintains `AI_PIPELINE.md`.

**Typical tasks:**
- Tuning the wall-detection + perspective-correction pipeline
- Benchmarking SDXL vs Flux for realistic frame compositing
- Optimizing GPU inference cost and latency

---

## Handoff Protocol

When one agent's output becomes input for another agent's task, the handoff must include:

1. **What was built** — a one-paragraph summary.
2. **What changed** — files touched, schema/API changes.
3. **What's not done** — explicitly list known gaps, TODOs, or deferred edge cases.
4. **How to verify** — commands to run tests, or manual QA steps.

Example handoff note:
```
Handoff: Quotation PDF generation (Claude → Gemini)
- Built: POST /api/quotations/:id/pdf generates a branded PDF with FOB/EXW/DDP terms.
- Changed: packages/database (new `quotations` table), packages/shared (PDF template types).
- Not done: multi-currency conversion is stubbed with static rates; needs a real FX provider.
- Verify: `pytest apps/api/tests/quotations` and manually hit the endpoint with a sample quote.
```

---

## Escalation Rules

- If two agents propose conflicting architecture approaches, Gemini's design decision is authoritative.
- If a security concern is identified by any agent, work pauses on that area until Claude (or a human reviewer) signs off.
- If an agent is asked to do something that contradicts `GEMINI.md` principles (e.g. "just hardcode this API key for now"), it should refuse and propose a compliant alternative.

---

## Human-in-the-Loop Checkpoints

Regardless of which agent does the work, a human reviewer should sign off before:
- Merging changes to payment or checkout flows
- Deploying schema migrations to production
- Rotating or introducing new third-party API integrations
- Launching a new major AI feature (cost/latency implications)
