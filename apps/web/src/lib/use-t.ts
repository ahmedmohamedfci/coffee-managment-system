"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { type Lang, type MessageKey, translate } from "@saasfood/shared";
import { useDemoStore } from "./demo-store";
import {
  DEFAULT_LANG,
  isLang,
  isRtl,
  LOCALES,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE_SEC,
  stripLocalePrefix,
  withLocale,
  type AppLocale,
} from "./locale";
import { useEffect } from "react";

export function useLocale(): AppLocale {
  const params = useParams<{ locale?: string }>();
  const fromRoute = params?.locale;
  if (isLang(fromRoute)) return fromRoute;
  const stored = useDemoStore.getState().lang;
  return isLang(stored) ? stored : DEFAULT_LANG;
}

export function useLocalePath() {
  const locale = useLocale();
  return (path: string) => withLocale(locale, path);
}

export function useT() {
  const locale = useLocale();
  const setLang = useDemoStore((s) => s.setLang);

  useEffect(() => {
    setLang(locale as Lang);
    document.documentElement.lang = locale;
    document.documentElement.dir = isRtl(locale) ? "rtl" : "ltr";
    document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${LOCALE_COOKIE_MAX_AGE_SEC};SameSite=Lax`;
  }, [locale, setLang]);

  return (key: MessageKey, vars?: Record<string, string | number>) =>
    translate(locale as Lang, key, vars);
}

export function useSwitchLocale() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const setLang = useDemoStore((s) => s.setLang);

  return (next: AppLocale) => {
    setLang(next as Lang);
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=${LOCALE_COOKIE_MAX_AGE_SEC};SameSite=Lax`;
    const stripped = stripLocalePrefix(pathname);
    router.push(withLocale(next, stripped));
  };
}

export { LOCALES, withLocale, stripLocalePrefix };
export type { AppLocale };
