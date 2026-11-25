"use client";

// ============================================================
// متجر الحالة العام — اللغة، اتجاه الصفحة، والتنقل بين الشاشات
// ============================================================
import { create } from "zustand";
import { translations, type Locale, type TranslationKey } from "@/lib/i18n";

export type View = "landing" | "login" | "register" | "forgot" | "reset" | "dashboard";

interface AppState {
  locale: Locale;
  view: View;
  resetToken: string | null; // رمز إعادة التعيين في الوضع التجريبي
  selectedPlan: "BASIC" | "PRO" | "AGENCY"; // الخطة المختارة من صفحة الأسعار
  setLocale: (locale: Locale) => void;
  setView: (view: View) => void;
  setResetToken: (token: string | null) => void;
  setSelectedPlan: (plan: "BASIC" | "PRO" | "AGENCY") => void;
  t: (key: TranslationKey) => string;
  dir: () => "rtl" | "ltr";
}

function applyLocale(locale: Locale) {
  if (typeof document !== "undefined") {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    localStorage.setItem("locale", locale);
  }
}

const initialLocale: Locale = "ar"; // الافتراضي عربي — يُستبدل من localStorage بعد الإقلاع لتجنب مشاكل hydration

export const useAppStore = create<AppState>((set, get) => ({
  locale: initialLocale,
  view: "landing",
  resetToken: null,
  selectedPlan: "PRO",
  setLocale: (locale) => {
    applyLocale(locale);
    set({ locale });
  },
  setView: (view) => set({ view }),
  setResetToken: (token) => set({ resetToken: token }),
  setSelectedPlan: (plan) => set({ selectedPlan: plan }),
  t: (key) => translations[get().locale][key],
  dir: () => (get().locale === "ar" ? "rtl" : "ltr"),
}));

// استرجاع اللغة المحفوظة بعد الإقلاع (داخل effect لتجنب hydration mismatch)
export function restoreLocale() {
  if (typeof window === "undefined") return;
  const saved = localStorage.getItem("locale");
  if (saved === "en" || saved === "ar") {
    useAppStore.getState().setLocale(saved);
  } else {
    applyLocale("ar");
  }
}
