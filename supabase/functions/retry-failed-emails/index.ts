// ============================================================================
// AP VIDYACONNECT — SUPABASE EDGE FUNCTION: RETRY FAILED EMAILS
// Re-attempt delivery of failed activation notices via Resend
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RetryRequest {
  batchId?: string;
  emailLogIds?: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
    const siteUrl = Deno.env.get("SITE_URL") || "https://ap-vidyaconnect.gov.in";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration environment variables.");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const body: RetryRequest = await req.json();
    const { batchId, emailLogIds } = body;

    let query = supabaseAdmin
      .from("email_logs")
      .select(`
        id,
        recipient_email,
        student_id,
        batch_id,
        subject,
        student:students(id, full_name, email),
        batch:internship_batches(
          id, title, start_date, end_date,
          company:companies(name),
          institution:institutions(name)
        )
      `)
      .eq("status", "failed");

    if (batchId) {
      query = query.eq("batch_id", batchId);
    } else if (emailLogIds && emailLogIds.length > 0) {
      query = query.in("id", emailLogIds);
    }

    const { data: failedLogs, error: logError } = await query;

    if (logError || !failedLogs || failedLogs.length === 0) {
      return new Response(
        JSON.stringify({ message: "No failed email logs found to retry." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let retriedSuccessCount = 0;
    let retriedFailedCount = 0;

    for (const log of failedLogs) {
      let emailSent = false;
      let errorMsg: string | undefined;
      let resendId: string | undefined;

      const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "AP VidyaConnect <onboarding@resend.dev>";

      if (resendApiKey) {
        try {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: fromEmail,
              to: [log.recipient_email],
              subject: log.subject || "Your AP VidyaConnect Student Account Has Been Activated",
              html: `<p>Dear ${(log.student as any)?.full_name || "Student"}, your AP VidyaConnect account has been activated for ${(log.batch as any)?.title}. Please visit <a href="${siteUrl}/login">${siteUrl}/login</a> to sign in.</p>`,
            }),
          });

          const data = await res.json();
          if (res.ok && data.id) {
            emailSent = true;
            resendId = data.id;
            retriedSuccessCount++;
          } else {
            errorMsg = data.message || "Retry delivery failed";
            retriedFailedCount++;
          }
        } catch (err: any) {
          errorMsg = err.message || "Network exception during retry";
          retriedFailedCount++;
        }
      } else {
        emailSent = true;
        retriedSuccessCount++;
      }

      await supabaseAdmin
        .from("email_logs")
        .update({
          status: emailSent ? "sent" : "failed",
          resend_message_id: resendId,
          error_message: errorMsg,
          sent_at: emailSent ? new Date().toISOString() : null,
        })
        .eq("id", log.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        retried: failedLogs.length,
        succeeded: retriedSuccessCount,
        failed: retriedFailedCount,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Retry failed:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
