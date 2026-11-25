// ============================================================
// GET  /api/payments — سجل مدفوعات المستخدم الحالي (أو الكل للـ ADMIN)
// POST /api/payments — إنشاء عملية دفع (Moyasar حقيقي أو وضع تجريبي)
// ============================================================
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import { createPayment, isLiveMode } from "@/lib/payments";

// خطط المنتج — عدّل الأسعار هنا (بالهللات: 1 ريال = 100 هللة)
export const PLANS: Record<string, { amount: number; label: string }> = {
  BASIC: { amount: 2900, label: "Basic" },
  PRO: { amount: 5900, label: "Pro" },
  AGENCY: { amount: 19900, label: "Agency" },
};

const postSchema = z.object({
  plan: z.enum(["BASIC", "PRO", "AGENCY"]),
  cardNumber: z.string().min(12).max(23).optional(),
  cardName: z.string().max(60).optional(),
  cardCvc: z.string().min(3).max(4).optional(),
  cardMonth: z.string().max(2).optional(),
  cardYear: z.string().max(4).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "not found" }, { status: 404 });

  const payments =
    user.role === "ADMIN"
      ? await db.payment.findMany({ orderBy: { createdAt: "desc" }, take: 50, include: { user: { select: { email: true } } } })
      : await db.payment.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 50,
        });

  return NextResponse.json({ payments, liveMode: isLiveMode() });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "not found" }, { status: 404 });

  try {
    const body = await req.json();
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid input" }, { status: 400 });
    }
    const { plan, cardNumber, cardName, cardCvc, cardMonth, cardYear } = parsed.data;
    const planInfo = PLANS[plan];

    // 1) إنشاء العملية لدى البوابة (حقيقية أو تجريبية)
    const result = await createPayment({
      amount: planInfo.amount,
      currency: "SAR",
      description: `Boilerplate ${plan} plan`,
      source: {
        type: "creditcard",
        number: cardNumber,
        name: cardName,
        cvc: cardCvc,
        month: cardMonth,
        year: cardYear,
      },
    });

    // 2) حفظ العملية في قاعدة البيانات
    const payment = await db.payment.create({
      data: {
        amount: planInfo.amount,
        currency: "SAR",
        status: result.status,
        provider: result.provider,
        providerPaymentId: result.providerPaymentId,
        description: `Boilerplate ${plan} plan`,
        plan,
        userId: user.id,
      },
    });

    // 3) في حال النجاح: تفعيل الاشتراك لشهر كامل
    if (result.status === "PAID") {
      await db.subscription.create({
        data: {
          plan,
          status: "ACTIVE",
          amount: planInfo.amount,
          currency: "SAR",
          interval: "month",
          currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
          userId: user.id,
        },
      });
    }

    return NextResponse.json({ payment }, { status: 201 });
  } catch (err) {
    console.error("[payments]", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
