import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, CheckCircle, Clock } from "lucide-react";
import { WhatsAppCTA } from "./WhatsAppCTA";

export function UpsellBlock() {
  return (
    <Card className="border-[#25D366]/40 bg-gradient-to-br from-[#25D366]/5 to-[#25D366]/15 shadow-md">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-[#25D366]/20 p-2.5">
            <GraduationCap className="h-6 w-6 text-[#25D366]" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="font-bold text-foreground text-base">
              Tu as un plan A. Et si tu préparais aussi un plan B ?
            </h3>
            <p className="text-sm text-muted-foreground">
              Chaque année, des centaines d'étudiants obtiennent leur visa grâce aux écoles privées en France.
            </p>
          </div>
        </div>

        {/* Value points */}
        <div className="space-y-2.5 pl-1">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="h-4 w-4 text-[#25D366] shrink-0" />
            <span className="text-sm text-foreground">Admissions ouvertes jusqu'en juillet</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle className="h-4 w-4 text-[#25D366] shrink-0" />
            <span className="text-sm text-foreground">Accompagnement personnalisé par KPB Education</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle className="h-4 w-4 text-[#25D366] shrink-0" />
            <span className="text-sm text-foreground">Visa étudiant garanti si admis</span>
          </div>
        </div>

        {/* Urgency */}
        <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
          <Clock className="h-3.5 w-3.5" />
          <span>La rentrée de septembre 2026 approche… Ne perds pas de temps.</span>
        </div>

        {/* CTA */}
        <WhatsAppCTA prominent />
      </CardContent>
    </Card>
  );
}
