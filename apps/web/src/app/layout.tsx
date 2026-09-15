import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { DemoHud } from "@/components/demo-hud";

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-demo",
});

export const metadata: Metadata = {
  title: "SaaSFood Demo",
  description: "Owner walkthrough demo with mocked APIs",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={dmSans.variable} style={{ fontFamily: "var(--font-demo), var(--font)" }}>
        <DemoHud />
        <div style={{ minHeight: "calc(100vh - 56px)" }}>{children}</div>
      </body>
    </html>
  );
}
