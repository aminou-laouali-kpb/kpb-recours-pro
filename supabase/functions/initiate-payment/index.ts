import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, full_name } = await req.json();

    // Input validation
    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "Email requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim().toLowerCase())) {
      return new Response(JSON.stringify({ error: "Email invalide" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const MONEYFUSION_API_KEY = Deno.env.get("MONEYFUSION_API_KEY");
    const MONEYFUSION_SECRET_KEY = Deno.env.get("MONEYFUSION_SECRET_KEY");

    if (!MONEYFUSION_API_KEY || !MONEYFUSION_SECRET_KEY) {
      console.error("Money Fusion API keys not configured");
      return new Response(
        JSON.stringify({ error: "Configuration de paiement manquante" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const sanitizedEmail = email.trim().toLowerCase();
    const amount = 5000;
    const currency = "XOF";
    const reference = `KPB-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Find or note user
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userRecord = existingUser?.users?.find(
      (u) => u.email === sanitizedEmail
    );

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userRecord?.id || "00000000-0000-0000-0000-000000000000",
        amount,
        currency,
        provider: "moneyfusion",
        reference,
        status: "pending",
        payment_payload: { email: sanitizedEmail, full_name: full_name || "" },
      })
      .select("id")
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return new Response(
        JSON.stringify({ error: "Impossible de créer la commande" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the published app URL for redirect
    const returnUrl = `https://kpb-recours-pro.lovable.app/payments/moneyfusion/return?reference=${reference}`;
    const cancelUrl = `https://kpb-recours-pro.lovable.app/payments/moneyfusion/cancel`;

    // Call Money Fusion API to initiate payment
    const mfResponse = await fetch("https://api.moneyfusion.net/v2/payment/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MONEYFUSION_API_KEY}`,
        "X-Secret-Key": MONEYFUSION_SECRET_KEY,
      },
      body: JSON.stringify({
        amount,
        currency,
        reference,
        description: "KPB Recours Premium - 3 lettres de recours",
        customer_email: sanitizedEmail,
        customer_name: full_name || "",
        return_url: returnUrl,
        cancel_url: cancelUrl,
      }),
    });

    const mfData = await mfResponse.json();

    if (!mfResponse.ok || !mfData.payment_url) {
      console.error("Money Fusion error:", mfData);
      return new Response(
        JSON.stringify({
          error: "Erreur lors de l'initialisation du paiement",
          details: mfData,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        payment_url: mfData.payment_url,
        reference,
        order_id: order.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("initiate-payment error:", err);
    return new Response(
      JSON.stringify({ error: "Erreur serveur" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
