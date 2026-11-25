"use client";

// ============================================================
// إعدادات الحساب — تعديل الملف الشخصي وعرض معلومات الحساب
// ============================================================
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Mail, ShieldCheck, User } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  emailVerified: boolean;
  createdAt: string;
  subscriptions: { plan: string; status: string }[];
}

export function Settings() {
  const t = useAppStore((s) => s.t);
  const locale = useAppStore((s) => s.locale);
  const { update } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProfile(data.user);
        setName(data.user.name ?? "");
      } catch {
        toast.error(t("error"));
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  const save = async () => {
    if (name.trim().length < 2) {
      toast.error(t("requiredField"));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error();
      toast.success(t("settingsSaved"));
      await update(); // تحديث الجلسة بالاسم الجديد
    } catch {
      toast.error(t("error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardContent className="p-6">
          <h1 className="mb-4 text-xl font-bold">{t("settingsTitle")}</h1>
          {loading || !profile ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ) : (
            <>
              {/* معلومات الحساب */}
              <div className="mb-6 flex flex-col gap-3 rounded-lg border bg-muted/30 p-4">
                <InfoRow icon={<Mail className="h-4 w-4" />} label={t("email")}>
                  <span dir="ltr">{profile.email}</span>
                </InfoRow>
                <InfoRow icon={<ShieldCheck className="h-4 w-4" />} label="Status">
                  <div className="flex gap-2">
                    {profile.emailVerified ? (
                      <Badge variant="secondary" className="text-emerald-700">{t("verifiedBadge")}</Badge>
                    ) : (
                      <Badge variant="outline">{t("notVerifiedBadge")}</Badge>
                    )}
                    <Badge variant={profile.role === "ADMIN" ? "default" : "secondary"} className={profile.role === "ADMIN" ? "bg-emerald-600" : ""}>
                      {profile.role === "ADMIN" ? t("adminBadge") : t("userBadge")}
                    </Badge>
                  </div>
                </InfoRow>
                <InfoRow icon={<User className="h-4 w-4" />} label="Member since">
                  {formatDate(profile.createdAt, locale)}
                </InfoRow>
                {profile.subscriptions.length > 0 && (
                  <InfoRow icon={<ShieldCheck className="h-4 w-4" />} label={t("dashBilling")}>
                    <Badge className="bg-emerald-600/15 text-emerald-700 hover:bg-emerald-600/15">
                      {profile.subscriptions[0].plan} — ACTIVE
                    </Badge>
                  </InfoRow>
                )}
              </div>

              {/* تعديل الاسم */}
              <div className="flex flex-col gap-2">
                <Label className="text-sm">{t("name")}</Label>
                <div className="flex gap-2">
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("name")} />
                  <Button onClick={save} disabled={saving} className="shrink-0">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t("settingsSave")}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="font-medium">{children}</span>
    </div>
  );
}
