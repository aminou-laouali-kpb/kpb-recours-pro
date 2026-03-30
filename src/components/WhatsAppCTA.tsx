import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { WHATSAPP_CTA_URL } from "@/lib/constants";
import { useTrackEvent } from "@/hooks/useTrackEvent";

export function WhatsAppCTA({ className = "" }: { className?: string }) {
  const trackEvent = useTrackEvent();

  const handleClick = () => {
    trackEvent("whatsapp_private_school_clicked");
    window.open(WHATSAPP_CTA_URL, "_blank");
  };

  return (
    <Button
      onClick={handleClick}
      className={`bg-[#25D366] hover:bg-[#1da851] text-white w-full h-12 text-base font-semibold ${className}`}
    >
      <MessageCircle className="mr-2 h-5 w-5" />
      Contacter notre équipe sur WhatsApp
    </Button>
  );
}
