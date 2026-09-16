# SaaSFood tenant API contract

Base path: `/api/t/:tenantSlug`

Session cookie: `sf_session` (HTTP-only, `SameSite=Lax`, `Secure` in production, 12h TTL).
Value is a row id in `sessions` (tenant + staff). Login sets it; logout clears it.
Protected routes require a valid cookie whose `tenantId` matches the slug.

Errors: `{ "error": string, "code"?: string }` with HTTP 4xx/5xx.

Optimistic concurrency: order mutating endpoints accept optional `expectedVersion`.
Mismatch → `409` / `VERSION_CONFLICT`. Responses include `version`.

---

## Public

| Method | Path | Body | Notes |
|--------|------|------|-------|
| GET | `/tenant` | — | `{ id, slug, name, currency, taxRate }` |
| POST | `/auth/staff/login` | `{ staffCode, pin }` | Sets cookie; returns `{ kind:"staff", staffId, name, role, staffCode, isDefaultPin }` |
| GET | `/auth/me` | — | `{ staff, session }` — both null if unauthenticated |

## Auth (session)

| Method | Path | Body |
|--------|------|------|
| POST | `/auth/logout` | — → `{ ok: true }` |

## Floor / menu (session)

| Method | Path | Response |
|--------|------|----------|
| GET | `/floor` | `{ sections, tables, fixtures }` |
| GET | `/menu` | `{ categories, items, modifierGroups }` |

## Orders (session)

| Method | Path | Body |
|--------|------|------|
| POST | `/orders/open` | `{ tableId, waiterId? }` — defaults waiter to session staff; returns existing open/submitted/awaiting order if any |
| GET | `/orders/:orderId` | full order + `lines` + `version` |
| POST | `/orders/:orderId/lines` | `{ menuItemId, quantity, modifierOptionIds?, kitchenNote?, allergyNote?, expectedVersion? }` |
| PATCH | `/orders/:orderId/lines/:lineId` | `{ quantity, expectedVersion? }` — `quantity <= 0` removes line |
| POST | `/orders/:orderId/submit` | `{ expectedVersion? }` — creates kitchen ticket |
| POST | `/orders/:orderId/checkout` | `{ expectedVersion? }` — submits if still open, then `awaiting_payment` |
| POST | `/orders/:orderId/pay` | `{ method: "cash"\|"manual_card"\|"tap", expectedVersion? }` — `tap` rejected; creates `payments` row, marks paid, frees table |

## Kitchen (session)

| Method | Path | Body / query |
|--------|------|--------------|
| GET | `/kitchen/tickets` | `?includeDismissed=1` optional |
| PATCH | `/kitchen/tickets/:ticketId` | `{ status: "pending"\|"preparing"\|"ready"\|"dismissed" }` |

## Admin (session + role `admin`)

| Method | Path | Body |
|--------|------|------|
| GET | `/staff` | `{ staff: [...] }` (no PINs) |
| POST | `/staff/:staffId/reset-pin` | — → staff with pin `0000`, `isDefaultPin: true` |
| POST | `/menu/items` | `{ categoryId, nameKey, name, basePrice, allergens?, active?, modifierGroupIds? }` |
| PATCH | `/menu/items/:itemId` | partial of create fields |
| DELETE | `/menu/items/:itemId` | `{ ok: true }` |
| PUT | `/menu/modifiers` | `{ groups: ModifierGroup[] }` or raw array — replaces tenant groups/options; preserves item links for kept group ids |
| PATCH | `/settings` | `{ name?, taxRate? }` — taxRate in `[0,1]` |

## Seeded tenants

- `al-baron-pyramid-iv` — staff `101`/`1234` (admin), `104`/`2222` (waiter)
- `test-restaurant-n1` — same codes
