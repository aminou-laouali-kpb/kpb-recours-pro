import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PremiumLayout } from "@/components/PremiumLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowRight, ArrowLeft, Copy, Download, CheckCircle } from "lucide-react";
import { useTrackEvent } from "@/hooks/useTrackEvent";
import { UpsellBlock } from "@/components/UpsellBlock";
import { Disclaimer } from "@/components/Disclaimer";

interface FormData {
  university_name: string;
  program_name: string;
  refusal_reason: string;
  context: string;
  academic_project: string;
  why_reconsider: string;
  new_elements: string;
  supporting_notes: string;
  tone: string;
}

const defaultForm: FormData = {
  university_name: "",
  program_name: "",
  refusal_reason: "",
  context: "",
  academic_project: "",
  why_reconsider: "",
  new_elements: "",
  supporting_notes: "",
  tone: "formal",
};

export default function NouveletteLettre() {
  const { user } = useAuth();
  const { data: access } = usePremiumAccess();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [generating, setGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const trackEvent = useTrackEvent();
  const queryClient = useQueryClient();

  const { data: assessment } = useQuery({
    queryKey: ["assessment", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("free_assessments")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Prefill from assessment
  useEffect(() => {
    if (assessment) {
      setForm((prev) => ({
        ...prev,
        university_name: assessment.institutions_applied_to?.[0] ?? prev.university_name,
        program_name: assessment.program_applied_for ?? prev.program_name,
        context: assessment.result_explanation ?? prev.context,
        academic_project: `${assessment.field_of_study ?? ""} - ${assessment.target_level_in_france ?? ""}`.trim(),
      }));
    }
  }, [assessment]);

  useEffect(() => { trackEvent("new_letter_started"); }, []);

  const remaining = access ? access.max_letters - access.used_letters : 0;

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (remaining <= 0) {
      trackEvent("quota_reached");
      toast({ title: "Quota épuisé", description: "Tu as utilisé toutes tes lettres disponibles.", variant: "destructive" });
      return;
    }
    setGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-letter", {
        body: {
          premium_access_id: access!.id,
          ...form,
        },
      });

      if (error || data?.error) throw new Error(data?.error || "Erreur de génération");

      setGeneratedLetter(data.letter_text);
      trackEvent("letter_generated", { university: form.university_name });
      queryClient.invalidateQueries({ queryKey: ["premium-access"] });
      queryClient.invalidateQueries({ queryKey: ["letters"] });
      setStep(4);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      toast({ title: "Erreur", description: message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedLetter], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recours_${form.university_name.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Step 4: Result
  if (step === 4 && generatedLetter) {
    return (
      <PremiumLayout>
        <div className="space-y-5 max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            <h2 className="text-xl font-bold">Lettre générée !</h2>
          </div>
          <Card>
            <CardContent className="p-5">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{generatedLetter}</pre>
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button onClick={handleCopy} variant="outline" className="flex-1">
              {copied ? <CheckCircle className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "Copié !" : "Copier"}
            </Button>
            <Button onClick={handleDownload} variant="outline" className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </Button>
          </div>
          <Disclaimer />
          <UpsellBlock />
          <Button variant="ghost" onClick={() => navigate("/premium/dashboard")} className="w-full">
            Retour au dashboard
          </Button>
        </div>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout>
      <div className="space-y-5 max-w-2xl mx-auto">
        <div>
          <h2 className="text-xl font-bold">Nouvelle lettre de recours</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Étape {step}/3 — {remaining} lettre(s) restante(s)
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? "gradient-premium" : "bg-muted"}`} />
          ))}
        </div>

        {step === 1 && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Informations sur la candidature</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Nom de l'université / école</Label>
                <Input placeholder="Ex: Université de Lyon 2" value={form.university_name} onChange={(e) => updateField("university_name", e.target.value)} />
                <p className="text-xs text-muted-foreground">Ex : « Université Paris-Saclay », « INSA Lyon », « Université de Strasbourg »</p>
              </div>
              <div className="space-y-1">
                <Label>Programme / formation</Label>
                <Input placeholder="Ex: Licence 3 Économie" value={form.program_name} onChange={(e) => updateField("program_name", e.target.value)} />
                <p className="text-xs text-muted-foreground">Ex : « Master 1 Informatique », « Licence 3 Économie-Gestion », « DUT GEA »</p>
              </div>
              <div className="space-y-1">
                <Label>Motif de refus (si connu)</Label>
                <Input placeholder="Ex: Dossier incomplet, profil non retenu..." value={form.refusal_reason} onChange={(e) => updateField("refusal_reason", e.target.value)} />
                <p className="text-xs text-muted-foreground">Ex : « Capacité d'accueil atteinte », « Dossier jugé insuffisant », « Pièces manquantes »</p>
              </div>
              <Button onClick={() => setStep(2)} className="w-full gradient-premium text-primary-foreground" disabled={!form.university_name || !form.program_name}>
                Suivant <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Ton projet académique</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Contexte de ta candidature</Label>
                <Textarea placeholder="Décris brièvement ta situation..." value={form.context} onChange={(e) => updateField("context", e.target.value)} rows={3} />
                <p className="text-xs text-muted-foreground">Ex : « Je suis actuellement en L2 Économie au Maroc et j'ai postulé via Études en France pour une L3 à Lyon 2... »</p>
              </div>
              <div className="space-y-1">
                <Label>Résumé de ton projet académique</Label>
                <Textarea placeholder="Quel est ton parcours et ton objectif en France ?" value={form.academic_project} onChange={(e) => updateField("academic_project", e.target.value)} rows={3} />
                <p className="text-xs text-muted-foreground">Ex : « Je souhaite me spécialiser en finance d'entreprise et obtenir un Master en France pour travailler dans le conseil... »</p>
              </div>
              <div className="space-y-1">
                <Label>Pourquoi demander un réexamen ?</Label>
                <Textarea placeholder="Explique ce qui justifie ta demande de recours..." value={form.why_reconsider} onChange={(e) => updateField("why_reconsider", e.target.value)} rows={3} />
                <p className="text-xs text-muted-foreground">Ex : « Mon dossier ne reflétait pas mes dernières notes du semestre, qui montrent une nette progression... »</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1 gradient-premium text-primary-foreground" disabled={!form.why_reconsider}>
                  Suivant <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Éléments complémentaires</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Nouveaux éléments ou clarifications</Label>
                <Textarea placeholder="Y a-t-il de nouvelles informations à ajouter ?" value={form.new_elements} onChange={(e) => updateField("new_elements", e.target.value)} rows={3} />
                <p className="text-xs text-muted-foreground">Ex : « J'ai obtenu une certification B2 en français depuis ma candidature », « Mon relevé de notes du S2 n'était pas inclus »</p>
              </div>
              <div className="space-y-1">
                <Label>Notes supplémentaires (optionnel)</Label>
                <Textarea placeholder="Tout autre détail pertinent..." value={form.supporting_notes} onChange={(e) => updateField("supporting_notes", e.target.value)} rows={2} />
                <p className="text-xs text-muted-foreground">Ex : « J'ai une lettre de recommandation de mon professeur principal »</p>
              </div>
              <div className="space-y-2">
                <Label>Ton souhaité</Label>
                <Select value={form.tone} onValueChange={(v) => updateField("tone", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formel et respectueux</SelectItem>
                    <SelectItem value="determined">Déterminé mais courtois</SelectItem>
                    <SelectItem value="empathetic">Empathique et sincère</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Disclaimer />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                </Button>
                <Button onClick={handleGenerate} className="flex-1 gradient-premium text-primary-foreground" disabled={generating}>
                  {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {generating ? "Génération..." : "Générer la lettre"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PremiumLayout>
  );
}
