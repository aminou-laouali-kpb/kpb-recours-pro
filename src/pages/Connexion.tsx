import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Info } from "lucide-react";

export default function Connexion() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin + "/dashboard" },
      });
      if (error) {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Connecté !", description: "Bienvenue sur ton espace." });
        navigate("/dashboard");
      }
    } catch (err: any) {
      const isNetwork = err?.message?.includes("Failed to fetch") || err?.name === "TypeError";
      toast({
        title: isNetwork ? "Erreur réseau" : "Erreur",
        description: isNetwork
          ? "Impossible de contacter le serveur. Vérifie ta connexion internet."
          : (err?.message || "Une erreur inattendue est survenue"),
        variant: "destructive",
      });
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
          <CardDescription>Connecte-toi avec ton email pour accéder à ton espace</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input id="email" type="email" placeholder="ton.email@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            {/* Reassurance message */}
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5">
              <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Assure-toi que ton email soit correct. Tu recevras ta lettre de recours gratuite par ce moyen.
              </p>
            </div>

            <Button type="submit" className="w-full gradient-premium text-primary-foreground" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Me connecter
            </Button>
            <div className="text-center">
              <Link to="/inscription" className="text-sm text-primary hover:underline">
                Créer un compte
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
