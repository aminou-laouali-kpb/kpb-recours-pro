import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { useTrackEvent } from "@/hooks/useTrackEvent";

type Status = "loading" | "success" | "pending" | "failed";

export default function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<Status>("loading");
  const navigate = useNavigate();
  const trackEvent = useTrackEvent();

  useEffect(() => {
    trackEvent("payment_return_viewed");
    checkPayment();
  }, []);

  async function checkPayment() {
    const reference = searchParams.get("reference") || searchParams.get("ref") || searchParams.get("order_id");
    if (!reference) {
      setStatus("failed");
      return;
    }

    // TODO: Call backend to verify payment with Money Fusion / Maketu
    const { data: order } = await supabase
      .from("orders")
      .select("status")
      .eq("reference", reference)
      .maybeSingle();

    if (order?.status === "paid") {
      setStatus("success");
      trackEvent("payment_verified", { reference });
    } else if (order?.status === "pending") {
      setStatus("pending");
    } else {
      setStatus("failed");
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="py-10 space-y-4">
          {status === "loading" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <h2 className="text-xl font-bold">Vérification en cours...</h2>
              <p className="text-sm text-muted-foreground">Nous vérifions ton paiement.</p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle className="h-12 w-12 text-success mx-auto" />
              <h2 className="text-xl font-bold">Paiement confirmé !</h2>
              <p className="text-sm text-muted-foreground">Ton accès premium est maintenant actif.</p>
              <Button onClick={() => navigate("/premium/dashboard")} className="gradient-premium text-primary-foreground">
                Accéder à mon espace
              </Button>
            </>
          )}
          {status === "pending" && (
            <>
              <Clock className="h-12 w-12 text-warning mx-auto" />
              <h2 className="text-xl font-bold">Paiement en cours de vérification</h2>
              <p className="text-sm text-muted-foreground">
                Ton paiement est en cours de traitement. Tu recevras un email de confirmation dès que c'est validé.
              </p>
              <Button variant="outline" onClick={() => navigate("/")}>Retour à l'accueil</Button>
            </>
          )}
          {status === "failed" && (
            <>
              <XCircle className="h-12 w-12 text-destructive mx-auto" />
              <h2 className="text-xl font-bold">Paiement non trouvé</h2>
              <p className="text-sm text-muted-foreground">
                Nous n'avons pas pu vérifier ton paiement. Si tu as payé, contacte notre support.
              </p>
              <Button variant="outline" onClick={() => navigate("/")}>Retour à l'accueil</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
