import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { event_type, metadata } = await req.json();
    if (!event_type || typeof event_type !== "string") {
      return new Response(JSON.stringify({ error: "event_type requis" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Track event in DB
    await supabaseAdmin.from("events").insert({
      user_id: user.id,
      event_name: event_type,
      metadata: metadata ?? {},
    });

    // Send to n8n
    const N8N_WEBHOOK_URL = Deno.env.get("N8N_WEBHOOK_URL");
    if (N8N_WEBHOOK_URL) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      try {
        await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event_type,
            user_id: user.id,
            full_name: profile?.full_name,
            email: profile?.email || user.email,
            whatsapp_number: profile?.whatsapp_number,
            country: profile?.country,
            nationality: profile?.nationality,
            current_academic_level: profile?.current_academic_level,
            target_level_in_france: profile?.target_level_in_france,
            field_of_study: profile?.field_of_study,
            ...((metadata as Record<string, unknown>) ?? {}),
            created_at: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.error("n8n webhook error:", err);
        // Fail silently — data is saved in DB
      }
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("n8n-webhook error:", err);
    return new Response(JSON.stringify({ error: "Erreur serveur" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
