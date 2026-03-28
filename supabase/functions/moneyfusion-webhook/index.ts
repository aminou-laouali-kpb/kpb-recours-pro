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
    const payload = await req.json();
    console.log("Webhook payload:", JSON.stringify(payload));

    const { reference, status, transaction_id } = payload;

    if (!reference || !status) {
      return new Response(JSON.stringify({ error: "Missing reference or status" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find order by reference
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("reference", reference)
      .maybeSingle();

    if (orderErr || !order) {
      console.error("Order not found:", reference, orderErr);
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Already processed
    if (order.status === "paid") {
      return new Response(JSON.stringify({ message: "Already processed" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isPaid = status === "success" || status === "completed" || status === "paid";

    if (!isPaid) {
      // Update order with failed status
      await supabase
        .from("orders")
        .update({ status: "failed", payment_payload: payload })
        .eq("id", order.id);

      return new Response(JSON.stringify({ message: "Payment not successful" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Payment is successful — update order
    await supabase
      .from("orders")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        payment_payload: payload,
      })
      .eq("id", order.id);

    // Get customer email from order payload
    const customerEmail =
      order.payment_payload?.email ||
      payload.customer_email ||
      "";

    if (!customerEmail) {
      console.error("No customer email found for order:", order.id);
      return new Response(JSON.stringify({ error: "No customer email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find or create user account
    let userId = order.user_id;
    const isPlaceholder = userId === "00000000-0000-0000-0000-000000000000";

    if (isPlaceholder) {
      // Check if user exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(
        (u) => u.email === customerEmail
      );

      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Create user account
        const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
          email: customerEmail,
          email_confirm: true,
        });

        if (createErr || !newUser?.user) {
          console.error("Failed to create user:", createErr);
          return new Response(JSON.stringify({ error: "Failed to create user" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        userId = newUser.user.id;
      }

      // Update order with real user_id
      await supabase.from("orders").update({ user_id: userId }).eq("id", order.id);
    }

    // Create premium access
    const { error: premiumErr } = await supabase.from("premium_access").insert({
      user_id: userId,
      order_id: order.id,
      status: "active",
      max_letters: 3,
      used_letters: 0,
    });

    if (premiumErr) {
      console.error("Premium access creation error:", premiumErr);
    }

    // Send magic link to user
    const { error: magicLinkErr } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: customerEmail,
      options: {
        redirectTo: "https://kpb-recours-pro.lovable.app/premium/dashboard",
      },
    });

    if (magicLinkErr) {
      console.error("Magic link error:", magicLinkErr);
      // Non-blocking — the user can still log in manually
    }

    console.log(`Payment processed for ${customerEmail}, premium access created`);

    return new Response(
      JSON.stringify({ message: "Payment processed successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
