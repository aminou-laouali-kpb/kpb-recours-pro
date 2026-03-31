import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Info } from "lucide-react";

const COUNTRIES = [
  "Sénégal", "Côte d'Ivoire", "Cameroun", "Mali", "Guinée", "Burkina Faso",
  "Bénin", "Togo", "Congo (RDC)", "Congo (Brazzaville)", "Gabon", "Tchad",
  "Niger", "Madagascar", "Maroc", "Tunisie", "Algérie", "Mauritanie",
  "Comores", "Djibouti", "Haïti", "Autre",
];

export default function Inscription() {
  const [form, setForm] = useState({ full_name: "", email: "", password: "", whatsapp_number: "", country: "", nationality: "" });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const updateField = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.trim() || !form.full_name.trim() || !form.password) return;
    if (form.password.length < 6) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 6 caractères.", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            full_name: form.full_name.trim(),
            whatsapp_number: form.whatsapp_number.trim(),
            country: form.country,
            nationality: form.nationality,
          },
        },
      });
      if (error) {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Compte créé !", description: "Tu es maintenant connecté." });
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast({ title: "Erreur", description: err?.message || "Erreur inattendue", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            <span className="text-gradient-premium">KPB</span> Recours Gratuit
          </CardTitle>
          <CardDescription>Crée ton compte pour générer ton recours gratuitement</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nom complet *</Label>
              <Input id="full_name" placeholder="Prénom Nom" value={form.full_name} onChange={(e) => updateField("full_name", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email *</Label>
              <Input id="email" type="email" placeholder="ton.email@exemple.com" value={form.email} onChange={(e) => updateField("email", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe *</Label>
              <Input id="password" type="password" placeholder="Minimum 6 caractères" value={form.password} onChange={(e) => updateField("password", e.target.value)} required minLength={6} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">Numéro WhatsApp</Label>
              <Input id="whatsapp" type="tel" placeholder="+221 77 000 00 00" value={form.whatsapp_number} onChange={(e) => updateField("whatsapp_number", e.target.value)} />
            </div>

            {/* Reassurance message */}
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5">
              <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Assure-toi que ton email et ton numéro WhatsApp soient corrects. Tu recevras ta lettre de recours gratuite par ces moyens.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Pays de résidence</Label>
              <Select value={form.country} onValueChange={(v) => updateField("country", v)}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nationalité</Label>
              <Select value={form.nationality} onValueChange={(v) => updateField("nationality", v)}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full gradient-premium text-primary-foreground" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Créer mon compte
            </Button>
            <div className="text-center">
              <Link to="/connexion" className="text-sm text-primary hover:underline">
                J'ai déjà un compte
              </Link>
            </div>
          </form>
          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Retour à l'accueil
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
