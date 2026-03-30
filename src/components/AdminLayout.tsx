import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Users, FileText, BarChart3, LogOut, LayoutDashboard } from "lucide-react";

const adminNav = [
  { to: "/admin/leads", icon: Users, label: "Leads" },
  { to: "/admin/recours", icon: FileText, label: "Recours" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold">
              <span className="text-gradient-premium">KPB</span> Admin
            </h1>
            <nav className="hidden md:flex items-center gap-1">
              {adminNav.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-md transition-colors",
                    pathname === to ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <LayoutDashboard className="h-3 w-3" /> App
            </Link>
            <button onClick={signOut} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <LogOut className="h-3 w-3" /> Déconnexion
            </button>
          </div>
        </div>
      </header>
      <div className="md:hidden border-b border-border bg-card">
        <div className="container flex gap-1 py-2 overflow-x-auto">
          {adminNav.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md whitespace-nowrap",
                pathname === to ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />{label}
            </Link>
          ))}
        </div>
      </div>
      <main className="container py-6">{children}</main>
    </div>
  );
}
