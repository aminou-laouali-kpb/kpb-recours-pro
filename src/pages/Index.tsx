import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, FileText, Sparkles, ArrowRight, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Disclaimer } from "@/components/Disclaimer";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-premium opacity-5" />
        <div className="container relative py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground">
              <Sparkles className="h-4 w-4" />
              Service Premium
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Ton <span className="text-gradient-premium">recours gracieux</span>,
              <br />rédigé avec soin
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              KPB Recours Premium génère jusqu'à 3 lettres de recours personnalisées 
              pour tes candidatures refusées sur Études en France.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              {user ? (
                <Button asChild size="lg" className="gradient-premium text-primary-foreground shadow-premium">
                  <Link to="/premium/dashboard">
                    Accéder à mon espace
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="gradient-premium text-primary-foreground shadow-premium">
                    <Link to="/payer">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Obtenir l'accès — 5 000 FCFA
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/connexion">
                      Se connecter
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="lg">
                    <Link to="/activation">J'ai un code d'activation</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-12 md:py-16">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: FileText, title: "Jusqu'à 3 lettres", desc: "Génère des lettres personnalisées pour chaque université qui t'a refusé." },
            { icon: Shield, title: "Ton formel & respectueux", desc: "Chaque lettre respecte le ton académique attendu par les établissements français." },
            { icon: Sparkles, title: "Personnalisé à ton dossier", desc: "Tes informations sont utilisées pour créer un argumentaire unique et pertinent." },
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="border-border/50">
              <CardContent className="p-5 space-y-3">
                <div className="rounded-lg bg-primary/10 p-2.5 w-fit">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="container pb-16">
        <div className="max-w-2xl mx-auto">
          <Disclaimer />
        </div>
      </section>
    </div>
  );
};

export default Index;
