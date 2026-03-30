import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Download } from "lucide-react";

export default function AdminLeads() {
  const [search, setSearch] = useState("");

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: letterCounts = {} } = useQuery({
    queryKey: ["admin-letter-counts"],
    queryFn: async () => {
      const { data } = await supabase.from("generated_letters").select("user_id");
      const counts: Record<string, number> = {};
      (data ?? []).forEach((l: any) => {
        counts[l.user_id] = (counts[l.user_id] || 0) + 1;
      });
      return counts;
    },
  });

  const filtered = profiles.filter((p: any) => {
    const s = search.toLowerCase();
    return !s || p.email?.toLowerCase().includes(s) || p.full_name?.toLowerCase().includes(s) || p.whatsapp_number?.includes(s) || p.country?.toLowerCase().includes(s) || p.nationality?.toLowerCase().includes(s);
  });

  const isComplete = (p: any) => p.full_name && p.whatsapp_number && p.country;

  const exportCSV = () => {
    const headers = ["Nom", "Email", "WhatsApp", "Pays", "Nationalité", "Niveau", "Objectif", "Domaine", "Profil complet", "Recours", "Date"];
    const rows = filtered.map((p: any) => [
      p.full_name, p.email, p.whatsapp_number, p.country, p.nationality,
      p.current_academic_level, p.target_level_in_france, p.field_of_study,
      isComplete(p) ? "Oui" : "Non",
      letterCounts[p.user_id] || 0,
      new Date(p.created_at).toLocaleDateString("fr-FR"),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c: any) => `"${c || ""}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads_kpb.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Leads ({filtered.length})</h2>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="mr-1 h-3 w-3" /> Export CSV
          </Button>
        </div>
        <Input placeholder="Rechercher par nom, email, WhatsApp, pays, nationalité..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        <Card className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Pays</TableHead>
                <TableHead>Nationalité</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead>Domaine</TableHead>
                <TableHead>Profil</TableHead>
                <TableHead>Recours</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="text-xs font-medium whitespace-nowrap">{p.full_name ?? "—"}</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{p.email ?? "—"}</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{p.whatsapp_number ?? "—"}</TableCell>
                  <TableCell className="text-xs">{p.country ?? "—"}</TableCell>
                  <TableCell className="text-xs">{p.nationality ?? "—"}</TableCell>
                  <TableCell className="text-xs">{p.current_academic_level ?? "—"}</TableCell>
                  <TableCell className="text-xs">{p.field_of_study ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={isComplete(p) ? "default" : "secondary"} className="text-[10px]">
                      {isComplete(p) ? "Complet" : "Incomplet"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-medium">{letterCounts[p.user_id] || 0}</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{new Date(p.created_at).toLocaleDateString("fr-FR")}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={10} className="text-center text-sm text-muted-foreground py-8">Aucun lead</TableCell></TableRow>}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AdminLayout>
  );
}
