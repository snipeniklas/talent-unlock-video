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

    // Get campaign with sequences and company info
    const { data: campaign, error: campaignError } = await supabase
      .from("outreach_campaigns")
      .select(`
        *,
        outreach_email_sequences(*)
      `)
      .eq("id", campaignId)
      .single();

    if (campaignError) throw campaignError;

    // Get user profile with company
    const { data: profile } = await supabase
      .from("profiles")
      .select(`
        *,
        companies (*)
      `)
      .eq("user_id", campaign.created_by)
      .single();

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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Create a dummy contact for testing
    const testContact = {
      first_name: "Test",
      last_name: "Empfänger",
      position: "Test Position",
      email: testEmail,
      company_name: "Test Unternehmen"
    };

    // Send all sequences to test email
    for (const sequence of sequences) {
      console.log(`Generating test email - Sequence ${sequence.sequence_number}`);

      // Generate subject using AI
      const subjectPrompt = `${sequence.subject_template}

Kontext:
- Kontakt: ${testContact.first_name} ${testContact.last_name}, ${testContact.position} bei ${testContact.company_name}
- Kampagne Zielgruppe: ${campaign.target_audience || 'Nicht angegeben'}
- Gewünschter CTA: ${campaign.desired_cta || 'Nicht angegeben'}

Generiere NUR den Betreff, keine zusätzlichen Erklärungen.`;

      const subjectResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "user", content: subjectPrompt }
          ],
        }),
      });

      if (!subjectResponse.ok) {
        const error = await subjectResponse.text();
        console.error("AI subject generation failed:", error);
        throw new Error(`AI subject generation failed: ${error}`);
      }

      const subjectData = await subjectResponse.json();
      const generatedSubject = subjectData.choices?.[0]?.message?.content?.trim() || sequence.subject_template;

      // Generate body using AI
      const bodyPrompt = `${sequence.body_template}

Kontext:
- Kontakt: ${testContact.first_name} ${testContact.last_name}, ${testContact.position} bei ${testContact.company_name}
- Email: ${testContact.email}
- Kampagne Zielgruppe: ${campaign.target_audience || 'Nicht angegeben'}
- Gewünschter CTA: ${campaign.desired_cta || 'Nicht angegeben'}
- Zusätzliche AI Anweisungen: ${campaign.ai_instructions || 'Keine'}
- Firma: ${profile?.companies?.name || 'Hej Talent'}
- Firmen-Website: ${profile?.companies?.website || 'https://hejtalent.de'}

Erstelle eine professionelle, personalisierte E-Mail. Nutze HTML-Formatierung mit <p> Tags. Generiere NUR den E-Mail-Text, keine Betreffzeile und keine zusätzlichen Erklärungen.`;

      const bodyResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "user", content: bodyPrompt }
          ],
        }),
      });

      if (!bodyResponse.ok) {
        const error = await bodyResponse.text();
        console.error("AI body generation failed:", error);
        throw new Error(`AI body generation failed: ${error}`);
      }

      const bodyData = await bodyResponse.json();
      const generatedBody = bodyData.choices?.[0]?.message?.content?.trim() || sequence.body_template;

      const subject = `[TEST - Sequenz ${sequence.sequence_number}] ${generatedSubject}`;
      const bodyWithSignature = `${generatedBody}${signature ? `\n\n${signature}` : ""}`;

      console.log(`Sending test email - Sequence ${sequence.sequence_number}`);
      console.log(`Subject: ${subject}`);

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

      // Small delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
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
