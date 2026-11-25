# دليل نشر رُواق على Vercel — خطوة بخطوة

البناء الإنتاجي مُختبر ويعمل (`npm run build` ينجح بكل المسارات). النشر لا يحتاج أي تعديل في الكود — فقط اتبع الخطوات.

## نظرة عامة

| الخطوة | المدة |
|---|---|
| 1. رفع المشروع إلى GitHub | 5 دقائق |
| 2. إنشاء قاعدة Postgres (Neon) | 5 دقائق |
| 3. الاستيراد إلى Vercel وإعداد المتغيرات | 10 دقائق |
| 4. توليد الجداول وبيانات العرض | 5 دقائق |

---

## 1. ارفع المشروع إلى GitHub

```bash
git init
git add .
git commit -m "Rowaq — Arabic SaaS Boilerplate"
# أنشئ مستودعاً جديداً على github.com ثم:
git remote add origin https://github.com/<حسابك>/rowaq.git
git branch -M main
git push -u origin main
```

> ملف `.gitignore` جاهز ويستثني `.env` و`db/` تلقائياً — لن تُرفع أسرارك أو قاعدة البيانات المحلية.

## 2. أنشئ قاعدة Postgres على Neon (مجاني)

1. سجّل في [neon.tech](https://neon.tech) → New Project.
2. اختر المنطقة الأقرب لعملائك (الخيار `AWS Bahrain (me-central-1)` أفضل للسعودية إن توفر).
3. انسخ **Connection String** — يبدو هكذا:
   `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`

بديلان: Supabase أو Vercel Postgres — أي Postgres يعمل دون تعديل.

## 3. فعّل نسخة Postgres من المخطط

```bash
cp prisma/schema.postgres.prisma prisma/schema.prisma
```

(المخطط الأصلي `schema.prisma` بنسخة SQLite محفوظ للعمل المحلي — انسخه احتياطاً أولاً إن أردت.)

## 4. استورد المشروع في Vercel

1. [vercel.com](https://vercel.com) → Add New → Project → اختر مستودع `rowaq`.
2. لا تغيّر أي إعداد بناء — سكربت `postinstall` يولّد عميل Prisma تلقائياً.
3. في **Environment Variables** أضف (انسخ من `.env.example`):

| المتغير | القيمة |
|---|---|
| `DATABASE_URL` | رابط Neon من الخطوة 2 |
| `NEXTAUTH_SECRET` | نفّذ `openssl rand -base64 32` وضع الناتج |
| `NEXTAUTH_URL` | `https://rowaq.vercel.app` (أو رابط دومينك) |
| `MOYASAR_SECRET_KEY` | اتركه فارغاً حالياً — وضع التجربة يعمل بدونه |
| `MOYASAR_CALLBACK_URL` | `https://rowaq.vercel.app/dashboard?payment=success` |
| `TAP_SECRET_KEY` | فارغ |
| `TAP_CALLBACK_URL` | `https://rowaq.vercel.app/dashboard?payment=success` |

4. اضغط **Deploy**.

## 5. أنشئ الجداول وبيانات العرض

من جهازك، موصولاً بقاعدة الإنتاج:

```bash
# مؤقتاً ضع رابط Neon في DATABASE_URL محلياً ثم:
npx prisma db push        # ينشئ الجداول في Postgres
bun scripts/seed.ts       # يملأ بيانات عرض عربية (أو: npx tsx scripts/seed.ts)
```

> إن ظهر خطأ `P1001` (تعذّر الاتصال): تأكد أن الرابط يتضمن `?sslmode=require` وأن قاعدة Neon نشطة (Free tier ينام بعد فترة — أي طلب يوقظه).

## 6. تحقق بعد النشر

- [ ] الصفحة الرئيسية تفتح بالعربية RTL
- [ ] تبديل اللغة والوضع الليلي يعملان
- [ ] تسجيل حساب جديد ثم الدخول
- [ ] الشراء التجريبي بالبطاقة `4111 1111 1111 1111` يسجل عملية في قاعدة الإنتاج
- [ ] لوحة التحكم تعرض الإحصاءات والرسوم البيانية

## لاحقاً: ربط Moyasar الحقيقي

1. حساب في [dashboard.moyasar.com](https://dashboard.moyasar.com) → API Keys.
2. ضع `MOYASAR_SECRET_KEY` (المفتاح السري، ليس القابل للنشر) في Vercel وأعد النشر.
3. لوحة Moyasar → تفعيل 3-D Secure (متطلب سارف للبطاقات).
4. جرّب عملية حقيقية صغيرة (1 ريال) ثم استرجعها.

## دومين خاص (اختياري)

- اشترِ الدومين (مثال: `rowaq.sa` أو `rowaq.dev`) ثم في Vercel → Settings → Domains → أضفه واتبع تعليمات DNS.
- حدّث `NEXTAUTH_URL` للدومين الجديد.
