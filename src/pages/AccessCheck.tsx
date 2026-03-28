import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Loader2, CheckCircle, Clock, XCircle } from "lucide-react";
import { useTrackEvent } from "@/hooks/useTrackEvent";

export default function AccessCheck() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: access, isLoading } = usePremiumAccess();
  const trackEvent = useTrackEvent();

  useEffect(() => {
    trackEvent("premium_app_page_view", { page: "access-check" });
  }, []);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-10 space-y-4">
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-bold">Non connecté</h2>
            <p className="text-sm text-muted-foreground">Connecte-toi pour accéder à ton espace premium.</p>
            <Button asChild className="gradient-premium text-primary-foreground">
              <Link to="/connexion">Se connecter</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (access) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-10 space-y-4">
            <CheckCircle className="h-12 w-12 text-success mx-auto" />
            <h2 className="text-xl font-bold">Accès premium actif !</h2>
            <p className="text-sm text-muted-foreground">
              Tu as {access.max_letters - access.used_letters} lettre(s) restante(s).
            </p>
            <Button asChild className="gradient-premium text-primary-foreground">
              <Link to="/premium/dashboard">Accéder au dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="py-10 space-y-4">
          <Clock className="h-12 w-12 text-warning mx-auto" />
          <h2 className="text-xl font-bold">Aucun accès premium trouvé</h2>
          <p className="text-sm text-muted-foreground">
            Ton paiement est peut-être encore en cours de vérification, ou tu n'as pas encore acheté le service.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild variant="outline">
              <Link to="/activation">J'ai un code d'activation</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/">Retour à l'accueil</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
