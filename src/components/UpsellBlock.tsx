import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { WhatsAppCTA } from "./WhatsAppCTA";

export function UpsellBlock() {
  return (
    <Card className="border-primary/20 bg-accent/50">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-foreground">
              Et si tu sécurisais ton admission en France dès maintenant avec les écoles privées ?
            </h3>
            <p className="text-sm text-muted-foreground">
              Pendant que tu avances sur ton recours, notre équipe peut aussi t'aider à trouver rapidement une solution concrète pour étudier en France à la rentrée de Septembre 2026.
            </p>
          </div>
        </div>
        <WhatsAppCTA />
      </CardContent>
    </Card>
  );
}
