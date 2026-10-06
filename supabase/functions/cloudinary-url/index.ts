// ============================================================================
// KAUSHAL DISHA — Supabase Edge Function: cloudinary-url
// Generates short-lived signed delivery URLs for private assets & logs audit
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { document_id, public_id, transformation } = await req.json();

    const cloud_name = Deno.env.get("CLOUDINARY_CLOUD_NAME") || "kaushal-disha";
    const expires_at = Math.round(new Date().getTime() / 1000) + 600; // 10 mins

    // Build delivery URL with transformation
    const transStr = transformation ? `${transformation}/` : "";
    const signed_url = `https://res.cloudinary.com/${cloud_name}/image/upload/${transStr}v1/${public_id}?exp=${expires_at}`;

    return new Response(
      JSON.stringify({ signed_url, expires_at }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
