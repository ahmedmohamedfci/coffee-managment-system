/** Non-locale constants (timeouts, limits, cookie names, etc.). Copy stays in i18n. */

import {
  DEMO_ADMIN_CODE,
  DEMO_ADMIN_PIN,
  DEMO_WAITER_CODE,
  DEMO_WAITER_PIN,
} from "@saasfood/shared";

export const SESSION_COOKIE = "sf_session";
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export const UID_HEX_LEN = 12;

export const DASHBOARD_LIST_LIMIT = 8;

export const KDS_TICK_MS = 1000;
export const KDS_POLL_MS = 2500;
export const MS_PER_SECOND = 1000;

export const DEFAULT_TAX_RATE_DISPLAY = "0.08";
export const TAX_RATE_MIN = 0;
export const TAX_RATE_MAX = 1;

export const PAYMENT_STASH_KEY = "sf_last_payment";

export const DEMO_ADMIN_EMAIL = "admin@brewexpress.com";
export { DEMO_ADMIN_CODE, DEMO_ADMIN_PIN, DEMO_WAITER_CODE, DEMO_WAITER_PIN };

export const SEED_ADMIN_LOGIN = `${DEMO_ADMIN_CODE} / ${DEMO_ADMIN_PIN}`;
export const SEED_WAITER_LOGIN = `${DEMO_WAITER_CODE} / ${DEMO_WAITER_PIN}`;

export const HUB_TENANTS = [
  { name: "AL BARON PYRAMID IV", slug: "al-baron-pyramid-iv" },
  { name: "Test restaurant N.1", slug: "test-restaurant-n1" },
] as const;
