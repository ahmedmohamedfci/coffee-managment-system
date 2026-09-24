import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  DEFAULT_LANG,
  isLang,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE_SEC,
  pickLocaleFromAcceptLanguage,
  withLocale,
} from "@/lib/locale";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const seg = pathname.split("/")[1];
  if (isLang(seg)) {
    const res = NextResponse.next();
    res.cookies.set(LOCALE_COOKIE, seg, {
      path: "/",
      maxAge: LOCALE_COOKIE_MAX_AGE_SEC,
      sameSite: "lax",
    });
    res.headers.set("x-saasfood-locale", seg);
    return res;
  }

  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const preferred = isLang(cookieLocale)
    ? cookieLocale
    : pickLocaleFromAcceptLanguage(request.headers.get("accept-language"));
  const locale = preferred || DEFAULT_LANG;

  const url = request.nextUrl.clone();
  url.pathname = withLocale(locale, pathname === "/" ? "/" : pathname);
  const res = NextResponse.redirect(url);
  res.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE_SEC,
    sameSite: "lax",
  });
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
