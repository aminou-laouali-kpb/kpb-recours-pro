import { useAuth } from "@/contexts/AuthContext";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export function PremiumRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const { data: access, isLoading: accessLoading } = usePremiumAccess();

  if (authLoading || accessLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/connexion" replace />;
  if (!access) return <Navigate to="/access-check" replace />;

  return <>{children}</>;
}
