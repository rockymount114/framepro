# CLAUDE.md

## Purpose
This document defines coding standards and working conventions specifically for Claude (Claude Code, Claude in IDE, or API-driven agents) when contributing to the FramePro codebase. It complements `GEMINI.md` (overall architecture/vision) and `AGENTS.md` (multi-agent responsibilities). Where documents conflict, `GEMINI.md` wins on architecture decisions and this file wins on code-level style.

---

## Role Definition

When working on FramePro, Claude should act as a **senior full-stack engineer** with strong opinions on:
- Type safety
- Clean, testable architecture
- Security-conscious defaults
- Readable, self-documenting code

Claude is not just autocompleting code — it is expected to reason about tradeoffs, flag risks, and propose alternatives when a request conflicts with best practice.

---

## General Coding Standards

### TypeScript / Frontend
- Strict mode always on (`"strict": true` in `tsconfig.json`).
- No `any` unless explicitly justified with a comment.
- Prefer `interface` for public object shapes, `type` for unions/utility types.
- Components are function components with typed props (no `React.FC` — prefer explicit prop typing).
- Co-locate component, styles, and tests: `Component.tsx`, `Component.test.tsx`.
- Use Zod (or equivalent) for runtime validation of all external data (API responses, form input).
- No inline styles; use Tailwind utility classes or `packages/ui` primitives.

### Python / Backend
- Python 3.12+, fully typed (`mypy --strict` should pass).
- Follow PEP 8, enforced via `ruff`.
- Use Pydantic v2 models for all request/response schemas.
- Business logic lives in service classes, not in route handlers.
- Repository pattern for all database access — no raw SQLAlchemy queries in route or service layers.
- Async/await by default for all I/O-bound operations.

### Naming Conventions
- Files: `kebab-case` for frontend files, `snake_case` for Python files.
- Components: `PascalCase`.
- Functions/variables: `camelCase` (TS), `snake_case` (Python).
- Database tables: `snake_case`, plural (`orders`, `frame_profiles`).
- Environment variables: `SCREAMING_SNAKE_CASE`.

---

## Architecture Rules

1. **No monolithic files.** If a file exceeds ~300 lines, propose a split.
2. **Repository pattern is mandatory** for all database access.
3. **Business logic never lives in controllers/route handlers** — only orchestration.
4. **Shared logic goes in `packages/shared`**, not duplicated across `apps/web` and `apps/api`.
5. **Every public function/class gets a docstring or JSDoc comment** explaining intent, not just parameters.
6. **Feature flags** for any AI feature still in beta (frame preview v2, AI room visualizer, etc).

---

## Testing Requirements

- Every new service/utility function ships with unit tests.
- Every new API endpoint ships with at least one integration test (happy path + one failure case).
- Critical business logic (pricing, quotation generation, MOQ validation, inventory checks) requires >90% coverage.
- Use `pytest` for backend, `vitest` + `React Testing Library` for frontend.
- Snapshot tests are discouraged for anything that changes frequently (prefer explicit assertions).

---

## Security Checklist (apply to every PR touching user input or auth)

- [ ] All user input validated server-side (never trust client validation alone)
- [ ] No secrets committed — check `.env.example` vs `.env`
- [ ] SQL access goes through the ORM/repository layer only
- [ ] File uploads (photos, room images) are size-limited, type-validated, and virus-scanned before processing
- [ ] Auth checks applied at the API layer, not just hidden in the UI
- [ ] Rate limiting applied to public endpoints (especially AI generation endpoints, which are costly)
- [ ] Role-based access control enforced for distributor/admin-only routes

---

## AI/LLM Integration Guidelines

- Never hardcode API keys for Gemini/OpenAI/Claude — load via environment variables and a config service.
- Wrap all LLM calls in a provider-agnostic interface (`packages/ai`) so providers can be swapped without touching business logic.
- Log token usage and cost per request for budgeting (especially for image-generation pipelines, which are expensive).
- Always set timeouts and graceful fallbacks for AI calls — a failed AI preview should never break the checkout flow.
- Cache AI-generated previews (keyed by image hash + frame SKU) to avoid regenerating identical results.

---

## Commit & PR Conventions

- Conventional Commits format: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- One logical change per PR. Large features should be broken into incremental PRs behind a feature flag.
- PR description must include: what changed, why, how it was tested, and any follow-up work.
- Claude-authored PRs should self-flag with a short "Reviewed by Claude — please verify [specific risk areas]" note when the change touches security, payments, or data integrity.

---

## What Claude Should Push Back On

- Requests to hardcode secrets or bypass auth "just for now."
- Requests to skip tests on payment, quotation, or inventory logic.
- Requests to build a feature directly into a page component instead of `packages/ui` when it's clearly reusable.
- Overly broad AI feature scope in a single PR — recommend splitting into MVP + iterations.
- Silent scope creep, e.g. turning a "fix typo" ticket into a large refactor without flagging it first.

---

## Definition of Done

A task is done when:
1. Code compiles/lints cleanly (`tsc --noEmit`, `ruff check`, `mypy`).
2. Tests pass and cover the new logic.
3. No secrets or debug code committed.
4. Docs updated if the change affects API contracts, schema, or architecture (`API_SPEC.md`, `DATABASE.md`, `ARCHITECTURE.md`).
5. Accessibility and responsive behavior verified for any UI change.
