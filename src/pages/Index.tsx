import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, FileText, Sparkles, ArrowRight, Smartphone, CheckCircle, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Disclaimer } from "@/components/Disclaimer";
import { WhatsAppCTA } from "@/components/WhatsAppCTA";

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
              <Zap className="h-4 w-4" />
              100% Gratuit
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Refus université Campus France ?{" "}
              <span className="text-gradient-premium">Rédige gratuitement ton recours gracieux</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Crée un modèle de recours gracieux propre, crédible et structuré à partir de ton dossier, puis découvre aussi comment sécuriser une admission en France via les écoles privées.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              {user ? (
                <Button asChild size="lg" className="gradient-premium text-primary-foreground shadow-premium">
                  <Link to="/dashboard">
                    Accéder à mon espace
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="gradient-premium text-primary-foreground shadow-premium">
                    <Link to="/inscription">
                      Commencer gratuitement
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/connexion">
                      Se connecter
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust blocks */}
      <section className="container py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: CheckCircle, label: "Gratuit" },
            { icon: Zap, label: "Rapide" },
            { icon: Shield, label: "Pensé pour les étudiants francophones" },
            { icon: Smartphone, label: "Compatible mobile" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 rounded-lg bg-accent/50 px-3 py-3 text-sm">
              <Icon className="h-4 w-4 text-primary shrink-0" />
              <span className="text-foreground font-medium text-xs md:text-sm">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container py-12 md:py-16">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: FileText, title: "Lettre personnalisée", desc: "Génère une lettre de recours adaptée à ton dossier et à chaque université." },
            { icon: Shield, title: "Ton formel & respectueux", desc: "Chaque lettre respecte le ton académique attendu par les établissements français." },
            { icon: Sparkles, title: "Sans promesse trompeuse", desc: "Un outil honnête pour t'aider dans ta démarche, sans garantir de résultat." },
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

      {/* Disclaimer + WhatsApp */}
      <section className="container pb-16 space-y-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Disclaimer />
          <Card className="border-primary/20 bg-accent/50">
            <CardContent className="p-5 space-y-4 text-center">
              <h3 className="font-semibold">Tu veux aussi sécuriser une admission en école privée en France ?</h3>
              <p className="text-sm text-muted-foreground">
                Notre équipe peut t'aider à trouver une solution concrète pour la rentrée de Septembre 2026.
              </p>
              <WhatsAppCTA />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
