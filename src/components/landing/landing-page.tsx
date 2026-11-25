"use client";

// ============================================================
// صفحة الهبوط — الهوية البصرية الكاملة للقالب
// الأقسام: شريط تنقل، Hero، المميزات، الأسعار، FAQ، دعوة للعمل، Footer
// ============================================================
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ShieldCheck,
  CreditCard,
  Languages,
  LayoutDashboard,
  Database,
  MonitorSmartphone,
  Moon,
  Sun,
  Sparkles,
  Check,
  Zap,
} from "lucide-react";

// ---------- أيقونات المميزات ----------
const featureIcons = [ShieldCheck, CreditCard, Languages, LayoutDashboard, Database, MonitorSmartphone];

export function LandingPage() {
  const t = useAppStore((s) => s.t);
  const locale = useAppStore((s) => s.locale);
  const setLocale = useAppStore((s) => s.setLocale);
  const setView = useAppStore((s) => s.setView);
  const { resolvedTheme, setTheme } = useTheme();
  const { data: session } = useSession();

  // تبديل المظهر — نستخدم resolvedTheme وقت النقر فقط (آمن ضد hydration mismatch)
  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const goToPlan = (plan: "BASIC" | "PRO" | "AGENCY") => {
    useAppStore.getState().setSelectedPlan(plan);
    setView(session ? "dashboard" : "register");
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* ================= شريط التنقل ================= */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2"
            aria-label={t("brandName")}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-teal-500 font-bold text-white shadow-sm">
              ر
            </span>
            <span className="flex flex-col items-start leading-tight">
              <span className="text-base font-bold">{t("brandName")}</span>
              <span className="text-[10px] text-muted-foreground">{t("brandTagline")}</span>
            </span>
          </button>

          <nav className="hidden items-center gap-1 md:flex" aria-label="main">
            <Button variant="ghost" size="sm" onClick={() => scrollTo("features")}>
              {t("navFeatures")}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => scrollTo("pricing")}>
              {t("navPricing")}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => scrollTo("faq")}>
              {t("navFaq")}
            </Button>
          </nav>

          <div className="flex items-center gap-1.5">
            {/* تبديل اللغة */}
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-2.5 font-semibold"
              onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
              aria-label="toggle language"
            >
              {locale === "ar" ? "EN" : "ع"}
            </Button>
            {/* تبديل المظهر — أيقونتان تتبدلان عبر CSS لتجنب hydration mismatch */}
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={toggleTheme} aria-label="toggle theme">
              <Sun className="h-4 w-4 dark:hidden" />
              <Moon className="hidden h-4 w-4 dark:block" />
            </Button>
            {session ? (
              <Button size="sm" className="h-9" onClick={() => setView("dashboard")}>
                <LayoutDashboard className="h-4 w-4" />
                {t("navDashboard")}
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="hidden h-9 sm:inline-flex" onClick={() => setView("login")}>
                  {t("navLogin")}
                </Button>
                <Button size="sm" className="h-9" onClick={() => setView("register")}>
                  {t("navGetStarted")}
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ================= Hero ================= */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 0%, oklch(0.596 0.145 163.225 / 0.12) 0%, transparent 70%)",
            }}
          />
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center md:py-24">
            <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1.5 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              {t("heroBadge")}
            </Badge>

            <h1 className="max-w-3xl text-4xl font-bold leading-[1.2] tracking-tight md:text-6xl">
              {t("heroTitle")}{" "}
              <span className="text-gradient">{t("heroTitleAccent")}</span>
            </h1>

            <p className="max-w-2xl text-balance text-base text-muted-foreground md:text-lg">
              {t("heroSubtitle")}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" className="h-12 px-6 text-base" onClick={() => (session ? setView("dashboard") : setView("register"))}>
                <Zap className="h-5 w-5" />
                {t("heroCtaPrimary")}
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-6 text-base" onClick={() => scrollTo("pricing")}>
                {t("heroCtaSecondary")}
              </Button>
            </div>

            {/* إحصائيات */}
            <div className="grid w-full max-w-3xl grid-cols-2 gap-3 pt-6 md:grid-cols-4">
              {[
                { value: t("heroStat1Value"), label: t("heroStat1") },
                { value: t("heroStat2Value"), label: t("heroStat2") },
                { value: t("heroStat3Value"), label: t("heroStat3") },
                { value: t("heroStat4Value"), label: t("heroStat4") },
              ].map((s) => (
                <Card key={s.label} className="py-4 shadow-none">
                  <CardContent className="flex flex-col items-center gap-1 p-3">
                    <span className="text-2xl font-bold text-emerald-600">{s.value}</span>
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* معاينة مصغرة للوحة التحكم */}
            <div className="mt-8 w-full max-w-4xl" dir="ltr">
              <div className="overflow-hidden rounded-xl border bg-card shadow-xl">
                <div className="flex items-center gap-1.5 border-b bg-muted/50 px-4 py-2.5">
                  <span className="h-3 w-3 rounded-full bg-red-400/70" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
                  <span className="mx-auto rounded-md bg-background px-8 py-0.5 text-[10px] text-muted-foreground">
                    your-saas.vercel.app/dashboard
                  </span>
                </div>
                <div className="flex">
                  <div className="hidden w-40 flex-col gap-2 border-r bg-muted/30 p-4 sm:flex">
                    {["Overview", "Users", "Payments", "Billing"].map((item, i) => (
                      <div
                        key={item}
                        className={`rounded-md px-3 py-1.5 text-[11px] ${i === 0 ? "bg-emerald-600 font-semibold text-white" : "text-muted-foreground"}`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 p-5">
                    <div className="grid grid-cols-3 gap-3">
                      {["Revenue", "Users", "MRR"].map((s, i) => (
                        <div key={s} className="rounded-lg border p-3">
                          <div className="text-[10px] text-muted-foreground">{s}</div>
                          <div className="text-sm font-bold text-emerald-600">{["SAR 24,800", "1,248", "SAR 7.2K"][i]}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex h-28 items-end gap-1.5">
                      {[35, 55, 42, 68, 52, 80, 62, 90, 74, 96, 84, 100].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t bg-gradient-to-t from-emerald-600/80 to-teal-400/80"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= المميزات ================= */}
        <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("featuresTitle")}</h2>
            <p className="mx-auto mt-3 max-w-xl text-balance text-muted-foreground">{t("featuresSubtitle")}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { t: t("feature1Title"), d: t("feature1Desc") },
              { t: t("feature2Title"), d: t("feature2Desc") },
              { t: t("feature3Title"), d: t("feature3Desc") },
              { t: t("feature4Title"), d: t("feature4Desc") },
              { t: t("feature5Title"), d: t("feature5Desc") },
              { t: t("feature6Title"), d: t("feature6Desc") },
            ].map((f, i) => {
              const Icon = featureIcons[i];
              return (
                <Card key={f.t} className="group transition-all hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-lg">
                  <CardContent className="flex flex-col gap-3 p-6">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="text-lg font-semibold">{f.t}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{f.d}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ================= الأسعار ================= */}
        <section id="pricing" className="scroll-mt-20 bg-muted/40 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("pricingTitle")}</h2>
              <p className="mx-auto mt-3 max-w-xl text-balance text-muted-foreground">{t("pricingSubtitle")}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <PlanCard
                name={t("planBasic")}
                desc={t("planBasicDesc")}
                price={29}
                features={[t("planBasicF1"), t("planBasicF2"), t("planBasicF3")]}
                onSelect={() => goToPlan("BASIC")}
                label={t("choosePlan")}
              />
              <PlanCard
                name={t("planPro")}
                desc={t("planProDesc")}
                price={59}
                features={[t("planProF1"), t("planProF2"), t("planProF3"), t("planProF4")]}
                highlighted
                badge={t("popular")}
                onSelect={() => goToPlan("PRO")}
                label={t("choosePlan")}
              />
              <PlanCard
                name={t("planAgency")}
                desc={t("planAgencyDesc")}
                price={199}
                features={[t("planAgencyF1"), t("planAgencyF2"), t("planAgencyF3"), t("planAgencyF4")]}
                onSelect={() => goToPlan("AGENCY")}
                label={t("choosePlan")}
              />
            </div>
          </div>
        </section>

        {/* ================= FAQ ================= */}
        <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-16">
          <h2 className="mb-8 text-center text-3xl font-bold tracking-tight md:text-4xl">{t("faqTitle")}</h2>
          <Accordion type="single" collapsible className="w-full">
            {[
              { q: t("faqQ1"), a: t("faqA1") },
              { q: t("faqQ2"), a: t("faqA2") },
              { q: t("faqQ3"), a: t("faqA3") },
              { q: t("faqQ4"), a: t("faqA4") },
            ].map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-start text-base font-medium">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* ================= دعوة للعمل ================= */}
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 px-6 py-12 text-center text-white shadow-xl md:py-16">
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(50% 60% at 70% 20%, rgba(255,255,255,0.15) 0%, transparent 70%)" }}
            />
            <h2 className="relative text-3xl font-bold md:text-4xl">{t("heroTitleAccent")}</h2>
            <p className="relative mx-auto mt-3 max-w-xl text-balance text-emerald-50/90">{t("footerDemoNote")}</p>
            <div className="relative mt-6 flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                variant="secondary"
                className="h-12 bg-white px-6 text-emerald-800 hover:bg-emerald-50"
                onClick={() => setView(session ? "dashboard" : "register")}
              >
                {session ? t("navDashboard") : t("navGetStarted")}
              </Button>
              {!session && (
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 border-white/40 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white"
                  onClick={() => setView("login")}
                >
                  {t("navLogin")}
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* ================= Footer ================= */}
      <footer className="mt-auto border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-teal-500 font-bold text-white">
                  ر
                </span>
                <span className="font-bold">{t("brandName")}</span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{t("footerDesc")}</p>
            </div>
            <FooterCol title={t("footerProduct")} links={[t("navFeatures"), t("navPricing"), t("footerDocs"), t("footerChangelog")]} onFirstClick={() => scrollTo("features")} />
            <FooterCol title={t("footerCompany")} links={[t("footerAbout"), t("footerBlog"), t("footerContact")]} />
            <FooterCol title={t("footerLegal")} links={[t("footerPrivacy"), t("footerTerms")]} />
          </div>
          <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} {t("brandName")} — {t("footerRights")}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ---------- مكوّنات مساعدة ----------
function FooterCol({ title, links, onFirstClick }: { title: string; links: string[]; onFirstClick?: () => void }) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm font-semibold">{title}</h4>
      {links.map((l, i) => (
        <button
          key={l}
          onClick={i === 0 ? onFirstClick : undefined}
          className="text-start text-sm text-muted-foreground transition-colors hover:text-emerald-600"
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function PlanCard({
  name,
  desc,
  price,
  features,
  highlighted,
  badge,
  onSelect,
  label,
}: {
  name: string;
  desc: string;
  price: number;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  onSelect: () => void;
  label: string;
}) {
  return (
    <Card
      className={
        highlighted
          ? "relative border-2 border-emerald-600 shadow-lg transition-transform hover:-translate-y-1"
          : "transition-transform hover:-translate-y-1"
      }
    >
      {badge && (
        <Badge className="absolute -top-3 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 rounded-full bg-emerald-600 px-3">
          {badge}
        </Badge>
      )}
      <CardContent className="flex flex-col gap-4 p-6">
        <div>
          <h3 className="text-lg font-bold">{name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-extrabold">{price}</span>
          <span className="text-sm text-muted-foreground">SAR</span>
        </div>
        <ul className="flex flex-col gap-2.5">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <Button onClick={onSelect} variant={highlighted ? "default" : "outline"} className="mt-auto">
          {label}
        </Button>
      </CardContent>
    </Card>
  );
}
