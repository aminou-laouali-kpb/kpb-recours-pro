import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function AdminRecours() {
  const [search, setSearch] = useState("");

  const { data: letters = [] } = useQuery({
    queryKey: ["admin-recours"],
    queryFn: async () => {
      const { data: letterData } = await supabase.from("generated_letters").select("*").order("created_at", { ascending: false });
      if (!letterData) return [];
      const userIds = [...new Set(letterData.map(l => l.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, email, full_name").in("user_id", userIds);
      const profileMap = new Map((profiles ?? []).map(p => [p.user_id, p]));
      return letterData.map(l => ({ ...l, profile: profileMap.get(l.user_id) ?? null }));
    },
  });

  const filtered = letters.filter((l: any) => {
    const s = search.toLowerCase();
    return !s || l.profile?.email?.toLowerCase().includes(s) || l.university_name?.toLowerCase().includes(s) || l.profile?.full_name?.toLowerCase().includes(s);
  });

  return (
    <AdminLayout>
      <div className="space-y-5">
        <h2 className="text-xl font-bold">Recours générés ({filtered.length})</h2>
        <Input placeholder="Rechercher par nom, email ou université..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Université</TableHead>
                <TableHead>Programme</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l: any) => (
                <TableRow key={l.id}>
                  <TableCell className="text-xs font-medium">{l.profile?.full_name ?? "—"}</TableCell>
                  <TableCell className="text-xs">{l.profile?.email ?? "—"}</TableCell>
                  <TableCell className="text-xs">{l.university_name}</TableCell>
                  <TableCell className="text-xs">{l.program_name}</TableCell>
                  <TableCell className="text-xs">{new Date(l.created_at).toLocaleDateString("fr-FR")}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">Aucun recours</TableCell></TableRow>}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AdminLayout>
  );
}
