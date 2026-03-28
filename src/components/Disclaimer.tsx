import { AlertTriangle } from "lucide-react";

export function Disclaimer() {
  return (
    <div className="rounded-lg border border-border bg-muted/50 p-4 text-xs text-muted-foreground space-y-1">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground text-xs">Avertissements</span>
      </div>
      <p>• Cette lettre constitue une base personnalisée à adapter si nécessaire.</p>
      <p>• La décision finale appartient à l'établissement concerné.</p>
      <p>• KPB Education ne garantit pas l'acceptation d'un recours gracieux.</p>
      <p>• Ce service ne constitue pas un avis juridique.</p>
    </div>
  );
}
