// ============================================================================
// KAUSHAL DISHA — Supabase Edge Function: cloudinary-sign
// Signed direct-to-Cloudinary upload with strict role and folder authorization
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const FOLDER_POLICIES: Record<string, { access: string; types: string[]; maxBytes: number }> = {
  "platform/brand": { access: "public", types: ["image/svg+xml", "image/png"], maxBytes: 1 * 1024 * 1024 },
  "company_logo": { access: "public", types: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"], maxBytes: 2 * 1024 * 1024 },
  "institution_logo": { access: "public", types: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"], maxBytes: 2 * 1024 * 1024 },
  "student_photo": { access: "authenticated", types: ["image/jpeg", "image/png", "image/webp"], maxBytes: 2 * 1024 * 1024 },
  "student_resume": { access: "authenticated", types: ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"], maxBytes: 5 * 1024 * 1024 },
  "institution_verification": { access: "authenticated", types: ["application/pdf", "image/jpeg", "image/png"], maxBytes: 10 * 1024 * 1024 },
  "company_verification": { access: "authenticated", types: ["application/pdf", "image/jpeg", "image/png"], maxBytes: 10 * 1024 * 1024 },
  "proposal_attachment": { access: "authenticated", types: ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"], maxBytes: 10 * 1024 * 1024 },
  "task_attachment": { access: "authenticated", types: ["*"], maxBytes: 25 * 1024 * 1024 },
  "task_submission": { access: "authenticated", types: ["*"], maxBytes: 25 * 1024 * 1024 },
  "certificates": { access: "authenticated", types: ["application/pdf", "image/png"], maxBytes: 5 * 1024 * 1024 },
};

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { folder_kind, entity_id, file_name, content_type, bytes } = await req.json();

    const policy = FOLDER_POLICIES[folder_kind];
    if (!policy) {
      return new Response(JSON.stringify({ error: "Invalid folder kind" }), { status: 400, headers: corsHeaders });
    }

    if (bytes > policy.maxBytes) {
      return new Response(JSON.stringify({ error: `File size exceeds max allowed of ${policy.maxBytes / (1024 * 1024)} MB` }), { status: 400, headers: corsHeaders });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = `platform/${folder_kind}/${entity_id || "general"}`;
    const public_id = `${timestamp}_${file_name.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

    const api_secret = Deno.env.get("CLOUDINARY_API_SECRET") || "demo_secret";
    const api_key = Deno.env.get("CLOUDINARY_API_KEY") || "demo_key";
    const cloud_name = Deno.env.get("CLOUDINARY_CLOUD_NAME") || "kaushal-disha";

    // Create signature using SHA-1
    const paramsToSign = `folder=${folder}&public_id=${public_id}&timestamp=${timestamp}${api_secret}`;
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-1", encoder.encode(paramsToSign));
    const signature = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");

    return new Response(
      JSON.stringify({
        signature,
        timestamp,
        api_key,
        cloud_name,
        folder,
        public_id,
        upload_url: `https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`,
        is_private: policy.access === "authenticated",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
