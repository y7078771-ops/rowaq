"use client";

// ============================================================
// سجل المدفوعات — جدول المدفوعات مع حالات ملوّنة
// ============================================================
import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { formatSAR, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PaymentRow {
  id: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  plan: string | null;
  createdAt: string;
  user?: { email: string } | null;
}

const statusColors: Record<string, string> = {
  PAID: "bg-emerald-600/15 text-emerald-700",
  PENDING: "bg-amber-500/15 text-amber-700",
  FAILED: "bg-red-500/15 text-red-700",
  REFUNDED: "bg-sky-500/15 text-sky-700",
};

export function PaymentsTable() {
  const t = useAppStore((s) => s.t);
  const locale = useAppStore((s) => s.locale);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/payments");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setPayments(data.payments);
      } catch {
        setPayments([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Card>
      <CardContent className="p-6">
        <h1 className="mb-4 text-xl font-bold">{t("paymentsTitle")}</h1>
        {loading ? (
          <div className="flex flex-col gap-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto rounded-lg border">
            <Table>
              <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur">
                <TableRow>
                  <TableHead>{t("payPlan")}</TableHead>
                  <TableHead>{t("payAmount")}</TableHead>
                  <TableHead>{t("payStatus")}</TableHead>
                  <TableHead>{t("payProvider")}</TableHead>
                  <TableHead>{t("payDate")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.plan ?? "—"}</TableCell>
                    <TableCell className="font-semibold text-emerald-700" dir="ltr">
                      {formatSAR(p.amount / 100, locale)}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[p.status] ?? ""} variant="secondary">
                        {t(`status${p.status}` as never) ?? p.status}
                      </Badge>
                    </TableCell>
                    <TableCell dir="ltr" className="text-sm capitalize text-muted-foreground">
                      {p.provider}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(p.createdAt, locale)}</TableCell>
                  </TableRow>
                ))}
                {payments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      —
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
