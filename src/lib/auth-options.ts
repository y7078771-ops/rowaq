// ============================================================
// إعدادات NextAuth v4 — استراتيجية JWT + مزوّد بيانات الاعتماد
// لإضافة مزود OAuth (Google مثلاً): أضفه لمصفوفة providers
// ============================================================
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET ?? "boilerplate-dev-secret-change-me",
  pages: {
    signIn: "/", // الصفحة الرئيسية تدير شاشات المصادقة داخلياً
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });
        if (!user?.passwordHash) return null;
        const valid = await compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        } as never;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id?: string }).id;
        const dbUser = await db.user.findUnique({
          where: { email: (user as { email?: string }).email ?? "" },
          select: { role: true, emailVerified: true, name: true },
        });
        token.role = dbUser?.role ?? "USER";
        token.emailVerified = dbUser?.emailVerified ?? false;
        token.dbName = dbUser?.name ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string | undefined;
        (session.user as { role?: string }).role = (token.role as string) ?? "USER";
        (session.user as { emailVerified?: boolean }).emailVerified =
          (token.emailVerified as boolean) ?? false;
        if (!session.user.name && token.dbName) {
          session.user.name = token.dbName as string;
        }
      }
      return session;
    },
  },
};
