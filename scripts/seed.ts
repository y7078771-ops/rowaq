// ============================================================
// سكربت البيانات التجريبية — بيانات واقعية لعرض لوحة التحكم
// التشغيل: bun scripts/seed.ts
// ============================================================
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("بدء تعبئة البيانات التجريبية...");

  // حساب المدير التجريبي
  const adminPassword = await hash("Demo1234!", 10);
  const admin = await db.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      email: "admin@demo.com",
      name: "مدير العرض التجريبي",
      passwordHash: adminPassword,
      emailVerified: true,
      role: "ADMIN",
      createdAt: new Date("2025-09-01"),
    },
  });

  // مستخدمون تجريبيون بأسماء عربية واقعية
  const demoUsers = [
    { email: "sarah@techlab.sa", name: "سارة العتيبي", role: "USER", created: "2025-10-02" },
    { email: "mohammed@startup.io", name: "محمد الشمري", role: "USER", created: "2025-10-14" },
    { email: "layla@design.sa", name: "ليلا القحطاني", role: "USER", created: "2025-10-25" },
    { email: "omar@devhouse.ae", name: "عمر المرزوقي", role: "USER", created: "2025-11-03" },
    { email: "noura@agency.sa", name: "نورة الدوسري", role: "USER", created: "2025-11-11" },
    { email: "khalid@shop.sa", name: "خالد الحربي", role: "USER", created: "2025-11-18" },
  ];

  const userIds: string[] = [admin.id];
  for (const u of demoUsers) {
    const user = await db.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        emailVerified: Math.random() > 0.2,
        passwordHash: adminPassword,
        createdAt: new Date(u.created),
      },
    });
    userIds.push(user.id);
  }

  // مدفوعات موزعة على آخر 6 أشهر
  const plans = [
    { plan: "BASIC", amount: 2900 },
    { plan: "PRO", amount: 5900 },
    { plan: "AGENCY", amount: 19900 },
  ];
  const statuses = ["PAID", "PAID", "PAID", "PAID", "FAILED", "PENDING"];

  const paymentCount = await db.payment.count();
  if (paymentCount < 20) {
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const monthsAgo = i % 6;
      const created = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 3 + (i % 25));
      const plan = plans[i % plans.length];
      const status = statuses[i % statuses.length];
      await db.payment.create({
        data: {
          amount: plan.amount,
          currency: "SAR",
          status,
          provider: i % 5 === 0 ? "moyasar" : "demo",
          providerPaymentId: `demo_seed_${i}_${Math.random().toString(36).slice(2, 8)}`,
          description: `Boilerplate ${plan.plan} plan`,
          plan: plan.plan,
          userId: userIds[i % userIds.length],
          createdAt: created,
          updatedAt: created,
        },
      });
    }

    // اشتراكات نشطة للمستخدمين
    const activePlans = ["PRO", "BASIC", "AGENCY", "PRO", "BASIC", "PRO", "AGENCY"];
    for (let i = 0; i < userIds.length; i++) {
      const plan = activePlans[i % activePlans.length];
      const amount = plans.find((p) => p.plan === plan)?.amount ?? 2900;
      await db.subscription.upsert({
        where: { id: `seed-sub-${i}` },
        update: {},
        create: {
          id: `seed-sub-${i}`,
          plan,
          status: "ACTIVE",
          amount,
          currency: "SAR",
          interval: "month",
          currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
          userId: userIds[i],
        },
      });
    }
  }

  console.log("اكتملت التعبئة: 7 مستخدمين، 24 عملية دفع، 7 اشتراكات");
  console.log("حساب الدخول التجريبي: admin@demo.com / Demo1234!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
