import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function AdminGeneratedLetters() {
  const [search, setSearch] = useState("");

  const { data: letters = [] } = useQuery({
    queryKey: ["admin-letters"],
    queryFn: async () => {
      const { data } = await supabase
        .from("generated_letters")
        .select("*, profiles!generated_letters_user_id_fkey(email, full_name)")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const filtered = letters.filter((l: any) => {
    const s = search.toLowerCase();
    return !s || l.profiles?.email?.toLowerCase().includes(s) || l.university_name?.toLowerCase().includes(s);
  });

  return (
    <AdminLayout>
      <div className="space-y-5">
        <h2 className="text-xl font-bold">Lettres générées</h2>
        <Input placeholder="Rechercher par email ou université..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Université</TableHead>
                <TableHead>Programme</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l: any) => (
                <TableRow key={l.id}>
                  <TableCell className="text-xs">{l.profiles?.email ?? "—"}</TableCell>
                  <TableCell className="text-xs">{l.university_name}</TableCell>
                  <TableCell className="text-xs">{l.program_name}</TableCell>
                  <TableCell className="text-xs">{new Date(l.created_at).toLocaleDateString("fr-FR")}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">Aucune lettre</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AdminLayout>
  );
}
