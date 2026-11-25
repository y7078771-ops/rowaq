// ============================================================
// POST /api/auth/reset-password — تعيين كلمة مرور جديدة برمز صالح
// ============================================================
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(72),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid input" }, { status: 400 });
    }
    const { token, password } = parsed.data;

    const record = await db.passwordResetToken.findUnique({ where: { token } });
    if (!record || record.used || record.expiresAt < new Date()) {
      return NextResponse.json({ error: "invalid or expired token" }, { status: 400 });
    }

    const passwordHash = await hash(password, 10);
    await db.$transaction([
      db.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      db.passwordResetToken.update({ where: { id: record.id }, data: { used: true } }),
    ]);

    return NextResponse.json({ message: "password updated" });
  } catch (err) {
    console.error("[reset-password]", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
