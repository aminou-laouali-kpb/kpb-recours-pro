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

    const body = await req.json();
    const { university_name, program_name, refusal_reason, context, academic_project, why_reconsider, new_elements, supporting_notes, tone, refusal_date } = body;

    if (!university_name || !program_name) {
      return new Response(JSON.stringify({ error: "Champs requis manquants" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Input validation
    const maxLen = 1000;
    const shortMax = 200;
    if (typeof university_name !== "string" || university_name.length > shortMax ||
        typeof program_name !== "string" || program_name.length > shortMax) {
      return new Response(JSON.stringify({ error: "Nom trop long (max 200 caractères)" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const optionalFields = { refusal_reason, context, academic_project, why_reconsider, new_elements, supporting_notes, refusal_date };
    for (const [key, val] of Object.entries(optionalFields)) {
      if (val !== undefined && val !== null && (typeof val !== "string" || val.length > maxLen)) {
        return new Response(JSON.stringify({ error: `Champ ${key} trop long (max 1000 caractères)` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }
    const validTones = ["formal", "determined", "empathetic"];
    if (tone && !validTones.includes(tone)) {
      return new Response(JSON.stringify({ error: "Ton invalide" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Generate the letter using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Configuration IA manquante" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const toneMap: Record<string, string> = {
      formal: "formel, respectueux et académique",
      determined: "déterminé mais courtois, avec assurance",
      empathetic: "empathique, sincère et humble",
    };

    const systemPrompt = `Tu es un rédacteur expert en recours gracieux pour les étudiants francophones africains ayant été refusés sur la plateforme Études en France.

Tu dois rédiger une lettre de recours gracieux en français, avec un ton ${toneMap[tone] || toneMap.formal}.

Règles impératives :
- La lettre doit être en français correct et soutenu
- Le ton doit être humain, pas robotique
- Ne fais aucune promesse de résultat
- Ne donne pas de conseil juridique
- Reste factuel et respectueux
- Structure : salutation polie, contexte de la candidature/refus, clarification du projet académique, explication respectueuse de la demande de réexamen, arguments concis, clôture formelle
- La lettre doit faire entre 400 et 600 mots
- N'invente pas d'informations, utilise uniquement ce qui est fourni`;

    const userPrompt = `Rédige une lettre de recours gracieux avec les informations suivantes :

Université / École : ${university_name}
Programme : ${program_name}
${refusal_date ? `Date du refus : ${refusal_date}` : ""}
${refusal_reason ? `Motif de refus : ${refusal_reason}` : ""}
${context ? `Contexte : ${context}` : ""}
${academic_project ? `Projet académique : ${academic_project}` : ""}
Raison de la demande de réexamen : ${why_reconsider || "Non précisé"}
${new_elements ? `Nouveaux éléments : ${new_elements}` : ""}
${supporting_notes ? `Notes complémentaires : ${supporting_notes}` : ""}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, réessaye dans un instant." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Crédit IA épuisé." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      console.error("AI error:", aiResponse.status, await aiResponse.text());
      return new Response(JSON.stringify({ error: "Erreur de génération IA" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiData = await aiResponse.json();
    const letterText = aiData.choices?.[0]?.message?.content;

    if (!letterText) {
      return new Response(JSON.stringify({ error: "Aucune lettre générée" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Save the letter (premium_access_id is now nullable)
    const { error: insertError } = await supabaseAdmin.from("generated_letters").insert({
      user_id: user.id,
      premium_access_id: null,
      university_name,
      program_name,
      input_payload: body,
      letter_text: letterText,
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: "Erreur de sauvegarde" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Track event
    await supabaseAdmin.from("events").insert({
      user_id: user.id,
      event_name: "recours_generated",
      metadata: { university_name, program_name },
    });

    // Send webhook to n8n (fire and forget)
    const N8N_WEBHOOK_URL = Deno.env.get("N8N_WEBHOOK_URL");
    if (N8N_WEBHOOK_URL) {
      // Fetch user profile for lead data
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: "recours_generated",
          user_id: user.id,
          full_name: profile?.full_name,
          email: profile?.email || user.email,
          whatsapp_number: profile?.whatsapp_number,
          country: profile?.country,
          nationality: profile?.nationality,
          current_academic_level: profile?.current_academic_level,
          target_level_in_france: profile?.target_level_in_france,
          field_of_study: profile?.field_of_study,
          university_name,
          program_name,
          refusal_reason,
          generated_letter_text: letterText,
          created_at: new Date().toISOString(),
        }),
      }).catch((err) => console.error("n8n webhook error:", err));
    }

    return new Response(JSON.stringify({ letter_text: letterText }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("generate-letter error:", err);
    return new Response(JSON.stringify({ error: "Erreur serveur" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
