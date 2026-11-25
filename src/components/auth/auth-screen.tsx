"use client";

// ============================================================
// شاشات المصادقة — تسجيل الدخول، إنشاء حساب، استعادة كلمة المرور، تعيين جديدة
// المصادقة عبر NextAuth (credentials) — أضف مزودات OAuth في auth-options
// ============================================================
import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, ArrowLeft, Copy, Info, Loader2, Lock, Mail, User } from "lucide-react";

type Mode = "login" | "register" | "forgot" | "reset";

export function AuthScreen() {
  const view = useAppStore((s) => s.view);
  return (
    <AuthLayout>
      {view === "login" && <LoginForm />}
      {view === "register" && <RegisterForm />}
      {view === "forgot" && <ForgotForm />}
      {view === "reset" && <ResetForm />}
    </AuthLayout>
  );
}

// ---------- التخطيط المشترك ----------
function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = useAppStore((s) => s.t);
  const setView = useAppStore((s) => s.setView);
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-emerald-600/8 via-background to-background px-4 py-10">
      <button onClick={() => setView("landing")} className="mb-6 flex items-center gap-2" aria-label={t("backToHome")}>
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 text-lg font-bold text-white shadow">
          ر
        </span>
      </button>
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-6">{children}</CardContent>
      </Card>
    </div>
  );
}

// ---------- زر العودة ----------
function BackButton({ to = "landing" }: { to?: "landing" | "login" }) {
  const t = useAppStore((s) => s.t);
  const setView = useAppStore((s) => s.setView);
  return (
    <Button variant="ghost" size="sm" className="-ms-2 h-8 text-muted-foreground" onClick={() => setView(to)}>
      {t("backToHome")}
    </Button>
  );
}

// ---------- تسجيل الدخول ----------
function LoginForm() {
  const t = useAppStore((s) => s.t);
  const setView = useAppStore((s) => s.setView);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError(t("requiredField"));
      return;
    }
    setLoading(true);
    const res = await signIn("credentials", { redirect: false, email, password });
    setLoading(false);
    if (res?.ok) {
      toast.success(t("toastLoggedIn"));
      setView("dashboard");
    } else {
      setError(t("error"));
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">{t("loginTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("loginSubtitle")}</p>
      </div>

      <Button type="button" variant="outline" size="sm" className="justify-start text-xs text-emerald-700" onClick={() => { setEmail("admin@demo.com"); setPassword("Demo1234!"); }}>
        <Info className="h-3.5 w-3.5" />
        {t("demoCredentials")}
      </Button>

      <Field icon={<Mail className="h-4 w-4" />} label={t("email")}>
        <Input type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
      </Field>
      <Field icon={<Lock className="h-4 w-4" />} label={t("password")}>
        <Input type="password" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
      </Field>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={loading} className="h-11">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("loginBtn")}
      </Button>

      <div className="flex items-center justify-between text-sm">
        <button type="button" className="text-emerald-600 hover:underline" onClick={() => setView("forgot")}>
          {t("forgotPassword")}
        </button>
        <span className="text-muted-foreground">
          {t("noAccount")}{" "}
          <button type="button" className="font-medium text-emerald-600 hover:underline" onClick={() => setView("register")}>
            {t("createOne")}
          </button>
        </span>
      </div>
      <BackButton />
    </form>
  );
}

// ---------- إنشاء حساب ----------
function RegisterForm() {
  const t = useAppStore((s) => s.t);
  const setView = useAppStore((s) => s.setView);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (): string | null => {
    if (!name || !email || !password || !confirm) return t("requiredField");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return t("invalidEmail");
    if (password.length < 8) return t("passwordMin");
    if (password !== confirm) return t("passwordMismatch");
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "error");
      }
      toast.success(t("toastRegistered"));
      // دخول تلقائي بعد التسجيل
      const login = await signIn("credentials", { redirect: false, email, password });
      if (login?.ok) {
        setView("dashboard");
      } else {
        setView("login");
      }
    } catch (err) {
      setError(err instanceof Error && err.message === "email already registered" ? "email already registered" : t("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">{t("registerTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("registerSubtitle")}</p>
      </div>

      <Field icon={<User className="h-4 w-4" />} label={t("name")}>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("name")} autoComplete="name" />
      </Field>
      <Field icon={<Mail className="h-4 w-4" />} label={t("email")}>
        <Input type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
      </Field>
      <Field icon={<Lock className="h-4 w-4" />} label={t("password")}>
        <Input type="password" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
      </Field>
      <Field icon={<Lock className="h-4 w-4" />} label={t("confirmPassword")}>
        <Input type="password" dir="ltr" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
      </Field>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={loading} className="h-11">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("registerBtn")}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        {t("haveAccount")}{" "}
        <button type="button" className="font-medium text-emerald-600 hover:underline" onClick={() => setView("login")}>
          {t("loginHere")}
        </button>
      </div>
      <BackButton />
    </form>
  );
}

// ---------- استعادة كلمة المرور ----------
function ForgotForm() {
  const t = useAppStore((s) => s.t);
  const setView = useAppStore((s) => s.setView);
  const setResetToken = useAppStore((s) => s.setResetToken);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError(t("requiredField"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      toast.success(t("toastResetSent"));
      setResetUrl(data.resetUrl ?? null);
      if (data.token) setResetToken(data.token);
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">{t("forgotTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("forgotSubtitle")}</p>
      </div>

      <Field icon={<Mail className="h-4 w-4" />} label={t("email")}>
        <Input type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
      </Field>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={loading} className="h-11">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("forgotBtn")}
      </Button>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>{t("forgotDemoNote")}</AlertDescription>
      </Alert>

      {resetUrl && (
        <div className="rounded-lg border bg-muted/40 p-3 text-xs">
          <div className="mb-1.5 font-medium">{t("resetLinkShown")}</div>
          <div className="flex items-center gap-2" dir="ltr">
            <code className="flex-1 overflow-x-auto whitespace-nowrap rounded bg-background px-2 py-1.5">{resetUrl}</code>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => {
                navigator.clipboard.writeText(resetUrl);
                toast.success(t("copied"));
              }}
              aria-label={t("copy")}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Button type="button" size="sm" className="mt-3 h-8 w-full" onClick={() => setView("reset")}>
            {t("resetTitle")}
          </Button>
        </div>
      )}

      <BackButton to="login" />
    </form>
  );
}

// ---------- تعيين كلمة مرور جديدة ----------
function ResetForm() {
  const t = useAppStore((s) => s.t);
  const setView = useAppStore((s) => s.setView);
  const resetToken = useAppStore((s) => s.resetToken);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!resetToken) {
      setError(t("error"));
      return;
    }
    if (password.length < 8) {
      setError(t("passwordMin"));
      return;
    }
    if (password !== confirm) {
      setError(t("passwordMismatch"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, password }),
      });
      if (!res.ok) throw new Error("failed");
      toast.success(t("resetDone"));
      setView("login");
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">{t("resetTitle")}</h1>
      </div>
      <Field icon={<Lock className="h-4 w-4" />} label={t("password")}>
        <Input type="password" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
      </Field>
      <Field icon={<Lock className="h-4 w-4" />} label={t("confirmPassword")}>
        <Input type="password" dir="ltr" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
      </Field>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={loading} className="h-11">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("resetBtn")}
      </Button>
      <BackButton to="login" />
    </form>
  );
}

// ---------- حقل مع أيقونة ----------
function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="flex items-center gap-1.5 text-sm">
        <span className="text-muted-foreground">{icon}</span>
        {label}
      </Label>
      {children}
    </div>
  );
}
