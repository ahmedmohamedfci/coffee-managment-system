/** Locale routing helpers (kept free of heavy shared imports for Edge middleware). */

export const LOCALES = ["en", "ar", "de", "cs"] as const;
export type AppLocale = (typeof LOCALES)[number];
export const DEFAULT_LANG: AppLocale = "en";

/** Cookie key for preferred UI locale (URL prefix remains source of truth). */
export const LOCALE_COOKIE = "saasfood-locale";
export const LOCALE_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 365;

export function isLang(value: string | null | undefined): value is AppLocale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

export function isRtl(lang: AppLocale): boolean {
  return lang === "ar";
}

export function withLocale(locale: AppLocale, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
}

/** Strip leading `/{locale}` if present; returns path starting with `/`. */
export function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split("/");
  if (segments.length >= 2 && isLang(segments[1])) {
    const rest = segments.slice(2).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function localeFromPathname(pathname: string): AppLocale | null {
  const seg = pathname.split("/")[1];
  return isLang(seg) ? seg : null;
}

export function pickLocaleFromAcceptLanguage(header: string | null): AppLocale {
  if (!header) return DEFAULT_LANG;
  const parts = header.split(",").map((p) => p.trim().split(";")[0]?.toLowerCase() ?? "");
  for (const part of parts) {
    const base = part.slice(0, 2);
    if (isLang(base)) return base;
    if (isLang(part)) return part as AppLocale;
  }
  return DEFAULT_LANG;
}
