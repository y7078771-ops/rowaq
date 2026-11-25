// ============================================================
// أدوات تنسيق الأرقام والتواريخ — تدعم العربية والإنجليزية
// ============================================================
export function formatSAR(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory" : "en-US", {
    dateStyle: "medium",
  }).format(new Date(date));
}
