import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import { useTrackEvent } from "@/hooks/useTrackEvent";

const COUNTRIES = [
  "Sénégal", "Côte d'Ivoire", "Cameroun", "Mali", "Guinée", "Burkina Faso",
  "Bénin", "Togo", "Congo (RDC)", "Congo (Brazzaville)", "Gabon", "Tchad",
  "Niger", "Madagascar", "Maroc", "Tunisie", "Algérie", "Mauritanie",
  "Comores", "Djibouti", "Haïti", "Autre",
];

const LEVELS = ["Bac", "Bac+1", "Bac+2", "Bac+3 (Licence)", "Bac+4", "Bac+5 (Master)", "Doctorat", "Autre"];

export default function MonProfil() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const trackEvent = useTrackEvent();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "", whatsapp_number: "", country: "", nationality: "",
    current_academic_level: "", target_level_in_france: "", field_of_study: "",
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        whatsapp_number: profile.whatsapp_number ?? "",
        country: profile.country ?? "",
        nationality: profile.nationality ?? "",
        current_academic_level: (profile as any).current_academic_level ?? "",
        target_level_in_france: (profile as any).target_level_in_france ?? "",
        field_of_study: (profile as any).field_of_study ?? "",
      });
    }
  }, [profile]);

  const updateField = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name,
          whatsapp_number: form.whatsapp_number,
          country: form.country,
          nationality: form.nationality,
          current_academic_level: form.current_academic_level,
          target_level_in_france: form.target_level_in_france,
          field_of_study: form.field_of_study,
        } as any)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({ title: "Profil mis à jour ✓" });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      trackEvent("profile_completed");

      // Fire n8n webhook
      supabase.functions.invoke("n8n-webhook", {
        body: { event_type: "profile_completed" },
      }).catch(() => {});
    } catch (err: any) {
      toast({ title: "Erreur", description: err?.message || "Erreur de sauvegarde", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-5 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold">Mon profil</h2>

        <Card>
          <CardHeader><CardTitle className="text-lg">Informations personnelles</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email ?? ""} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Nom complet</Label>
              <Input value={form.full_name} onChange={(e) => updateField("full_name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Numéro WhatsApp</Label>
              <Input type="tel" placeholder="+221 77 000 00 00" value={form.whatsapp_number} onChange={(e) => updateField("whatsapp_number", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Pays</Label>
                <Select value={form.country} onValueChange={(v) => updateField("country", v)}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nationalité</Label>
                <Select value={form.nationality} onValueChange={(v) => updateField("nationality", v)}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Parcours académique</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Niveau académique actuel</Label>
              <Select value={form.current_academic_level} onValueChange={(v) => updateField("current_academic_level", v)}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>{LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Niveau visé en France</Label>
              <Select value={form.target_level_in_france} onValueChange={(v) => updateField("target_level_in_france", v)}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>{LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Domaine d'études</Label>
              <Input placeholder="Ex: Informatique, Économie, Droit..." value={form.field_of_study} onChange={(e) => updateField("field_of_study", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full gradient-premium text-primary-foreground" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Enregistrer
        </Button>
      </div>
    </AppLayout>
  );
}
