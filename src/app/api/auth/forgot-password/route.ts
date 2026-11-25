// ============================================================
// POST /api/auth/forgot-password — طلب رابط استعادة كلمة المرور
// الوضع التجريبي: يعيد الرابط في الاستجابة (في الإنتاج: أرسله بالبريد)
// ============================================================
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid email" }, { status: 400 });
    }
    const email = parsed.data.email.toLowerCase().trim();
    const user = await db.user.findUnique({ where: { email } });

    // نرد بنفس الرسالة دائماً حتى لا نكشف عن وجود البريد أو عدمه (أمان)
    const genericMessage = "if the email exists, a reset link was created";

    if (!user) {
      return NextResponse.json({ message: genericMessage, resetUrl: null });
    }

    // إبطال الرموز السابقة
    await db.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    const token = randomBytes(32).toString("hex");
    await db.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 30), // 30 دقيقة
      },
    });

    // في الإنتاج: أرسل الرابط بالبريد الإلكتروني (Resend / SES / SMTP)
    const resetUrl = `/reset?token=${token}`;
    return NextResponse.json({ message: genericMessage, resetUrl, token, demo: true });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
