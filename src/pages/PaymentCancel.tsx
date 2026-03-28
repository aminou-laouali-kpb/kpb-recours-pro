import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PaymentCancel() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="py-10 space-y-4">
          <XCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-bold">Paiement annulé</h2>
          <p className="text-sm text-muted-foreground">Tu as annulé le processus de paiement. Tu peux réessayer quand tu veux.</p>
          <Button variant="outline" onClick={() => navigate("/")}>Retour à l'accueil</Button>
        </CardContent>
      </Card>
    </div>
  );
}
