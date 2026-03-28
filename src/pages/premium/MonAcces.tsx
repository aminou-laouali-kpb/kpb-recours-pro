import { useAuth } from "@/contexts/AuthContext";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { PremiumLayout } from "@/components/PremiumLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, FileText, Calendar, CreditCard } from "lucide-react";

export default function MonAcces() {
  const { user } = useAuth();
  const { data: access } = usePremiumAccess();

  const remaining = access ? access.max_letters - access.used_letters : 0;

  return (
    <PremiumLayout>
      <div className="space-y-5 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold">Mon accès premium</h2>

        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-success" />
              <div className="flex-1">
                <p className="font-semibold text-sm">Statut</p>
                <p className="text-xs text-muted-foreground capitalize">{access?.status ?? "Inconnu"}</p>
              </div>
              <Badge variant="secondary" className="bg-success/10 text-success border-0 capitalize">
                {access?.status ?? "—"}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold text-sm">Lettres</p>
                <p className="text-xs text-muted-foreground">
                  {access?.used_letters ?? 0} utilisée(s) / {access?.max_letters ?? 3} — {remaining} restante(s)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-semibold text-sm">Activé le</p>
                <p className="text-xs text-muted-foreground">
                  {access?.created_at ? new Date(access.created_at).toLocaleDateString("fr-FR") : "—"}
                </p>
              </div>
            </div>

            {access?.expires_at && (
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold text-sm">Expire le</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(access.expires_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-5">
            <p className="font-semibold text-sm">Email du compte</p>
            <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
          </CardContent>
        </Card>
      </div>
    </PremiumLayout>
  );
}
