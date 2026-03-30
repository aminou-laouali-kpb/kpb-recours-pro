import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Clock } from "lucide-react";
import { WhatsAppCTA } from "./WhatsAppCTA";

export function UpsellBlock() {
  return (
    <Card className="border-[#25D366]/30 bg-[#25D366]/5">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-[#25D366]/15 p-2">
            <GraduationCap className="h-5 w-5 text-[#25D366]" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-foreground">
              Et si tu sécurisais ton admission en France dès maintenant ?
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>La rentrée de septembre 2026 approche…</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Pendant que tu avances sur ton recours, notre équipe en France peut t'aider à trouver rapidement une solution concrète pour étudier en France via les écoles privées.
            </p>
          </div>
        </div>
        <WhatsAppCTA prominent />
      </CardContent>
    </Card>
  );
}
