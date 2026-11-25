"use client";

// ============================================================
// الخطط والدفع — تجربة تدفق الدفع الكامل (Moyasar تجريبي)
// البطاقة الناجحة: 4111 1111 1111 1111 — بطاقة تنتهي بـ 0: فشل
// ============================================================
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { formatSAR } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, CreditCard, Info, Loader2, ShieldCheck } from "lucide-react";

const PLANS = [
  { key: "BASIC", price: 29, f: ["planBasicF1", "planBasicF2", "planBasicF3"] },
  { key: "PRO", price: 59, f: ["planProF1", "planProF2", "planProF3", "planProF4"] },
  { key: "AGENCY", price: 199, f: ["planAgencyF1", "planAgencyF2", "planAgencyF3", "planAgencyF4"] },
] as const;

export function Billing() {
  const t = useAppStore((s) => s.t);
  const selectedPlan = useAppStore((s) => s.selectedPlan);
  const setSelectedPlan = useAppStore((s) => s.setSelectedPlan);
  const [cardNumber, setCardNumber] = useState("4111 1111 1111 1111");
  const [cardName, setCardName] = useState("");
  const [cardMonth, setCardMonth] = useState("12");
  const [cardYear, setCardYear] = useState("28");
  const [cardCvc, setCardCvc] = useState("123");
  const [paying, setPaying] = useState(false);
  const [liveMode, setLiveMode] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/payments");
        if (res.ok) {
          const data = await res.json();
          setLiveMode(Boolean(data.liveMode));
        }
      } catch {
        /* تجاهل */
      }
    })();
  }, []);

  const pay = useCallback(async () => {
    setPaying(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          cardNumber: cardNumber.replace(/\s/g, ""),
          cardName: cardName || "Demo Card",
          cardCvc,
          cardMonth,
          cardYear,
        }),
      });
      const data = await res.json();
      if (data.payment?.status === "PAID") {
        toast.success(t("paySuccess"));
      } else if (data.payment?.status === "FAILED") {
        toast.error(t("payFailed"));
      } else if (!res.ok) {
        toast.error(t("error"));
      }
    } catch {
      toast.error(t("error"));
    } finally {
      setPaying(false);
    }
  }, [selectedPlan, cardNumber, cardName, cardCvc, cardMonth, cardYear, t]);

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardContent className="p-6">
          <h1 className="text-xl font-bold">{t("billingTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("billingSubtitle")}</p>
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {liveMode ? "Moyasar live mode" : t("billingDemoMode")}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* اختيار الخطة */}
      <div className="grid gap-3 md:grid-cols-3">
        {PLANS.map((p) => {
          const active = selectedPlan === p.key;
          return (
            <button
              key={p.key}
              onClick={() => setSelectedPlan(p.key)}
              className={`rounded-xl border-2 p-4 text-start transition-all ${
                active
                  ? "border-emerald-600 bg-emerald-600/5 shadow-md"
                  : "border-border bg-card hover:border-emerald-600/40"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-bold">{p.key}</span>
                {active && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
              <div className="mb-3 text-2xl font-extrabold text-emerald-700" dir="ltr">
                {formatSAR(p.price, "en")}
              </div>
              <ul className="flex flex-col gap-1.5">
                {p.f.map((k) => (
                  <li key={k} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 shrink-0 text-emerald-600" />
                    {t(k as never)}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {/* نموذج البطاقة */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              {t("payNow")} — {selectedPlan}
            </h3>
            <Badge variant="secondary" className="gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              {liveMode ? "Moyasar" : "Demo"}
            </Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>{t("cardNumber")}</Label>
              <Input
                dir="ltr"
                inputMode="numeric"
                value={cardNumber}
                onChange={(e) => {
                  const digits = e.target.value.replace(/[^\d]/g, "").slice(0, 16);
                  setCardNumber(digits.replace(/(\d{4})(?=\d)/g, "$1 "));
                }}
                placeholder="4111 1111 1111 1111"
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>{t("cardHolder")}</Label>
              <Input dir="ltr" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="AHMED ALI" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t("cardExpiry")}</Label>
              <div className="flex gap-2">
                <Input dir="ltr" inputMode="numeric" maxLength={2} value={cardMonth} onChange={(e) => setCardMonth(e.target.value.replace(/\D/g, ""))} placeholder="12" />
                <Input dir="ltr" inputMode="numeric" maxLength={2} value={cardYear} onChange={(e) => setCardYear(e.target.value.replace(/\D/g, ""))} placeholder="28" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>CVC</Label>
              <Input dir="ltr" inputMode="numeric" maxLength={4} value={cardCvc} onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ""))} placeholder="123" />
            </div>
          </div>

          <Button className="h-11" onClick={pay} disabled={paying}>
            {paying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("payProcessing")}
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                {t("payNow")} — {selectedPlan}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
