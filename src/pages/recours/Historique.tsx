import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, FileText } from "lucide-react";
import { useState } from "react";
import { Disclaimer } from "@/components/Disclaimer";
import { useTrackEvent } from "@/hooks/useTrackEvent";

export default function Historique() {
  const { user } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const trackEvent = useTrackEvent();

  const { data: letters = [] } = useQuery({
    queryKey: ["letters", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("generated_letters")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    trackEvent("recours_copied");
  };

  const handleDownload = (text: string, university: string) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recours_${university.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    trackEvent("recours_downloaded");
  };

  return (
    <AppLayout>
      <div className="space-y-5 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold">Historique des recours</h2>

        {letters.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center space-y-2">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Aucun recours généré pour l'instant.</p>
            </CardContent>
          </Card>
        ) : (
          letters.map((letter) => (
            <Card key={letter.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{letter.university_name}</p>
                    <p className="text-xs text-muted-foreground">{letter.program_name}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(letter.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setExpandedId(expandedId === letter.id ? null : letter.id)}>
                  {expandedId === letter.id ? "Réduire" : "Voir la lettre"}
                </Button>
                {expandedId === letter.id && (
                  <div className="space-y-3">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans bg-muted/50 p-4 rounded-lg">
                      {letter.letter_text}
                    </pre>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleCopy(letter.letter_text)}>
                        <Copy className="mr-1 h-3 w-3" /> Copier
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDownload(letter.letter_text, letter.university_name)}>
                        <Download className="mr-1 h-3 w-3" /> Télécharger
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
        <Disclaimer />
      </div>
    </AppLayout>
  );
}
