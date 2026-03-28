import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, Loader2, CheckCircle } from "lucide-react";
import { useTrackEvent } from "@/hooks/useTrackEvent";

export default function Activation() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const trackEvent = useTrackEvent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !code.trim()) return;
    setLoading(true);
    trackEvent("activation_started", { email });

    try {
      const { data, error } = await supabase.functions.invoke("activate-code", {
        body: { email: email.trim(), code: code.trim() },
      });

      if (error || data?.error) {
        toast({ title: "Erreur", description: data?.error || "Code invalide ou expiré", variant: "destructive" });
        return;
      }

      setSuccess(true);
      trackEvent("activation_completed", { email });
      toast({ title: "Activé !", description: "Ton accès premium est maintenant actif." });

      await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin + "/premium/dashboard" },
      });
    } catch (err: any) {
      const isNetwork = err?.message?.includes("Failed to fetch") || err?.name === "TypeError";
      toast({
        title: isNetwork ? "Erreur réseau" : "Erreur",
        description: isNetwork
          ? "Impossible de contacter le serveur. Essaie depuis l'URL publiée de l'application ou vérifie ta connexion internet."
          : (err?.message || "Une erreur inattendue est survenue"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-10 space-y-4">
            <CheckCircle className="h-12 w-12 text-success mx-auto" />
            <h2 className="text-xl font-bold">Accès activé avec succès !</h2>
            <p className="text-sm text-muted-foreground">
              Vérifie ta boîte mail pour te connecter à ton espace premium.
            </p>
            <Button onClick={() => navigate("/connexion")} className="gradient-premium text-primary-foreground">
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto rounded-full bg-accent p-3 w-fit mb-2">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Activer mon accès</CardTitle>
          <CardDescription>Entre ton email et le code d'activation reçu</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="ton.email@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Code d'activation</Label>
              <Input id="code" placeholder="KPB-XXXX-XXXX" value={code} onChange={(e) => setCode(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full gradient-premium text-primary-foreground" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Activer mon accès
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Retour
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
