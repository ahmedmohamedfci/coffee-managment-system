# SaaSFood (`coffee-managment-system`)

Multi-tenant restaurant POS / kitchen display / admin. Public product name **SaaSFood**; folder is still `coffee-managment-system`.

## Maturity

**Beta · side project.** Useful for demos and local multi-tenant work — **not production-ready**.

## Stack

- pnpm monorepo, Node ≥ 20
- `apps/web` — Next.js App Router
- `packages/ui` — presentational components
- `packages/shared` — types, i18n (en/cs/ar), in-browser `MockApi`
- `packages/db` — Drizzle schema, migrate, seed
- Postgres via Docker Compose for the real app

## Two modes

| Mode | Routes | Data |
|------|--------|------|
| Mock demo | `/demo/…` | In-browser mocks — no Docker |
| Real app | `/t/<tenant-slug>/…` | Postgres |

Hub at `http://localhost:3000` lists both.

Seeded tenants include `al-baron-pyramid-iv` and `test-restaurant-n1`.

Seed logins (both tenants): Admin `101` / `1234`, Waiter `104` / `2222`.

## How to run

```bash
# Real app (Postgres required)
docker compose up -d postgres
# DATABASE_URL=postgres://saasfood:saasfood@localhost:5432/saasfood
pnpm install && pnpm db:migrate && pnpm db:seed && pnpm dev
```

Mock-only: `pnpm install && pnpm dev` → open `/demo/pos/login`.

## Important paths

- `apps/web` — hub, demo, tenant routes
- `packages/db` — schema / migrate / seed
- `packages/shared` — MockApi + i18n
- `design-preview` — static HTML visual reference
- `.github/workflows/build-vps-dist.yml` — standalone VPS artifact

## Pitfalls

- Real multi-tenant work needs Docker Postgres; demo alone does not.
- Prefer CI-built standalone artifact for VPS deploys over building source on the box.
- Never commit secrets / `.env` / deploy keys. Bind Node to localhost behind a reverse proxy in real deploys.
- Repo spelling is `coffee-managment-system` (missing “e”); GitHub: `ahmedmohamedfci/coffee-managment-system`.
