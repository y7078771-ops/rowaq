# رُواق — قالب SaaS عربي مجاني ومفتوح المصدر

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fy7078771-ops%2Frowaq&env=DATABASE_URL,NEXTAUTH_SECRET,NEXTAUTH_URL&project-name=rowaq&repository-name=rowaq)

<div dir="rtl">

قالب Next.js مبني من الأساس للسوق العربي: واجهة RTL كاملة، ثنائية اللغة (عربي/إنجليزي) بتبديل فوري، ودفع سعودي عبر **Moyasar** و**Tap**، ومصادقة كاملة ولوحة تحكم جاهزة — انشر منصتك في أيام بدل أشهر.

**مجاني للاستخدام الشخصي والتجاري تحت رخصة MIT.** إن أفادك القالب، نجّم المستودع وشاركه مع المطوّرين العرب — كل نجمة تساعد قوالب أخرى تراه النور.

## المزايا

- **RTL أولاً**: كل الواجهة من اليمين لليسار بدعم LTR فوري عند التبديل للإنجليزية
- **مصادقة كاملة**: تسجيل ودخول واستعادة كلمة المرور عبر NextAuth v4 مع تشفير bcrypt
- **لوحة تحكم**: إحصاءات ورسوم بيانية، جدول مستخدمين، سجل مدفوعات، إدارة خطط
- **مدفوعات سعودية**: تكامل Moyasar + Tap مع وضع شراء تجريبي يعمل بدون مفاتيح API
- **وضع تجريبي ذكي**: بطاقة اختبار `4111 1111 1111 1111` تسجل عمليات حقيقية في قاعدة البيانات
- **ثيم مزدوج**: فاتح/داكن، متجاوب مع الجوال، مكونات shadcn/ui

## التقنيات

Next.js 16 · TypeScript · Tailwind CSS 4 · shadcn/ui · Prisma · NextAuth v4 · SQLite (تطوير) / Postgres (إنتاج) · Zustand · Recharts

## التشغيل السريع

```bash
# 1) تثبيت الحزم
npm install

# 2) إعداد متغيرات البيئة
cp .env.example .env

# 3) إنشاء قاعدة البيانات وتعبئتها ببيانات عرض
npx prisma db push
npx tsx scripts/seed.ts    # أو: bun scripts/seed.ts

# 4) التشغيل
npm run dev
```

افتح `http://localhost:3000` — حساب العرض التجريبي:

```
البريد: admin@demo.com
كلمة المرور: Demo1234!
```

## النشر على Vercel

**بنقرة واحدة:** اضغط زر **Deploy** أعلى هذا الملف — سيستنسخ المستودع ويطلب منك المتغيرات الثلاثة فقط، مع دليل مجاني للاتصال بقاعدة Neon Postgres خلال دقائق.

**بالتفصيل:** دليل خطوة بخطوة (Neon Postgres، متغيرات البيئة، ربط Moyasar) في [DEPLOYMENT.md](./DEPLOYMENT.md).

> وضع التجربة يعمل بدون أي مفاتيح دفع — ترفع الموقع وتجرّبه كاملاً قبل ربط Moyasar الحقيقي.

## البنية

```
src/
  app/            صفحات ومسارات API
  components/     landing · auth · dashboard · ui
  lib/            i18n · auth · payments · db · store
prisma/           المخطط (SQLite للتطوير + نسخة Postgres للنشر)
scripts/          seed.ts · reset-admin-password.ts
```

## الترخيص

مرخّص تحت [MIT](./LICENSE) — استخدمه، عدّله، وأطلق عليه منتجاتك التجارية بحرية. الإسناد غير إلزامي لكنه موضع تقدير.

</div>

---

# Rowaq — Free & Open-Source Arabic SaaS Boilerplate

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fy7078771-ops%2Frowaq&env=DATABASE_URL,NEXTAUTH_SECRET,NEXTAUTH_URL&project-name=rowaq&repository-name=rowaq)

A production-ready Next.js starter built for the Arabic market: full RTL UI, instant AR/EN switching, Saudi payments via **Moyasar** & **Tap**, complete auth and an admin dashboard — ship your SaaS in days. Free for personal and commercial use under MIT.

**Stack:** Next.js 16 · TypeScript · Tailwind CSS 4 · shadcn/ui · Prisma · NextAuth v4 · Postgres-ready

**Quick start**

```bash
npm install
cp .env.example .env
npx prisma db push && npx tsx scripts/seed.ts
npm run dev
```

Demo login: `admin@demo.com` / `Demo1234!` · Deployment guide: [DEPLOYMENT.md](./DEPLOYMENT.md) · Licensed under [MIT](./LICENSE)

> If this template helps you, please **star the repository** — it helps other Arabic developers discover it.
