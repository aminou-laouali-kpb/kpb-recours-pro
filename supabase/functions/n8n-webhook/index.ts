import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// TODO(n8n): Configure N8N_WEBHOOK_URL as a Supabase secret
// Run: supabase secrets set N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/xxx

/**
 * Sends payload to n8n with 1 retry on failure.
 * Never throws — fails silently to avoid blocking user flows.
 */
async function sendToN8n(url: string, payload: Record<string, unknown>): Promise<void> {
  const maxAttempts = 2;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[n8n] Sending event=${payload.event_type}, attempt=${attempt}`);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10_000), // 10s timeout
      });
      if (res.ok) {
        console.log(`[n8n] Success for event=${payload.event_type}`);
        return;
      }
      console.error(`[n8n] HTTP ${res.status} for event=${payload.event_type}, attempt=${attempt}`);
    } catch (err) {
      console.error(`[n8n] Error for event=${payload.event_type}, attempt=${attempt}:`, err);
    }
    // Wait 1s before retry
    if (attempt < maxAttempts) await new Promise((r) => setTimeout(r, 1000));
  }
  console.error(`[n8n] All attempts failed for event=${payload.event_type} — data is saved in DB`);
}

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

    // Track event in DB (always succeeds even if n8n fails)
    await supabaseAdmin.from("events").insert({
      user_id: user.id,
      event_name: event_type,
      metadata: metadata ?? {},
    });

    // TODO(n8n): Replace with your real n8n webhook URL
    const N8N_WEBHOOK_URL = Deno.env.get("N8N_WEBHOOK_URL");
    if (N8N_WEBHOOK_URL) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      const payload = {
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
      };

      // Fire and forget — don't block response
      sendToN8n(N8N_WEBHOOK_URL, payload);
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("n8n-webhook error:", err);
    return new Response(JSON.stringify({ error: "Erreur serveur" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
