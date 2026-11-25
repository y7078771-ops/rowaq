"use client";

// ============================================================
// جدول المستخدمين — إدارة المستخدمين مع الشارات
// ============================================================
import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
  _count: { subscriptions: number };
}

export function UsersTable() {
  const t = useAppStore((s) => s.t);
  const locale = useAppStore((s) => s.locale);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/users");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setUsers(data.users);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Card>
      <CardContent className="p-6">
        <h1 className="mb-4 text-xl font-bold">{t("usersTitle")}</h1>
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
                  <TableHead>{t("usersName")}</TableHead>
                  <TableHead>{t("usersEmail")}</TableHead>
                  <TableHead>{t("usersRole")}</TableHead>
                  <TableHead className="text-center">{t("usersSubs")}</TableHead>
                  <TableHead>{t("usersJoined")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-emerald-600/10 text-xs font-bold text-emerald-700">
                            {(u.name ?? u.email).trim().charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{u.name ?? "—"}</span>
                          {u.emailVerified ? (
                            <Badge variant="secondary" className="mt-0.5 w-fit px-1.5 py-0 text-[10px] text-emerald-700">
                              {t("verifiedBadge")}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="mt-0.5 w-fit px-1.5 py-0 text-[10px] text-muted-foreground">
                              {t("notVerifiedBadge")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell dir="ltr" className="text-sm text-muted-foreground">
                      {u.email}
                    </TableCell>
                    <TableCell>
                      {u.role === "ADMIN" ? (
                        <Badge className="bg-emerald-600/15 text-emerald-700 hover:bg-emerald-600/15">
                          {t("adminBadge")}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">{t("userBadge")}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center font-semibold">{u._count.subscriptions}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(u.createdAt, locale)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
