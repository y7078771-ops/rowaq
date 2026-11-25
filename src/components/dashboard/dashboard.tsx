"use client";

// ============================================================
// لوحة التحكم — الهيكل الرئيسي + النظرة العامة (إحصائيات ورسم بياني)
// التبويبات: نظرة عامة، المستخدمون، المدفوعات، الخطط والدفع، الإعدادات
// ============================================================
import { useCallback, useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { formatSAR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UsersTable } from "@/components/dashboard/users-table";
import { PaymentsTable } from "@/components/dashboard/payments-table";
import { Billing } from "@/components/dashboard/billing";
import { Settings } from "@/components/dashboard/settings";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  BadgeDollarSign,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings as SettingsIcon,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

type Tab = "overview" | "users" | "payments" | "billing" | "settings";

interface Stats {
  users: number;
  activeSubscriptions: number;
  payments: number;
  totalRevenue: number;
  monthRevenue: number;
}

export function Dashboard() {
  const t = useAppStore((s) => s.t);
  const locale = useAppStore((s) => s.locale);
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [monthly, setMonthly] = useState<{ month: string; revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setStats(data.stats);
      setMonthly(data.monthly);
    } catch {
      toast.error(t("error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (tab === "overview") loadStats();
  }, [tab, loadStats]);

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: t("dashOverview"), icon: LayoutDashboard },
    { key: "users", label: t("dashUsers"), icon: Users },
    { key: "payments", label: t("dashPayments"), icon: CreditCard },
    { key: "billing", label: t("dashBilling"), icon: Wallet },
    { key: "settings", label: t("dashSettings"), icon: SettingsIcon },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* الشريط العلوي */}
      <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4">
          <button onClick={() => setTab("overview")} className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-teal-500 font-bold text-white">
              ر
            </span>
            <span className="hidden text-base font-bold sm:block">{t("brandName")}</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="hidden flex-col items-end leading-tight sm:flex">
              <span className="text-sm font-medium">{session?.user?.name ?? "—"}</span>
              <span className="text-xs text-muted-foreground" dir="ltr">
                {session?.user?.email}
              </span>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600/10 font-bold text-emerald-700">
              {(session?.user?.name ?? "?").trim().charAt(0)}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => signOut({ redirect: false }).then(() => {
                toast.info(t("toastLoggedOut"));
                useAppStore.getState().setView("landing");
              })}
            >
              <LogOut className="h-4 w-4" />
              {t("navLogout")}
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 lg:flex-row">
        {/* التبويبات الجانبية */}
        <nav className="flex gap-2 overflow-x-auto lg:w-56 lg:flex-col" aria-label="dashboard">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex shrink-0 items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === key
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        {/* المحتوى */}
        <div className="min-w-0 flex-1">
          {tab === "overview" && (
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-2xl font-bold">
                  {t("dashWelcome")}، {session?.user?.name ?? ""} 👋
                </h1>
              </div>

              {/* بطاقات الإحصائيات */}
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {loading || !stats ? (
                  [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
                ) : (
                  <>
                    <StatCard icon={Users} label={t("statUsers")} value={String(stats.users)} sub={t("statThisMonth")} />
                    <StatCard icon={BadgeDollarSign} label={t("statRevenue")} value={formatSAR(stats.totalRevenue, locale)} sub={t("statThisMonth")} />
                    <StatCard icon={TrendingUp} label={t("statSubscriptions")} value={String(stats.activeSubscriptions)} sub="" />
                    <StatCard icon={CreditCard} label={t("statPayments")} value={String(stats.payments)} sub={t("statThisMonth")} />
                  </>
                )}
              </div>

              {/* الرسم البياني */}
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold">{t("statRevenue")}</h3>
                    <Badge variant="secondary" className="gap-1">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                      {loading || !stats ? "—" : formatSAR(stats.monthRevenue, locale)} {t("statThisMonth")}
                    </Badge>
                  </div>
                  {loading ? (
                    <Skeleton className="h-64 w-full rounded-lg" />
                  ) : (
                    <div className="h-64 w-full" dir="ltr">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthly} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                          <defs>
                            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                              <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.7 0.02 162 / 0.25)" />
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="oklch(0.55 0.02 160)" />
                          <YAxis tick={{ fontSize: 12 }} stroke="oklch(0.55 0.02 160)" width={45} />
                          <Tooltip
                            formatter={(v: number) => [formatSAR(v, locale), t("statRevenue")]}
                            contentStyle={{ borderRadius: 10, border: "1px solid oklch(0.9 0.02 162)" }}
                          />
                          <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#rev)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {tab === "users" && <UsersTable />}
          {tab === "payments" && <PaymentsTable />}
          {tab === "billing" && <Billing />}
          {tab === "settings" && <Settings />}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col gap-2 p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-600">
            <Icon className="h-4 w-4" />
          </span>
        </div>
        <span className="text-2xl font-bold" dir="auto">
          {value}
        </span>
        {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
      </CardContent>
    </Card>
  );
}
