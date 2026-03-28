import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PremiumLayout } from "@/components/PremiumLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UpsellBlock } from "@/components/UpsellBlock";
import { Link } from "react-router-dom";
import { PenLine, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useTrackEvent } from "@/hooks/useTrackEvent";

export default function PremiumDashboard() {
  const { user } = useAuth();
  const { data: access } = usePremiumAccess();
  const trackEvent = useTrackEvent();

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

  useEffect(() => {
    trackEvent("premium_dashboard_viewed");
  }, []);

  const remaining = access ? access.max_letters - access.used_letters : 0;
  const quotaExhausted = remaining <= 0;

  return (
    <PremiumLayout>
      <div className="space-y-5 max-w-2xl mx-auto">
        {/* Welcome */}
        <div>
          <h2 className="text-2xl font-bold">
            Bonjour{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""} 👋
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Bienvenue dans ton espace premium</p>
        </div>

        {/* Access status */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <div>
                  <p className="font-semibold text-sm">Statut de ton accès</p>
                  <p className="text-xs text-muted-foreground">Premium actif</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-success/10 text-success border-0">Actif</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Remaining letters */}
        <Card className={quotaExhausted ? "border-destructive/30" : "border-primary/20"}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">Lettres restantes</p>
                <p className="text-3xl font-extrabold mt-1">
                  <span className={quotaExhausted ? "text-destructive" : "text-gradient-premium"}>{remaining}</span>
                  <span className="text-lg text-muted-foreground font-normal"> / {access?.max_letters ?? 3}</span>
                </p>
              </div>
              {quotaExhausted ? (
                <AlertCircle className="h-8 w-8 text-destructive" />
              ) : (
                <FileText className="h-8 w-8 text-primary" />
              )}
            </div>
            {quotaExhausted && (
              <p className="text-xs text-destructive mt-2">
                Tu as utilisé toutes tes lettres. Contacte le support si tu souhaites en obtenir davantage.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Dossier summary */}
        {assessment && (
          <Card>
            <CardContent className="p-5 space-y-2">
              <h3 className="font-semibold text-sm">Ton dossier</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {assessment.field_of_study && (
                  <div><span className="text-muted-foreground">Domaine :</span> {assessment.field_of_study}</div>
                )}
                {assessment.current_academic_level && (
                  <div><span className="text-muted-foreground">Niveau :</span> {assessment.current_academic_level}</div>
                )}
                {assessment.target_level_in_france && (
                  <div><span className="text-muted-foreground">Objectif :</span> {assessment.target_level_in_france}</div>
                )}
                {assessment.result_category && (
                  <div><span className="text-muted-foreground">Résultat :</span> {assessment.result_category}</div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        {!quotaExhausted && (
          <Button asChild className="w-full gradient-premium text-primary-foreground shadow-premium h-12 text-base">
            <Link to="/premium/nouvelle-lettre">
              <PenLine className="mr-2 h-5 w-5" />
              Créer une nouvelle lettre
            </Link>
          </Button>
        )}

        {/* Recent letters */}
        {letters.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Dernières lettres</h3>
              <Link to="/premium/historique" className="text-xs text-primary hover:underline">Voir tout</Link>
            </div>
            {letters.slice(0, 2).map((letter) => (
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
            <CardContent className="p-5 text-center text-sm text-muted-foreground">
              Aucune lettre générée pour l'instant. Commence par en créer une !
            </CardContent>
          </Card>
        )}

        {/* Upsell */}
        <UpsellBlock />
      </div>
    </PremiumLayout>
  );
}
