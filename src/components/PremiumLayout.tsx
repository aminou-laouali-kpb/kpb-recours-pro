import { MobileNav } from "./MobileNav";

export function PremiumLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="container flex h-14 items-center">
          <h1 className="text-lg font-bold">
            <span className="text-gradient-premium">KPB</span>{" "}
            <span className="text-foreground">Recours Premium</span>
          </h1>
        </div>
      </header>
      <main className="container py-6 animate-fade-in">{children}</main>
      <MobileNav />
    </div>
  );
}
