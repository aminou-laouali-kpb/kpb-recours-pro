import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, MessageCircle, UserPlus, TrendingUp } from "lucide-react";

export default function AdminAnalytics() {
  const { data: stats } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const [profilesRes, lettersRes, eventsRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("generated_letters").select("id", { count: "exact", head: true }),
        supabase.from("events").select("event_name, created_at").order("created_at", { ascending: false }),
      ]);

      const events = eventsRes.data ?? [];
      const whatsappClicks = events.filter((e) => e.event_name === "whatsapp_private_school_clicked").length;
      const signups = events.filter((e) => e.event_name === "signup_completed" || e.event_name === "profile_completed").length;
      const totalLeads = profilesRes.count ?? 0;
      const totalRecours = lettersRes.count ?? 0;
      const conversionRate = totalLeads > 0 ? Math.round((totalRecours / totalLeads) * 100) : 0;

      // Recent events (last 20)
      const recentEvents = events.slice(0, 20);

      return {
        totalLeads,
        totalRecours,
        whatsappClicks,
        signups,
        conversionRate,
        recentEvents,
      };
    },
  });

  const cards = [
    { icon: Users, label: "Total leads", value: stats?.totalLeads ?? 0, color: "text-primary" },
    { icon: FileText, label: "Recours générés", value: stats?.totalRecours ?? 0, color: "text-primary" },
    { icon: TrendingUp, label: "Taux conversion", value: `${stats?.conversionRate ?? 0}%`, color: "text-primary" },
    { icon: MessageCircle, label: "Clics WhatsApp", value: stats?.whatsappClicks ?? 0, color: "text-[#25D366]" },
    { icon: UserPlus, label: "Profils complétés", value: stats?.signups ?? 0, color: "text-primary" },
  ];

  const eventLabels: Record<string, string> = {
    signup_completed: "Inscription",
    profile_completed: "Profil complété",
    recours_started: "Recours commencé",
    recours_generated: "Recours généré",
    recours_copied: "Recours copié",
    recours_downloaded: "Recours téléchargé",
    whatsapp_private_school_clicked: "Clic WhatsApp",
    dashboard_viewed: "Dashboard vu",
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <h2 className="text-xl font-bold">Analytics</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {cards.map(({ icon: Icon, label, value, color }) => (
            <Card key={label}>
              <CardContent className="p-5 text-center space-y-2">
                <Icon className={`h-6 w-6 mx-auto ${color}`} />
                <p className="text-3xl font-extrabold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Derniers événements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(stats?.recentEvents ?? []).map((event: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-xs border-b border-border/50 pb-1.5 last:border-0">
                <span className="font-medium">{eventLabels[event.event_name] || event.event_name}</span>
                <span className="text-muted-foreground">{new Date(event.created_at).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            ))}
            {(stats?.recentEvents ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun événement</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
