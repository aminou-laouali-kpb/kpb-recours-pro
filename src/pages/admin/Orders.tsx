import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function AdminOrders() {
  const [search, setSearch] = useState("");

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data: orderData } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (!orderData) return [];
      const userIds = [...new Set(orderData.map(o => o.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, email, full_name, country").in("user_id", userIds);
      const profileMap = new Map((profiles ?? []).map(p => [p.user_id, p]));
      return orderData.map(o => ({ ...o, profile: profileMap.get(o.user_id) ?? null }));
    },
  });

  const filtered = orders.filter((o: any) => {
    const s = search.toLowerCase();
    return !s || o.profile?.email?.toLowerCase().includes(s) || o.reference?.toLowerCase().includes(s) || o.status?.includes(s);
  });

  const statusColor = (s: string) => {
    if (s === "paid") return "bg-success/10 text-success";
    if (s === "pending") return "bg-warning/10 text-warning";
    return "bg-destructive/10 text-destructive";
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <h2 className="text-xl font-bold">Commandes</h2>
        <Input placeholder="Rechercher par email, référence ou statut..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o: any) => (
                <TableRow key={o.id}>
                  <TableCell className="text-xs">{o.profile?.email ?? "—"}</TableCell>
                  <TableCell className="text-xs font-mono">{o.reference ?? "—"}</TableCell>
                  <TableCell className="text-xs">{o.amount} {o.currency}</TableCell>
                  <TableCell><Badge variant="secondary" className={`text-xs capitalize border-0 ${statusColor(o.status)}`}>{o.status}</Badge></TableCell>
                  <TableCell className="text-xs">{o.provider}</TableCell>
                  <TableCell className="text-xs">{new Date(o.created_at).toLocaleDateString("fr-FR")}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">Aucune commande</TableCell></TableRow>}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AdminLayout>
  );
}
