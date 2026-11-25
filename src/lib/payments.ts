// ============================================================
// تكامل بوابة Moyasar — https://docs.moyasar.com
//
// الوضع الحقيقي: أضف MOYASAR_SECRET_KEY في ملف .env
// الوضع التجريبي: بدون مفتاح، تُحاكى العمليات وتُحفظ في قاعدة البيانات
//   البطاقات التجريبية: النجاح 4111-1111-1111-1111 / الفشل أي بطاقة تنتهي برقم 0
// ============================================================

export interface CreatePaymentInput {
  amount: number; // بالهللات
  currency: string;
  description: string;
  source?: {
    type: string;
    company?: string;
    name?: string;
    number?: string;
    cvc?: string;
    month?: string;
    year?: string;
  };
}

export interface PaymentGatewayResult {
  status: "PAID" | "FAILED" | "PENDING";
  providerPaymentId: string | null;
  provider: "moyasar" | "demo";
  error?: string;
}

const MOYASAR_API = "https://api.moyasar.com/v1/payments";

export function isLiveMode(): boolean {
  return Boolean(process.env.MOYASAR_SECRET_KEY);
}

/**
 * إنشاء عملية دفع لدى Moyasar أو محاكاتها في الوضع التجريبي
 * في الإنتاج الحقيقي: استخدم Moyasar iframe / apple pay SDK على الواجهة
 * ثم وثّق العملية هنا (verify) — هذا المثال يبسّط التدفق للبطاقات المباشرة.
 */
export async function createPayment(input: CreatePaymentInput): Promise<PaymentGatewayResult> {
  if (!isLiveMode()) {
    // ---------- الوضع التجريبي ----------
    const cardNumber = input.source?.number ?? "";
    const failed = cardNumber.endsWith("0"); // بطاقة تنتهي بصفر => فشل
    return {
      status: failed ? "FAILED" : "PAID",
      providerPaymentId: `demo_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      provider: "demo",
    };
  }

  // ---------- الوضع الحقيقي (Moyasar) ----------
  try {
    const res = await fetch(MOYASAR_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(process.env.MOYASAR_SECRET_KEY + ":").toString("base64")}`,
      },
      body: JSON.stringify({
        amount: input.amount,
        currency: input.currency,
        description: input.description,
        source: input.source ?? { type: "creditcard" },
        callback_url: process.env.MOYASAR_CALLBACK_URL ?? undefined,
      }),
    });
    const data = (await res.json()) as { id?: string; status?: string; source?: { message?: string } };
    if (!res.ok || !data.id) {
      return {
        status: "FAILED",
        providerPaymentId: null,
        provider: "moyasar",
        error: data?.source?.message ?? `HTTP ${res.status}`,
      };
    }
    return {
      // paid | failed | initiated — نعرض initiated كـ PENDING للتحقق اللاحق
      status: data.status === "paid" ? "PAID" : data.status === "failed" ? "FAILED" : "PENDING",
      providerPaymentId: data.id,
      provider: "moyasar",
    };
  } catch (err) {
    return {
      status: "FAILED",
      providerPaymentId: null,
      provider: "moyasar",
      error: err instanceof Error ? err.message : "network error",
    };
  }
}

// ============================================================
// تكامل Tap — ضع مفتاح TAP_SECRET_KEY في .env واستدعِ هذه الدالة
// ============================================================
export async function createTapCharge(input: CreatePaymentInput): Promise<PaymentGatewayResult> {
  if (!process.env.TAP_SECRET_KEY) {
    return { status: "FAILED", providerPaymentId: null, provider: "demo", error: "TAP_SECRET_KEY not set" };
  }
  try {
    const res = await fetch("https://api.tap.company/v2/charges", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TAP_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: input.amount / 100,
        currency: input.currency,
        description: input.description,
        source: { id: "src_all" },
        redirect: { url: process.env.TAP_CALLBACK_URL ?? "" },
      }),
    });
    const data = (await res.json()) as { id?: string; status?: string };
    if (!res.ok || !data.id) {
      return { status: "FAILED", providerPaymentId: null, provider: "moyasar", error: `HTTP ${res.status}` };
    }
    return {
      status: data.status === "CAPTURED" ? "PAID" : data.status === "FAILED" ? "FAILED" : "PENDING",
      providerPaymentId: data.id,
      provider: "moyasar",
    };
  } catch (err) {
    return {
      status: "FAILED",
      providerPaymentId: null,
      provider: "moyasar",
      error: err instanceof Error ? err.message : "network error",
    };
  }
}
