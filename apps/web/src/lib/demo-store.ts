"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Lang, Session } from "@saasfood/shared";

type DemoStore = {
  lang: Lang;
  session: Session;
  setLang: (lang: Lang) => void;
  setSession: (session: Session) => void;
  clearSession: () => void;
};

export const useDemoStore = create<DemoStore>()(
  persist(
    (set) => ({
      lang: "en",
      session: null,
      setLang: (lang) => set({ lang }),
      setSession: (session) => set({ session }),
      clearSession: () => set({ session: null }),
    }),
    { name: "saasfood-demo" },
  ),
);
