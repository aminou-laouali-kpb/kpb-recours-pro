import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Shield, CreditCard, FileText, Users } from "lucide-react";

export default function AdminPremiumAccess() {
  const [search, setSearch] = useState("");

  const { data: accesses = [] } = useQuery({
    queryKey: ["admin-premium-access"],
    queryFn: async () => {
      const { data } = await supabase
        .from("premium_access")
        .select("*, profiles!premium_access_user_id_fkey(email, full_name, country)")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: metrics } = useQuery({
    queryKey: ["admin-metrics"],
    queryFn: async () => {
      const [accessRes, ordersRes, lettersRes] = await Promise.all([
        supabase.from("premium_access").select("status, used_letters"),
        supabase.from("orders").select("status"),
        supabase.from("generated_letters").select("id"),
      ]);
      const allAccess = accessRes.data ?? [];
      const allOrders = ordersRes.data ?? [];
      const active = allAccess.filter((a) => a.status === "active").length;
      const pending = allOrders.filter((o) => o.status === "pending").length;
      const paid = allOrders.filter((o) => o.status === "paid").length;
      const totalLetters = lettersRes.data?.length ?? 0;
      const avgLetters = active > 0
        ? (allAccess.filter((a) => a.status === "active").reduce((s, a) => s + a.used_letters, 0) / active).toFixed(1)
        : "0";
      return { active, pending, paid, totalLetters, avgLetters };
    },
  });

  const filtered = accesses.filter((a: any) => {
    const profile = a.profiles;
    const s = search.toLowerCase();
    return !s || profile?.email?.toLowerCase().includes(s) || profile?.full_name?.toLowerCase().includes(s) || profile?.country?.toLowerCase().includes(s);
  });

  const metricCards = [
    { icon: Shield, label: "Accès actifs", value: metrics?.active ?? 0, color: "text-success" },
    { icon: CreditCard, label: "Paiements en attente", value: metrics?.pending ?? 0, color: "text-warning" },
    { icon: CreditCard, label: "Commandes payées", value: metrics?.paid ?? 0, color: "text-primary" },
    { icon: FileText, label: "Total lettres", value: metrics?.totalLetters ?? 0, color: "text-primary" },
    { icon: Users, label: "Moy. lettres/utilisateur", value: metrics?.avgLetters ?? "0", color: "text-muted-foreground" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {metricCards.map(({ icon: Icon, label, value, color }) => (
            <Card key={label}>
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className={`h-5 w-5 ${color}`} />
                <div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter */}
        <Input placeholder="Rechercher par email, nom ou pays..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />

        {/* Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Lettres</TableHead>
                <TableHead>Pays</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a: any) => (
                <TableRow key={a.id}>
                  <TableCell className="text-xs">{a.profiles?.email ?? "—"}</TableCell>
                  <TableCell className="text-xs">{a.profiles?.full_name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={a.status === "active" ? "default" : "secondary"} className="text-xs capitalize">
                      {a.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{a.used_letters}/{a.max_letters}</TableCell>
                  <TableCell className="text-xs">{a.profiles?.country ?? "—"}</TableCell>
                  <TableCell className="text-xs">{new Date(a.created_at).toLocaleDateString("fr-FR")}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                    Aucun accès premium trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AdminLayout>
  );
}
