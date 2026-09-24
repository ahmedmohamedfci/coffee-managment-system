import { translate, errorMessageKey, type Lang, DEFAULT_LANG } from "@saasfood/shared";
import { ApiError } from "./errors";

/**
 * Stable API error codes with HTTP status + default English message.
 * User-facing copy is localized via `errors.<CODE>` i18n keys when responding.
 */
export const ERROR_CATALOG = {
  ORDER_NOT_FOUND: { status: 404, message: "Order not found" },
  VERSION_CONFLICT: { status: 409, message: "Order version conflict" },
  OPEN_ORDER_INVALID: { status: 400, message: "Table or waiter missing" },
  TENANT_NOT_FOUND: { status: 404, message: "Tenant not found" },
  INVALID_QTY: { status: 400, message: "Quantity must be at least 1" },
  ORDER_NOT_OPEN: { status: 400, message: "Order is not open for edits" },
  ITEM_NOT_FOUND: { status: 404, message: "Item not found" },
  LINE_NOT_FOUND: { status: 404, message: "Line not found" },
  EMPTY_ORDER: { status: 400, message: "Add items before submitting" },
  INVALID_STATUS: { status: 400, message: "Cannot perform this action in the current status" },
  TAP_STUBBED: { status: 400, message: "Tap to Pay is not available yet" },
  INVALID_METHOD: { status: 400, message: "Invalid payment method" },
  ALREADY_PAID: { status: 400, message: "Order already paid" },
  NOT_READY: { status: 400, message: "Submit/checkout before paying" },
  MISSING_FIELDS: { status: 400, message: "Required fields are missing" },
  UNAUTHORIZED: { status: 401, message: "Unauthorized" },
  TENANT_MISMATCH: { status: 403, message: "Session does not match tenant" },
  ADMIN_REQUIRED: { status: 403, message: "Admin role required" },
  INVALID_JSON: { status: 400, message: "Invalid JSON body" },
  CATEGORY_NOT_FOUND: { status: 400, message: "Category not found" },
  INVALID_TAX: { status: 400, message: "taxRate must be between 0 and 1" },
  STAFF_NOT_FOUND: { status: 404, message: "Staff not found" },
  TICKET_NOT_FOUND: { status: 404, message: "Ticket not found" },
  INVALID_CREDENTIALS: { status: 401, message: "Invalid staff ID or PIN" },
  INTERNAL: { status: 500, message: "Internal server error" },
} as const;

export type ErrorCode = keyof typeof ERROR_CATALOG;

export function apiError(code: ErrorCode): ApiError {
  const entry = ERROR_CATALOG[code];
  return new ApiError(entry.status, entry.message, code);
}

export function localizedErrorMessage(code: string | undefined, locale: Lang | string): string {
  const lang: Lang =
    locale === "en" || locale === "ar" || locale === "de" || locale === "cs" ? locale : DEFAULT_LANG;
  if (!code) {
    return translate(lang, "errors.INTERNAL");
  }
  const key = errorMessageKey(code);
  if (key) return translate(lang, key);
  if (code in ERROR_CATALOG) {
    return ERROR_CATALOG[code as ErrorCode].message;
  }
  return translate(lang, "errors.INTERNAL");
}

export function resolveLocale(raw: string | null | undefined): Lang {
  if (raw === "en" || raw === "ar" || raw === "de" || raw === "cs") return raw;
  return DEFAULT_LANG;
}
