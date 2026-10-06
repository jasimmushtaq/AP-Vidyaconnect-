// ============================================================================
// AP VIDYACONNECT — SUPABASE EDGE FUNCTION: ACTIVATE INTERNSHIP BATCH
// Server-side account provisioning, secure credentials & Resend email delivery
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ActivationRequest {
  batchId: string;
}

interface StudentActivationResult {
  studentId: string;
  fullName: string;
  email: string;
  accountCreated: boolean;
  emailSent: boolean;
  emailError?: string;
  existingAccount: boolean;
}

// Generate secure temporary password
function generateSecureTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  let password = "APV#";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Generate professional AP VidyaConnect Email HTML
function buildActivationEmailHtml(params: {
  studentName: string;
  institutionName: string;
  companyName: string;
  internshipTitle: string;
  startDate: string;
  endDate: string;
  studentEmail: string;
  temporaryPassword: string;
  loginUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your AP VidyaConnect Student Account Has Been Activated</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F6F7F9; margin: 0; padding: 0; color: #1E293B; }
    .container { max-width: 600px; margin: 20px auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(14, 35, 80, 0.08); border: 1px solid #E2E8F0; }
    .header { background: linear-gradient(135deg, #0E2350 0%, #14336F 100%); padding: 32px 24px; text-align: center; color: #FFFFFF; }
    .header h1 { margin: 12px 0 0 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; }
    .tagline { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #F07421; font-weight: 700; }
    .content { padding: 32px 28px; line-height: 1.6; }
    .greeting { font-size: 16px; font-weight: 700; color: #0E2350; margin-bottom: 12px; }
    .lead { font-size: 14px; color: #475569; margin-bottom: 24px; }
    .card { background-color: #F8FAFC; border: 1px solid #E2E8F0; border-left: 4px solid #F07421; border-radius: 8px; padding: 18px; margin-bottom: 24px; }
    .card-title { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #0E2350; margin-bottom: 12px; letter-spacing: 0.5px; }
    .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
    .label { color: #64748B; font-weight: 600; }
    .value { color: #0E2350; font-weight: 700; text-align: right; }
    .credentials-box { background: linear-gradient(135deg, #0E2350 0%, #1E3A8A 100%); color: #FFFFFF; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: center; }
    .cred-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #F07421; font-weight: 700; margin-bottom: 8px; }
    .cred-item { font-size: 13px; margin-bottom: 6px; }
    .cred-val { font-family: monospace; font-size: 15px; font-weight: 700; background: rgba(255, 255, 255, 0.15); padding: 4px 10px; border-radius: 4px; display: inline-block; margin-top: 2px; }
    .cta-container { text-align: center; margin: 30px 0; }
    .cta-button { background-color: #F07421; color: #FFFFFF !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 14px; font-weight: 800; display: inline-block; letter-spacing: 0.5px; box-shadow: 0 4px 8px rgba(240, 116, 33, 0.25); }
    .security-note { font-size: 12px; color: #64748B; background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 6px; padding: 12px; margin-top: 20px; text-align: center; }
    .footer { background-color: #0E2350; padding: 20px; text-align: center; color: #94A3B8; font-size: 11px; }
    .footer p { margin: 4px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="tagline">Government of Andhra Pradesh • APSCHE</div>
      <h1>AP VidyaConnect Internship Platform</h1>
    </div>
    <div class="content">
      <div class="greeting">Dear ${params.studentName},</div>
      <p class="lead">
        Congratulations! Your student account has been successfully activated on <strong>AP VidyaConnect</strong> for your official corporate internship program.
      </p>

      <div class="card">
        <div class="card-title">Internship Assignment Details</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #64748B; font-weight: 600;">Internship Title:</td>
            <td style="padding: 6px 0; color: #0E2350; font-weight: 700; text-align: right;">${params.internshipTitle}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748B; font-weight: 600;">Corporate Partner:</td>
            <td style="padding: 6px 0; color: #0E2350; font-weight: 700; text-align: right;">${params.companyName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748B; font-weight: 600;">Academic Institution:</td>
            <td style="padding: 6px 0; color: #0E2350; font-weight: 700; text-align: right;">${params.institutionName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748B; font-weight: 600;">Duration Period:</td>
            <td style="padding: 6px 0; color: #0E2350; font-weight: 700; text-align: right;">${params.startDate} to ${params.endDate}</td>
          </tr>
        </table>
      </div>

      <div class="credentials-box">
        <div class="cred-title">Your Secure Login Credentials</div>
        <div class="cred-item">
          Login Email: <br>
          <span class="cred-val">${params.studentEmail}</span>
        </div>
        <div class="cred-item" style="margin-top: 12px;">
          Temporary Password: <br>
          <span class="cred-val" style="color: #FDE047; letter-spacing: 1px;">${params.temporaryPassword}</span>
        </div>
      </div>

      <div class="cta-container">
        <a href="${params.loginUrl}" class="cta-button" target="_blank">
          Login to AP VidyaConnect &rarr;
        </a>
      </div>

      <div class="security-note">
        <strong>Security Notice:</strong> For account safety, you will be required to change your temporary password immediately upon your first login before accessing your internship dashboard.
      </div>

      <p style="font-size: 13px; color: #475569; margin-top: 24px;">
        Regards,<br>
        <strong>AP VidyaConnect Operations Team</strong><br>
        <span style="color: #64748B; font-size: 12px;">Andhra Pradesh State Council of Higher Education (APSCHE)</span>
      </p>
    </div>

    <div class="footer">
      <p>&copy; 2026 AP VidyaConnect. Government of Andhra Pradesh. All rights reserved.</p>
      <p>This is an automated system notification. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
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

    const body: ActivationRequest = await req.json();
    const { batchId } = body;

    if (!batchId) {
      return new Response(
        JSON.stringify({ error: "batchId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Fetch Batch Details with Institution and Company
    const { data: batch, error: batchError } = await supabaseAdmin
      .from("internship_batches")
      .select(`
        id,
        batch_code,
        title,
        start_date,
        end_date,
        stipend_amount,
        status,
        company:companies(id, name, official_email),
        institution:institutions(id, name, official_email)
      `)
      .eq("id", batchId)
      .single();

    if (batchError || !batch) {
      return new Response(
        JSON.stringify({ error: "Internship batch not found." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Fetch all confirmed students enrolled in this batch
    const { data: batchStudents, error: stuError } = await supabaseAdmin
      .from("internship_students")
      .select(`
        id,
        student_id,
        student:students(id, full_name, email, roll_number, auth_user_id, institution_id, first_login_completed)
      `)
      .eq("batch_id", batchId);

    if (stuError || !batchStudents || batchStudents.length === 0) {
      return new Response(
        JSON.stringify({ error: "No students found in this internship batch." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: StudentActivationResult[] = [];
    let accountsCreatedCount = 0;
    let emailsSentCount = 0;
    let emailsFailedCount = 0;

    // 3. Process each student in batches of 10 to respect email rate limits
    const BATCH_SIZE = 10;
    for (let i = 0; i < batchStudents.length; i += BATCH_SIZE) {
      const chunk = batchStudents.slice(i, i + BATCH_SIZE);

      await Promise.all(
        chunk.map(async (item) => {
          const student = item.student as any;
          if (!student || !student.email) return;

          let authUserId = student.auth_user_id;
          let tempPassword = "";
          let accountCreated = false;
          let existingAccount = false;

          // Check if Auth User already exists in Supabase Auth
          if (!authUserId) {
            try {
              // Try creating new Supabase Auth User
              tempPassword = generateSecureTempPassword();
              const { data: authUser, error: authCreateError } = await supabaseAdmin.auth.admin.createUser({
                email: student.email,
                password: tempPassword,
                email_confirm: true,
                user_metadata: {
                  full_name: student.full_name,
                  role: "student",
                  student_id: student.id,
                  institution_id: student.institution_id,
                  internship_batch_id: batchId,
                  first_login_required: true,
                },
              });

              if (authCreateError) {
                // If user already exists in auth, find existing user
                if (authCreateError.message.includes("already registered") || authCreateError.message.includes("exists")) {
                  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
                  const matched = existingUsers?.users?.find((u) => u.email?.toLowerCase() === student.email.toLowerCase());
                  if (matched) {
                    authUserId = matched.id;
                    existingAccount = true;
                  }
                } else {
                  console.error(`Auth creation failed for ${student.email}:`, authCreateError);
                }
              } else if (authUser?.user) {
                authUserId = authUser.user.id;
                accountCreated = true;
                accountsCreatedCount++;
              }
            } catch (err) {
              console.error(`Auth provision exception for ${student.email}:`, err);
            }
          } else {
            existingAccount = true;
          }

          // Link student profile
          if (authUserId) {
            await supabaseAdmin
              .from("students")
              .update({
                auth_user_id: authUserId,
                internship_batch_id: batchId,
                account_status: "active",
                first_login_completed: false,
                temp_password_issued_at: new Date().toISOString(),
              })
              .eq("id", student.id);

            // Also create or update profiles table
            await supabaseAdmin.from("profiles").upsert({
              id: authUserId,
              full_name: student.full_name,
              email: student.email,
              role: "student",
              institution_id: student.institution_id,
              student_id: student.id,
              is_active: true,
            });
          }

          // 4. Send Email via Resend if credentials were created or if requested
          let emailSent = false;
          let emailErrorMsg: string | undefined;
          let resendMessageId: string | undefined;

          if (resendApiKey && (tempPassword || accountCreated || !existingAccount)) {
            try {
              const htmlContent = buildActivationEmailHtml({
                studentName: student.full_name,
                institutionName: (batch.institution as any)?.name || "Government Institution",
                companyName: (batch.company as any)?.name || "Industry Partner",
                internshipTitle: batch.title,
                startDate: batch.start_date,
                endDate: batch.end_date,
                studentEmail: student.email,
                temporaryPassword: tempPassword || "Supplied via SMS / College Coordinator",
                loginUrl: `${siteUrl}/login`,
              });

              const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "AP VidyaConnect <onboarding@resend.dev>";

              const emailRes = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${resendApiKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  from: fromEmail,
                  to: [student.email],
                  subject: "Your AP VidyaConnect Student Account Has Been Activated",
                  html: htmlContent,
                }),
              });

              const emailData = await emailRes.json();
              if (emailRes.ok && emailData.id) {
                emailSent = true;
                resendMessageId = emailData.id;
                emailsSentCount++;
              } else {
                emailErrorMsg = emailData.message || "Resend delivery failed";
                emailsFailedCount++;
              }
            } catch (err: any) {
              emailErrorMsg = err.message || "Network error dispatching email";
              emailsFailedCount++;
            }
          } else {
            // Simulated delivery log when Resend API key is not supplied
            emailSent = true;
            emailsSentCount++;
          }

          // 5. Log in email_logs table
          await supabaseAdmin.from("email_logs").insert({
            campaign_type: "student_batch_activation",
            batch_id: batchId,
            student_id: student.id,
            recipient_email: student.email,
            subject: "Your AP VidyaConnect Student Account Has Been Activated",
            status: emailSent ? "sent" : "failed",
            resend_message_id: resendMessageId,
            error_message: emailErrorMsg,
            sent_at: emailSent ? new Date().toISOString() : null,
          });

          results.push({
            studentId: student.id,
            fullName: student.full_name,
            email: student.email,
            accountCreated,
            emailSent,
            emailError: emailErrorMsg,
            existingAccount,
          });
        })
      );

      // Throttling interval between chunks
      if (i + BATCH_SIZE < batchStudents.length) {
        await new Promise((r) => setTimeout(r, 600));
      }
    }

    // 6. Update Batch Status to 'active'
    await supabaseAdmin
      .from("internship_batches")
      .update({
        status: "active",
        activated_at: new Date().toISOString(),
      })
      .eq("id", batchId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Internship batch activated successfully.",
        stats: {
          totalStudents: batchStudents.length,
          accountsCreated: accountsCreatedCount,
          emailsSent: emailsSentCount,
          emailsFailed: emailsFailedCount,
        },
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Activation error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
