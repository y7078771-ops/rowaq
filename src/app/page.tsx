"use client";

// ============================================================
// الصفحة الرئيسية — توجيه داخلي بين: صفحة الهبوط، شاشات المصادقة، لوحة التحكم
// (في مشروعك الحقيقي: قسّمها على مسارات app router حقيقية)
// ============================================================
import { useAppStore } from "@/lib/store";
import { LandingPage } from "@/components/landing/landing-page";
import { AuthScreen } from "@/components/auth/auth-screen";
import { Dashboard } from "@/components/dashboard/dashboard";

export default function Home() {
  const view = useAppStore((s) => s.view);
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {view === "landing" && <LandingPage />}
      {(view === "login" || view === "register" || view === "forgot" || view === "reset") && <AuthScreen />}
      {view === "dashboard" && <Dashboard />}
    </div>
  );
}
