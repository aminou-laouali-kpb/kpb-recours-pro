import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, PenLine, History, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/premium/dashboard", icon: LayoutDashboard, label: "Accueil" },
  { to: "/premium/nouvelle-lettre", icon: PenLine, label: "Nouvelle" },
  { to: "/premium/historique", icon: History, label: "Historique" },
  { to: "/premium/mon-acces", icon: User, label: "Mon accès" },
];

export function MobileNav() {
  const { pathname } = useLocation();
  const { signOut } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs transition-colors",
              pathname === to ? "text-primary font-medium" : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </Link>
        ))}
        <button
          onClick={signOut}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs text-muted-foreground"
        >
          <LogOut className="h-5 w-5" />
          <span>Sortir</span>
        </button>
      </div>
    </nav>
  );
}
