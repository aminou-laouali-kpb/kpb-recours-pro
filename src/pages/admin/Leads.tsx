import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

  const filtered = profiles.filter((p: any) => {
    const s = search.toLowerCase();
    return !s || p.email?.toLowerCase().includes(s) || p.full_name?.toLowerCase().includes(s) || p.whatsapp_number?.includes(s) || p.country?.toLowerCase().includes(s);
  });

  const exportCSV = () => {
    const headers = ["Nom", "Email", "WhatsApp", "Pays", "Nationalité", "Niveau", "Objectif", "Domaine", "Date"];
    const rows = filtered.map((p: any) => [
      p.full_name, p.email, p.whatsapp_number, p.country, p.nationality,
      p.current_academic_level, p.target_level_in_france, p.field_of_study,
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
        <Input placeholder="Rechercher par nom, email, WhatsApp, pays..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Pays</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="text-xs font-medium">{p.full_name ?? "—"}</TableCell>
                  <TableCell className="text-xs">{p.email ?? "—"}</TableCell>
                  <TableCell className="text-xs">{p.whatsapp_number ?? "—"}</TableCell>
                  <TableCell className="text-xs">{p.country ?? "—"}</TableCell>
                  <TableCell className="text-xs">{new Date(p.created_at).toLocaleDateString("fr-FR")}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">Aucun lead</TableCell></TableRow>}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AdminLayout>
  );
}
