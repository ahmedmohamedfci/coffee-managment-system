# SaaSFood (`coffee-managment-system`)

Multi-tenant restaurant POS / kitchen display / admin. Public product name **SaaSFood**; folder is still `coffee-managment-system`.

## Maturity

**Beta · side project.** Useful for demos and local multi-tenant work — **not production-ready**.

## Stack

- pnpm monorepo, Node ≥ 20
- `apps/web` — Next.js App Router
- `packages/ui` — presentational components
- `packages/shared` — types, i18n (`en` / `ar` / `de` / `cs`), in-browser `MockApi`
- `packages/db` — Drizzle schema, migrate, seed
- Postgres via Docker Compose for the real app

## Locales (URL-prefixed)

UI locale is the URL prefix: `/en/...`, `/ar/...`, `/de/...`, `/cs/...`.

| Path | Notes |
|------|--------|
| `/` | Redirects to preferred locale (`saasfood-locale` cookie, else `Accept-Language`, else `en`) |
| `/en/demo/...` | Mock demo |
| `/en/t/<tenant-slug>/...` | Real Postgres tenant app |
| `/api/t/...` | API stays **unprefixed** |

- Language switcher (`LocaleSwitcher`) swaps the first path segment and sets the cookie.
- Arabic (`ar`) sets `dir="rtl"` on `<html>` / locale wrapper and loads Noto Sans Arabic.
- Copy lives in `packages/shared/src/i18n/{en,ar,de,cs}.ts`. UI uses `useT()` (not i18next).
- Non-translated values: `apps/web/src/lib/constants.ts`.
- Backend errors: `apps/web/src/lib/error-catalog.ts` — throw via `apiError("CODE")`. Responses localize with cookie / `Accept-Language` (`{ error: { code, message } }`).

## Two modes

| Mode | Routes | Data |
|------|--------|------|
| Mock demo | `/{locale}/demo/…` | In-browser mocks — no Docker |
| Real app | `/{locale}/t/<tenant-slug>/…` | Postgres |

Hub at `http://localhost:3000` → redirects to e.g. `/en`.

Seeded tenants include `al-baron-pyramid-iv` and `test-restaurant-n1`.

Seed logins (both tenants): Admin `101` / `1234`, Waiter `104` / `2222`.

## How to run

```bash
# Real app (Postgres required)
docker compose up -d postgres
# DATABASE_URL=postgres://saasfood:saasfood@localhost:5432/saasfood
pnpm install && pnpm db:migrate && pnpm db:seed && pnpm dev
```

Mock-only: `pnpm install && pnpm dev` → open `/en/demo/pos/login`.

## Important paths

- `apps/web` — hub, demo, tenant routes under `src/app/[locale]`
- `apps/web/src/middleware.ts` — locale redirect + cookie
- `packages/db` — schema / migrate / seed
- `packages/shared` — MockApi + i18n catalogs
- `design-preview` — static HTML visual reference (separate from App Router i18n)
- `.github/workflows/build-vps-dist.yml` — standalone VPS artifact

## Pitfalls

- Real multi-tenant work needs Docker Postgres; demo alone does not.
- Prefer CI-built standalone artifact for VPS deploys over building source on the box.
- Never commit secrets / `.env` / deploy keys. Bind Node to localhost behind a reverse proxy in real deploys.
- Repo spelling is `coffee-managment-system` (missing “e”); GitHub: `ahmedmohamedfci/coffee-managment-system`.
- Do not migrate UI to unused `i18next` / `react-i18next` deps — keep `useT` + shared catalogs.
