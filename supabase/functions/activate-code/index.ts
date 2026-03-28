import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const code = typeof body.code === "string" ? body.code.trim() : "";

    if (!email || !code) {
      return new Response(JSON.stringify({ error: "Email et code requis" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 255) {
      return new Response(JSON.stringify({ error: "Email invalide" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Validate code format (max 50 chars, alphanumeric + dashes)
    if (code.length > 50 || !/^[A-Za-z0-9\-]+$/.test(code)) {
      return new Response(JSON.stringify({ error: "Format de code invalide" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find the activation code
    const { data: activationCode, error: codeError } = await supabaseAdmin
      .from("activation_codes")
      .select("*")
      .eq("code", code.trim())
      .eq("status", "unused")
      .maybeSingle();

    if (codeError || !activationCode) {
      return new Response(JSON.stringify({ error: "Code invalide ou déjà utilisé" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Check expiration
    if (activationCode.expires_at && new Date(activationCode.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "Ce code a expiré" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Find or create user
    let userId: string;
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.email === email.toLowerCase().trim());

    if (existingUser) {
      userId = existingUser.id;
    } else {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase().trim(),
        email_confirm: true,
      });
      if (createError || !newUser.user) {
        return new Response(JSON.stringify({ error: "Erreur lors de la création du compte" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      userId = newUser.user.id;
    }

    // Mark code as used
    await supabaseAdmin
      .from("activation_codes")
      .update({ status: "used", user_id: userId, activated_at: new Date().toISOString() })
      .eq("id", activationCode.id);

    // Create premium access
    await supabaseAdmin.from("premium_access").insert({
      user_id: userId,
      order_id: activationCode.order_id,
      status: "active",
      max_letters: 3,
      used_letters: 0,
    });

    // Track event
    await supabaseAdmin.from("events").insert({
      user_id: userId,
      event_name: "activation_completed",
      metadata: { code: activationCode.code },
    });

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("activate-code error:", err);
    return new Response(JSON.stringify({ error: "Erreur serveur" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
