import type { Metadata } from "next";
import { headers } from "next/headers";
import { DM_Sans, Noto_Sans_Arabic } from "next/font/google";
import { DEFAULT_LANG, isLang, isRtl } from "@/lib/locale";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-demo",
});

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-ar",
});

export const metadata: Metadata = {
  title: "SaaSFood",
  description: "Multi-tenant restaurant POS, admin, and kitchen display",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const headerLocale = (await headers()).get("x-saasfood-locale");
  const locale = isLang(headerLocale) ? headerLocale : DEFAULT_LANG;
  const rtl = isRtl(locale);

  return (
    <html lang={locale} dir={rtl ? "rtl" : "ltr"} suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${notoArabic.variable}`}
        style={{
          fontFamily: rtl
            ? "var(--font-ar), var(--font-demo), var(--font)"
            : "var(--font-demo), var(--font)",
        }}
      >
        {children}
      </body>
    </html>
  );
}
