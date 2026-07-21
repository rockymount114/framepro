# DEPLOYMENT.md

## Overview
FramePro's frontend deploys to Vercel; the backend, database, AI pipeline workers, and supporting infrastructure run on a self-managed VPS using Docker, orchestrated via Docker Compose and fronted by Traefik. CI/CD is handled through GitHub Actions.

---

## Infrastructure Summary

| Component | Where it runs |
|---|---|
| `apps/web` (Next.js) | Vercel (production + preview deployments) |
| `apps/api` (FastAPI) | VPS, Docker container behind Traefik |
| AI pipeline workers | VPS (or GPU-enabled host), Docker container(s), consuming Redis queue |
| PostgreSQL | VPS (Dockerized) or managed Postgres provider |
| Redis | VPS, Docker container |
| Cloudflare R2 | Managed object storage (no self-hosting) |
| Traefik | VPS, reverse proxy + automatic TLS |
| Cloudflare Tunnel | Secure ingress to VPS without exposing public ports directly |

---

## Docker Strategy

- **Every service has its own Dockerfile** (`apps/api/Dockerfile`, `packages/ai/Dockerfile` for workers, etc.) — no shared "do everything" image.
- **Multi-stage builds** to keep production images minimal (build dependencies excluded from the final image).
- **Non-root user** inside containers wherever possible.
- **Health checks** defined in each Dockerfile / Compose service so Traefik and orchestration tooling can detect unhealthy containers.

### Example `docker-compose.yml` structure

```yaml
version: "3.9"

services:
  api:
    build: ./apps/api
    env_file: .env
    depends_on: [postgres, redis]
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`api.framepro.com`)"
      - "traefik.http.routers.api.tls.certresolver=cloudflare"
    restart: unless-stopped

  ai-worker:
    build: ./packages/ai
    env_file: .env
    depends_on: [redis, postgres]
    restart: unless-stopped
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  postgres:
    image: postgres:16
    env_file: .env
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7
    restart: unless-stopped

  traefik:
    image: traefik:v3.0
    command:
      - "--providers.docker=true"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.cloudflare.acme.dnschallenge=true"
    ports:
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - traefik-certs:/letsencrypt
    restart: unless-stopped

volumes:
  pgdata:
  traefik-certs:
```

(Illustrative — actual configuration should be reviewed and hardened before production use, e.g. explicit resource limits, network segmentation between services.)

---

## Environments

| Environment | Trigger | Notes |
|---|---|---|
| Local | `docker compose up` | Uses `.env.local`, seeded test data |
| Staging | Push to `develop` branch | Mirrors production topology at smaller scale |
| Production | Push/merge to `main` (after review) | Requires passing CI + manual approval gate for schema migrations |

---

## CI/CD Pipeline (GitHub Actions)

1. **On pull request:**
   - Lint (`ruff`, `eslint`)
   - Type check (`mypy`, `tsc --noEmit`)
   - Unit + integration tests (`pytest`, `vitest`)
   - Build Docker images (cache layers, don't push)
2. **On merge to `develop`:**
   - Build + push images to registry (tagged `staging-<sha>`)
   - Deploy to staging VPS
   - Run smoke tests against staging
3. **On merge to `main`:**
   - Build + push images (tagged `prod-<sha>` and `latest`)
   - Require manual approval if the diff includes a database migration
   - Deploy to production VPS (rolling restart via Docker Compose / Watchtower or equivalent)
   - Run post-deploy smoke tests; automatic rollback to previous image tag on failure

---

## Environment Variables & Secrets

- All configuration via `.env` files, never committed (`.env.example` documents required keys with placeholder values).
- Production secrets stored in GitHub Actions encrypted secrets / a secrets manager, injected at deploy time — never baked into images.
- Required secrets include (non-exhaustive): `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `PAYPAL_CLIENT_SECRET`.

---

## Database Migrations in Deployment

1. Migrations (Alembic) run as a separate step before the API container restarts, not automatically on container boot (to avoid race conditions with multiple replicas starting simultaneously).
2. Migrations must be backward-compatible with the currently running code for at least one deploy cycle (expand/contract pattern) to support zero-downtime rolling deploys.
3. Any migration affecting a large table should be reviewed for lock duration/impact before running against production.

---

## Networking & Security

- Cloudflare Tunnel used to avoid exposing the VPS's public IP/ports directly; only Cloudflare's edge can reach the origin.
- Traefik terminates TLS (via Let's Encrypt / Cloudflare DNS challenge) and routes to internal Docker services over the private Docker network.
- Rate limiting configured at both the Traefik/edge layer (coarse) and the API layer (fine-grained, per-endpoint — especially AI generation endpoints).
- CSP, CSRF protection, and XSS mitigations configured at the Next.js/FastAPI layer (see `CLAUDE.md` security checklist).
- Regular image vulnerability scanning (e.g. `docker scout` or equivalent) as part of CI.

---

## Monitoring & Observability

- Container health checks feed into Traefik routing decisions (unhealthy containers removed from rotation).
- Centralized logging (structured JSON logs from FastAPI and workers) shipped to a log aggregator.
- AI job metrics (latency, cost, failure rate) tracked separately for cost management (see `AI_PIPELINE.md`).
- Uptime/alerting for the production API and the AI worker queue depth (a growing queue indicates worker capacity issues).

---

## Backups & Disaster Recovery

- PostgreSQL: automated daily backups with point-in-time recovery where the hosting provider supports it; backups tested periodically via restore drills.
- Cloudflare R2: versioning enabled on buckets containing user-uploaded content where feasible.
- Documented runbook for full-stack recovery (recreate VPS, restore DB backup, redeploy latest known-good image tags) — should be kept alongside this document and tested at least twice a year.

---

## Related Documents
`ARCHITECTURE.md` (system design context), `DATABASE.md` (migration/schema details), `CLAUDE.md` (security checklist referenced above).
