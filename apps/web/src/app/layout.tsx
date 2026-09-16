import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-demo",
});

export const metadata: Metadata = {
  title: "SaaSFood",
  description: "Multi-tenant restaurant POS, admin, and kitchen display",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={dmSans.variable} style={{ fontFamily: "var(--font-demo), var(--font)" }}>
        {children}
      </body>
    </html>
  );
}
