import type { Metadata } from "next";
import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

// خط عربي احترافي + خطوط لاتينية
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  weight: ["400", "500", "600", "700"],
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "رُواق — قالب SaaS العربي الجاهز للإطلاق",
  description:
    "قالب Boilerplate كامل لإطلاق مشاريع SaaS العربية: مصادقة، لوحة تحكم، دفع سعودي (Moyasar وTap)، عربي RTL وإنجليزي، وضع ليلي — جاهز للنشر خلال يوم واحد.",
  keywords: ["SaaS", "قالب عربي", "Next.js", "Moyasar", "بوابة الدفع", "RTL", "Boilerplate"],
  openGraph: {
    title: "رُواق — قالب SaaS العربي الجاهز",
    description: "أطلق مشروع SaaS عربي في يوم واحد — مصادقة، لوحة تحكم، ودفع سعودي جاهز.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${plexArabic.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <Providers>{children}</Providers>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
