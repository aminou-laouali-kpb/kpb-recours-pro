import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, FileText, Sparkles, ArrowRight, Smartphone, CheckCircle, Zap, Heart, UserPlus, PenLine, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Disclaimer } from "@/components/Disclaimer";
import { WhatsAppCTA } from "@/components/WhatsAppCTA";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Empathy block */}
      <section className="bg-accent/60 border-b border-border">
        <div className="container py-6 text-center">
          <div className="inline-flex items-center gap-2 text-primary mb-2">
            <Heart className="h-5 w-5" />
          </div>
          <p className="text-sm md:text-base text-foreground font-medium max-w-lg mx-auto leading-relaxed">
            On sait que recevoir un refus est difficile et stressant. Tu n'es pas seul(e) dans cette situation — et tu mérites une deuxième chance.
          </p>
        </div>
      </section>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-premium opacity-5" />
        <div className="container relative py-14 md:py-20">
          <div className="mx-auto max-w-2xl text-center space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground">
              <Zap className="h-4 w-4" />
              100% Gratuit — Aucun paiement requis
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Refus université Campus France ?{" "}
              <span className="text-gradient-premium">Rédige gratuitement ton recours gracieux</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Génère un modèle de recours gracieux clair, crédible et structuré à partir de ton dossier — en 3 minutes. Découvre aussi comment sécuriser une admission en France via les écoles privées.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              {user ? (
                <Button asChild size="lg" className="gradient-premium text-primary-foreground shadow-premium h-14 text-base">
                  <Link to="/dashboard">
                    Accéder à mon espace
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="gradient-premium text-primary-foreground shadow-premium h-14 text-base">
                    <Link to="/inscription">
                      Commencer gratuitement
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-14 text-base">
                    <Link to="/connexion">
                      Se connecter
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust blocks */}
      <section className="container py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: CheckCircle, label: "Gratuit" },
            { icon: Zap, label: "Prêt en 3 minutes" },
            { icon: Shield, label: "Pensé pour les étudiants francophones" },
            { icon: Smartphone, label: "Optimisé mobile" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 rounded-lg bg-accent/50 px-3 py-3 text-sm">
              <Icon className="h-4 w-4 text-primary shrink-0" />
              <span className="text-foreground font-medium text-xs md:text-sm">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container py-10 md:py-14">
        <h2 className="text-xl md:text-2xl font-bold text-center mb-8">Comment ça marche ?</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { step: "1", icon: UserPlus, title: "Inscris-toi gratuitement", desc: "Crée ton compte en 30 secondes avec ton email." },
            { step: "2", icon: PenLine, title: "Remplis ton dossier", desc: "Indique l'université, le programme et les raisons de ta demande de réexamen." },
            { step: "3", icon: Download, title: "Reçois ta lettre", desc: "Obtiens un recours gracieux structuré, prêt à envoyer. Copie-le ou télécharge-le." },
          ].map(({ step, icon: Icon, title, desc }) => (
            <Card key={step} className="border-border/50 relative overflow-hidden">
              <div className="absolute top-3 left-4 text-4xl font-black text-primary/10">{step}</div>
              <CardContent className="p-5 pt-8 space-y-3">
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

      {/* Features */}
      <section className="container py-10 md:py-14">
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

      {/* Social proof */}
      <section className="container py-6">
        <div className="rounded-xl bg-accent/50 border border-border p-5 text-center">
          <p className="text-sm font-medium text-foreground">
            🎓 Des centaines d'étudiants utilisent déjà KPB Recours Gratuit pour défendre leur candidature.
          </p>
        </div>
      </section>

      {/* Disclaimer + WhatsApp */}
      <section className="container pb-16 space-y-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Disclaimer />
          <Card className="border-[#25D366]/30 bg-[#25D366]/5">
            <CardContent className="p-5 space-y-4 text-center">
              <h3 className="font-semibold text-base">Tu veux aussi sécuriser une admission en école privée en France ?</h3>
              <p className="text-sm text-muted-foreground">
                La rentrée de septembre 2026 approche. Notre équipe en France peut t'aider à trouver une solution concrète dès maintenant.
              </p>
              <WhatsAppCTA prominent />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
