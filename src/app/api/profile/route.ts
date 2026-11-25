// ============================================================
// GET/PATCH /api/profile — قراءة وتحديث الملف الشخصي للمستخدم الحالي
// ============================================================
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";

const patchSchema = z.object({
  name: z.string().min(2).max(60).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      subscriptions: { where: { status: "ACTIVE" }, orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!user) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid input" }, { status: 400 });
    }
    const user = await db.user.update({
      where: { email: session.user.email },
      data: { name: parsed.data.name },
      select: { id: true, email: true, name: true },
    });
    return NextResponse.json({ user });
  } catch (err) {
    console.error("[profile]", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
