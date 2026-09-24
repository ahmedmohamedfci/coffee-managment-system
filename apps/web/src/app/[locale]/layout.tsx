import { notFound } from "next/navigation";
import { isLang, isRtl, type AppLocale } from "@/lib/locale";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLang(raw)) notFound();
  const locale: AppLocale = raw;

  return (
    <div lang={locale} dir={isRtl(locale) ? "rtl" : "ltr"} data-locale={locale}>
      {children}
    </div>
  );
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }, { locale: "de" }, { locale: "cs" }];
}
