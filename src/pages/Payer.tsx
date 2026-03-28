import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard, FileText, Shield, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Disclaimer } from "@/components/Disclaimer";

export default function Payer() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!email) {
      toast({ title: "Email requis", description: "Entre ton adresse email pour continuer.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("initiate-payment", {
        body: { email: email.trim(), full_name: fullName.trim() },
      });

      if (error || data?.error) {
        throw new Error(data?.error || "Erreur lors de l'initialisation du paiement");
      }

      if (data?.payment_url) {
        window.location.href = data.payment_url;
      } else {
        throw new Error("Aucune URL de paiement reçue");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      toast({ title: "Erreur", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12 md:py-20">
        <div className="mx-auto max-w-lg space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground">
              <Sparkles className="h-4 w-4" />
              Accès Premium
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold">
              Obtiens tes lettres de recours
            </h1>
            <p className="text-muted-foreground">
              Paiement sécurisé via Money Fusion (Mobile Money & cartes acceptés)
            </p>
          </div>

          {/* Pricing card */}
          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg">Pack Premium</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <span className="text-4xl font-extrabold text-primary">5 000</span>
                <span className="text-lg text-muted-foreground ml-1">FCFA</span>
              </div>

              <ul className="space-y-2 text-sm">
                {[
                  { icon: FileText, text: "Jusqu'à 3 lettres de recours personnalisées" },
                  { icon: Shield, text: "Ton formel et respectueux garanti" },
                  { icon: Sparkles, text: "Argumentaire adapté à ton dossier" },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-2">
                    <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>

              <div className="border-t pt-4 space-y-3">
                <div className="space-y-1">
                  <Label>Ton nom complet</Label>
                  <Input
                    placeholder="Ex: Fatima Diallo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Ton adresse email</Label>
                  <Input
                    type="email"
                    placeholder="Ex: fatima@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Tu recevras ton lien de connexion à cette adresse après le paiement.
                  </p>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={loading || !email}
                  className="w-full gradient-premium text-primary-foreground shadow-premium"
                  size="lg"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CreditCard className="h-4 w-4 mr-2" />
                  )}
                  {loading ? "Redirection..." : "Payer 5 000 FCFA"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Disclaimer />
        </div>
      </div>
    </div>
  );
}
