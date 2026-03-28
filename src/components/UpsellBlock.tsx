import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight } from "lucide-react";
import { useTrackEvent } from "@/hooks/useTrackEvent";

export function UpsellBlock() {
  const trackEvent = useTrackEvent();

  const handleClick = () => {
    trackEvent("private_school_upsell_clicked");
    window.open("https://wa.me/message/kpb-education", "_blank");
  };

  return (
    <Card className="border-primary/20 bg-accent/50">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-foreground">Ne mise pas tout sur le recours</h3>
            <p className="text-sm text-muted-foreground">
              Pendant que tu avances sur ton recours, KPB Education peut aussi t'aider à sécuriser une admission en école privée pour ne pas perdre une année.
            </p>
            <Button variant="outline" size="sm" onClick={handleClick} className="mt-2">
              Parler à KPB pour un plan B rapide
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
