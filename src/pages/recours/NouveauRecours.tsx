import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowRight, ArrowLeft, Copy, Download, CheckCircle, Save } from "lucide-react";
import { useTrackEvent } from "@/hooks/useTrackEvent";
import { UpsellBlock } from "@/components/UpsellBlock";
import { Disclaimer } from "@/components/Disclaimer";

interface FormData {
  university_name: string;
  program_name: string;
  refusal_date: string;
  refusal_reason: string;
  context: string;
  academic_project: string;
  why_reconsider: string;
  new_elements: string;
  supporting_notes: string;
  tone: string;
}

const defaultForm: FormData = {
  university_name: "", program_name: "", refusal_date: "", refusal_reason: "",
  context: "", academic_project: "", why_reconsider: "", new_elements: "",
  supporting_notes: "", tone: "formal",
};

export default function NouveauRecours() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [generating, setGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const trackEvent = useTrackEvent();
  const queryClient = useQueryClient();

  useEffect(() => { trackEvent("recours_started"); }, []);

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-letter", {
        body: form,
      });
      if (error || data?.error) throw new Error(data?.error || "Erreur de génération");

      setGeneratedLetter(data.letter_text);
      trackEvent("recours_generated", { university: form.university_name });
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
    trackEvent("recours_copied");
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
    trackEvent("recours_downloaded");
  };

  // Step 4: Result
  if (step === 4 && generatedLetter) {
    return (
      <AppLayout>
        <div className="space-y-5 max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-[hsl(var(--success))]" />
            <h2 className="text-xl font-bold">Ton recours est prêt !</h2>
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
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="w-full">
            Retour au dashboard
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-5 max-w-2xl mx-auto">
        <div>
          <h2 className="text-xl font-bold">Nouveau recours gracieux</h2>
          <p className="text-sm text-muted-foreground mt-1">Étape {step}/3 — Gratuit</p>
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
                <Label>Nom de l'université / école *</Label>
                <Input placeholder="Ex: Université de Lyon 2" value={form.university_name} onChange={(e) => updateField("university_name", e.target.value)} />
                <p className="text-xs text-muted-foreground">Ex : « Université Paris-Saclay », « INSA Lyon »</p>
              </div>
              <div className="space-y-1">
                <Label>Programme / formation *</Label>
                <Input placeholder="Ex: Licence 3 Économie" value={form.program_name} onChange={(e) => updateField("program_name", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Date du refus</Label>
                <Input type="date" value={form.refusal_date} onChange={(e) => updateField("refusal_date", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Motif de refus (si connu)</Label>
                <Input placeholder="Ex: Capacité d'accueil atteinte..." value={form.refusal_reason} onChange={(e) => updateField("refusal_reason", e.target.value)} />
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
              </div>
              <div className="space-y-1">
                <Label>Résumé de ton projet académique</Label>
                <Textarea placeholder="Quel est ton parcours et ton objectif en France ?" value={form.academic_project} onChange={(e) => updateField("academic_project", e.target.value)} rows={3} />
              </div>
              <div className="space-y-1">
                <Label>Pourquoi demander un réexamen ? *</Label>
                <Textarea placeholder="Explique ce qui justifie ta demande de recours..." value={form.why_reconsider} onChange={(e) => updateField("why_reconsider", e.target.value)} rows={3} />
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
              </div>
              <div className="space-y-1">
                <Label>Notes supplémentaires (optionnel)</Label>
                <Textarea placeholder="Tout autre détail pertinent..." value={form.supporting_notes} onChange={(e) => updateField("supporting_notes", e.target.value)} rows={2} />
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
                  {generating ? "Génération en cours..." : "Générer mon recours"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
