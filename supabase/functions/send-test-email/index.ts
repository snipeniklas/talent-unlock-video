import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestEmailRequest {
  campaignId: string;
  testEmail: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { campaignId, testEmail }: TestEmailRequest = await req.json();

    console.log(`Sending test emails for campaign ${campaignId} to ${testEmail}`);

    // Get campaign with sequences
    const { data: campaign, error: campaignError } = await supabase
      .from("outreach_campaigns")
      .select(`
        *,
        outreach_email_sequences(*)
      `)
      .eq("id", campaignId)
      .single();

    if (campaignError) throw campaignError;

    // Get MS365 token for the campaign creator
    const { data: token, error: tokenError } = await supabase
      .from("ms365_tokens")
      .select("*")
      .eq("user_id", campaign.created_by)
      .single();

    if (tokenError || !token) {
      throw new Error("MS365 integration not configured for this user");
    }

    // Get user email settings
    const { data: emailSettings } = await supabase
      .from("user_email_settings")
      .select("email_signature")
      .eq("user_id", campaign.created_by)
      .single();

    const signature = emailSettings?.email_signature || "";

    // Sort sequences by sequence_number
    const sequences = (campaign.outreach_email_sequences || []).sort(
      (a: any, b: any) => a.sequence_number - b.sequence_number
    );

    // Send all sequences to test email
    for (const sequence of sequences) {
      const subject = `[TEST - Sequenz ${sequence.sequence_number}] ${sequence.subject_template}`;
      const bodyWithSignature = `${sequence.body_template}${signature ? `\n\n${signature}` : ""}`;

      console.log(`Sending test email - Sequence ${sequence.sequence_number}`);

      // Send via MS365
      const response = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            subject,
            body: {
              contentType: "HTML",
              content: bodyWithSignature,
            },
            toRecipients: [
              {
                emailAddress: {
                  address: testEmail,
                },
              },
            ],
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`Failed to send test email for sequence ${sequence.sequence_number}:`, error);
        throw new Error(`Failed to send test email: ${error}`);
      }

      console.log(`Test email sent successfully for sequence ${sequence.sequence_number}`);

      // Small delay between emails
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${sequences.length} Test-E-Mails wurden an ${testEmail} gesendet`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-test-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
