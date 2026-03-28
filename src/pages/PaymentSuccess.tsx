import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="py-10 space-y-4">
          <CheckCircle className="h-12 w-12 text-success mx-auto" />
          <h2 className="text-xl font-bold">Paiement réussi !</h2>
          <p className="text-sm text-muted-foreground">
            Ton accès premium est en cours d'activation. Tu recevras un email très bientôt.
          </p>
          <Button onClick={() => navigate("/premium/dashboard")} className="gradient-premium text-primary-foreground">
            Accéder à mon espace
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
