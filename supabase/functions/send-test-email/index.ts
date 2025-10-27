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

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not configured");
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
      console.log(`🤖 Calling OpenAI for test email (sequence ${sequence.sequence_number})...`);
      console.log(`📧 Test recipient: ${testEmail}`);

      // System prompt (identical to process-outreach-campaigns)
      const systemPrompt = `Du bist ein Experte für professionelle B2B-Outreach-E-Mails im deutschen Raum.

Deine Aufgabe ist es, personalisierte E-Mails zu erstellen, die:
1. **Professionell und authentisch** wirken
2. **Kurz und prägnant** sind (max. 150 Wörter für den Body)
3. **Einen klaren Call-to-Action** enthalten
4. **Personalisiert** auf den Empfänger eingehen
5. **HTML-formatiert** sind mit <p> Tags für Absätze

**Wichtige Regeln:**
- Verwende die "Sie"-Form
- Keine übertriebenen Superlative
- Keine Emoji
- Vermeide generische Phrasen wie "Ich hoffe, diese E-Mail erreicht Sie gut"
- Der Betreff sollte neugierig machen, aber nicht zu verkaufsorientiert sein
- Nutze die bereitgestellten Vorlagen als Basis, aber personalisiere basierend auf Kontaktinformationen
- Falls Research-Daten verfügbar sind, integriere relevante Insights subtil

**KRITISCH - SIGNATUR UND GRUßFORMEL:**
- Füge KEINE Grußformel hinzu (KEIN "Mit besten Grüßen", "Mit freundlichen Grüßen", "Viele Grüße", etc.)
- Füge KEINE Signatur hinzu (KEIN Name, KEINE Kontaktdaten, KEIN Firmenname am Ende)
- Die E-Mail endet DIREKT mit dem Call-to-Action
- Die Signatur wird automatisch aus der Datenbank angehängt
- Schreibe NICHTS nach dem CTA

**Format:**
- Betreff: Kurz, prägnant, personalisiert (max. 60 Zeichen)
- Body: HTML mit <p> Tags, professionelle Anrede, max. 150 Wörter, ENDET mit CTA (keine Signatur!)
- CTA: Klar und spezifisch (z.B. "15-minütiges Kennenlerngespräch nächste Woche?")`;

      // User prompt
      const userPrompt = `**Kontext:**
- **Kontakt:** ${testContact.first_name} ${testContact.last_name}
- **Position:** ${testContact.position}
- **Unternehmen:** ${testContact.company_name}
- **Email:** ${testContact.email}

**Kampagnendetails:**
- **Zielgruppe:** ${campaign.target_audience || 'Nicht angegeben'}
- **Gewünschter CTA:** ${campaign.desired_cta || 'Nicht angegeben'}
- **AI-Anweisungen:** ${campaign.ai_instructions || 'Keine zusätzlichen Anweisungen'}

**Absender (Deine Firma):**
- **Firmenname:** ${profile?.companies?.name || 'Hej Talent'}
- **Website:** ${profile?.companies?.website || 'https://hejtalent.de'}

**E-Mail-Vorlagen:**
- **Betreff-Vorlage:** ${sequence.subject_template}
- **Body-Vorlage:** ${sequence.body_template}

**Sequenz:** ${sequence.sequence_number}

Generiere jetzt eine personalisierte E-Mail basierend auf diesen Informationen.`;

      // Call OpenAI with tool calling
      const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          tools: [{
            type: "function",
            function: {
              name: "generate_email",
              description: "Generiere personalisierten E-Mail-Betreff und -Inhalt",
              parameters: {
                type: "object",
                properties: {
                  subject: {
                    type: "string",
                    description: "Der personalisierte E-Mail-Betreff"
                  },
                  body: {
                    type: "string",
                    description: "Der personalisierte E-Mail-Body in HTML-Format"
                  }
                },
                required: ["subject", "body"]
              }
            }
          }],
          tool_choice: { type: "function", function: { name: "generate_email" } }
        }),
      });

      if (!openaiResponse.ok) {
        const error = await openaiResponse.text();
        console.error("❌ OpenAI API error:", error);
        throw new Error(`OpenAI API failed: ${error}`);
      }

      const data = await openaiResponse.json();
      
      // Parse tool call response
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall || toolCall.function.name !== "generate_email") {
        console.error("❌ No valid tool call in OpenAI response");
        throw new Error("Invalid OpenAI response: No tool call found");
      }

      const emailData = JSON.parse(toolCall.function.arguments);
      const generatedSubject = emailData.subject || sequence.subject_template;
      const generatedBody = emailData.body || sequence.body_template;

      console.log(`✅ Email generated successfully`);
      console.log(`📋 Subject: ${generatedSubject.substring(0, 60)}...`);

      const subject = `[TEST - Sequenz ${sequence.sequence_number}] ${generatedSubject}`;
      const bodyWithSignature = `${generatedBody}${signature ? `\n\n${signature}` : ""}`;

      console.log(`Sending test email - Sequence ${sequence.sequence_number}`);
      console.log(`Subject: ${subject}`);

      // Send via MS365
      const sendResponse = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
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

      if (!sendResponse.ok) {
        const error = await sendResponse.text();
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
