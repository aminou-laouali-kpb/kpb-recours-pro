import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UpsellBlock } from "@/components/UpsellBlock";
import { Link } from "react-router-dom";
import { PenLine, FileText, AlertCircle, User, Heart, Sparkles } from "lucide-react";
import { WhatsAppCTA } from "@/components/WhatsAppCTA";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: letters = [] } = useQuery({
    queryKey: ["letters", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("generated_letters")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    trackEvent("dashboard_viewed");
  }, []);

  const profileComplete = profile?.full_name && profile?.whatsapp_number && profile?.country;

  return (
    <AppLayout>
      <div className="space-y-5 max-w-2xl mx-auto">
        {/* Welcome */}
        <div>
          <h2 className="text-2xl font-bold">
            Bonjour{profile?.full_name ? `, ${profile.full_name}` : ""} 👋
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Bienvenue sur KPB Recours Gratuit</p>
        </div>

        {/* Emotional reassurance for new users */}
        {letters.length === 0 && (
          <Card className="border-primary/20 bg-accent/50">
            <CardContent className="p-4 flex items-start gap-3">
              <Heart className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Un refus ne veut pas dire la fin de ton projet.</p>
                <p className="text-xs text-muted-foreground mt-1">Des milliers d'étudiants obtiennent une réponse favorable après un recours bien rédigé. C'est le moment d'agir.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contextual message for returning users */}
        {letters.length > 0 && (
          <Card className="border-primary/20 bg-accent/50">
            <CardContent className="p-4 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Tu as déjà généré {letters.length} recours.</p>
                <p className="text-xs text-muted-foreground mt-1">Tu peux en créer d'autres pour d'autres universités, c'est toujours gratuit.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile completion */}
        {!profileComplete && (
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-warning shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Complète ton profil</p>
                <p className="text-xs text-muted-foreground">Ajoute ton numéro WhatsApp et ton pays pour un meilleur suivi.</p>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link to="/mon-profil"><User className="mr-1 h-3 w-3" /> Compléter</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <div className="space-y-1.5">
          <Button asChild className="w-full gradient-premium text-primary-foreground shadow-premium h-14 text-base">
            <Link to="/recours/nouveau">
              <PenLine className="mr-2 h-5 w-5" />
              Générer un recours gratuit
            </Link>
          </Button>
          <p className="text-xs text-center text-muted-foreground">100% gratuit · En 3 minutes · Aucun paiement requis</p>
        </div>

        {/* Recent letters */}
        {letters.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Derniers recours</h3>
              <Link to="/recours/historique" className="text-xs text-primary hover:underline">Voir tout</Link>
            </div>
            {letters.slice(0, 3).map((letter) => (
              <Card key={letter.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{letter.university_name}</p>
                      <p className="text-xs text-muted-foreground">{letter.program_name}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(letter.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {letters.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-5 text-center space-y-2">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Aucun recours généré pour l'instant.</p>
              <p className="text-xs text-muted-foreground">Commence dès maintenant — c'est rapide et gratuit !</p>
            </CardContent>
          </Card>
        )}

        {/* Upsell */}
        <UpsellBlock />

        {/* Direct WhatsApp CTA */}
        <WhatsAppCTA />
      </div>
    </AppLayout>
  );
}
