import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { WHATSAPP_CTA_URL } from "@/lib/constants";
import { useTrackEvent } from "@/hooks/useTrackEvent";

interface WhatsAppCTAProps {
  className?: string;
  prominent?: boolean;
}

export function WhatsAppCTA({ className = "", prominent = false }: WhatsAppCTAProps) {
  const trackEvent = useTrackEvent();

  const handleClick = () => {
    trackEvent("whatsapp_private_school_clicked");
    window.open(WHATSAPP_CTA_URL, "_blank");
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <Button
        onClick={handleClick}
        className={`bg-[#25D366] hover:bg-[#1da851] text-white w-full font-semibold shadow-md ${
          prominent ? "h-14 text-base animate-pulse-subtle" : "h-12 text-base"
        }`}
      >
        <MessageCircle className={`mr-2 ${prominent ? "h-6 w-6" : "h-5 w-5"}`} />
        Contacter notre équipe sur WhatsApp
      </Button>
      {prominent && (
        <p className="text-xs text-center text-muted-foreground">📱 Réponse rapide garantie</p>
      )}
    </div>
  );
}
