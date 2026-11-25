// ============================================================
// POST /api/auth/register — إنشاء حساب جديد
// ============================================================
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  name: z.string().min(2, "name too short").max(60),
  email: z.string().email(),
  password: z.string().min(8, "password too short").max(72),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "invalid input" },
        { status: 400 }
      );
    }
    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "email already registered" }, { status: 409 });
    }

    const passwordHash = await hash(password, 10);
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        emailVerified: true, // الوضع التجريبي: نتجاوز رسالة التحقق (فعّلها في الإنتاج)
      },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
