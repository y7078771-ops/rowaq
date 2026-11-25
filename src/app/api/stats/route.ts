// ============================================================
// GET /api/stats — إحصائيات لوحة التحكم (عدد المستخدمين، الإيرادات...)
// ============================================================
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [users, activeSubs, payments, revenueAgg, monthRevenueAgg] = await Promise.all([
    db.user.count(),
    db.subscription.count({ where: { status: "ACTIVE" } }),
    db.payment.count(),
    db.payment.aggregate({ _sum: { amount: true }, where: { status: "PAID" } }),
    db.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: "PAID",
        createdAt: { gte: new Date(new Date().setDate(1)) }, // بداية الشهر الحالي
      },
    }),
  ]);

  // توزيع الإيرادات على آخر 6 أشهر للرسم البياني
  const now = new Date();
  const monthly: { month: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const agg = await db.payment.aggregate({
      _sum: { amount: true },
      where: { status: "PAID", createdAt: { gte: start, lt: end } },
    });
    monthly.push({
      month: start.toLocaleString("en", { month: "short" }),
      revenue: (agg._sum.amount ?? 0) / 100,
    });
  }

  return NextResponse.json({
    stats: {
      users,
      activeSubscriptions: activeSubs,
      payments,
      totalRevenue: (revenueAgg._sum.amount ?? 0) / 100,
      monthRevenue: (monthRevenueAgg._sum.amount ?? 0) / 100,
    },
    monthly,
  });
}
