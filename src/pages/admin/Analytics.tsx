import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Users, FileText, MessageCircle, UserPlus } from "lucide-react";

export default function AdminAnalytics() {
  const { data: stats } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const [profilesRes, lettersRes, eventsRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("generated_letters").select("id", { count: "exact", head: true }),
        supabase.from("events").select("event_name"),
      ]);

      const events = eventsRes.data ?? [];
      const whatsappClicks = events.filter((e) => e.event_name === "whatsapp_private_school_clicked").length;
      const signups = events.filter((e) => e.event_name === "signup_completed" || e.event_name === "profile_completed").length;

      return {
        totalLeads: profilesRes.count ?? 0,
        totalRecours: lettersRes.count ?? 0,
        whatsappClicks,
        signups,
      };
    },
  });

  const cards = [
    { icon: Users, label: "Total leads", value: stats?.totalLeads ?? 0, color: "text-primary" },
    { icon: FileText, label: "Recours générés", value: stats?.totalRecours ?? 0, color: "text-primary" },
    { icon: MessageCircle, label: "Clics WhatsApp", value: stats?.whatsappClicks ?? 0, color: "text-[#25D366]" },
    { icon: UserPlus, label: "Profils complétés", value: stats?.signups ?? 0, color: "text-primary" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-5">
        <h2 className="text-xl font-bold">Analytics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
      </div>
    </AdminLayout>
  );
}
