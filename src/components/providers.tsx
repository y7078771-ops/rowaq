"use client";

// ============================================================
// مزودو التطبيق: الجلسة (NextAuth) + المظهر (next-themes)
// ============================================================
import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { restoreLocale } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  // استرجاع اللغة المحفوظة بعد التهيئة
  useEffect(() => {
    restoreLocale();
  }, []);

  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
