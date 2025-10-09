import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MS365Token {
  access_token: string;
  user_id: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log("Starting outreach campaign processing...");

    // Get all active campaigns
    const { data: campaigns, error: campaignsError } = await supabase
      .from("outreach_campaigns")
      .select(`
        *,
        outreach_campaign_contacts!inner(
          id,
          contact_id,
          status,
          crm_contacts(*)
        ),
        outreach_email_sequences(*)
      `)
      .eq("status", "active");

    if (campaignsError) {
      console.error("Error fetching campaigns:", campaignsError);
      throw campaignsError;
    }

    if (!campaigns || campaigns.length === 0) {
      console.log("No active campaigns found");
      return new Response(
        JSON.stringify({ message: "No active campaigns" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${campaigns.length} active campaigns`);

    for (const campaign of campaigns) {
      console.log(`Processing campaign: ${campaign.name} (${campaign.id})`);

      // Get MS365 token for the campaign creator
      const { data: tokenData, error: tokenError } = await supabase
        .from("ms365_tokens")
        .select("access_token, user_id")
        .eq("user_id", campaign.created_by)
        .single();

      if (tokenError || !tokenData) {
        console.error(`No MS365 token found for user ${campaign.created_by}`);
        continue;
      }

      const ms365Token: MS365Token = tokenData;

      // Process contacts that are still pending
      for (const contactEntry of campaign.outreach_campaign_contacts) {
        if (contactEntry.status !== "pending") continue;

        const contact = contactEntry.crm_contacts;
        if (!contact || !contact.email) {
          console.log(`Skipping contact ${contactEntry.contact_id} - no email`);
          continue;
        }

        // Get the first email sequence
        const firstSequence = campaign.outreach_email_sequences?.find(
          (seq: any) => seq.sequence_number === 1
        );

        if (!firstSequence) {
          console.log(`No email sequence found for campaign ${campaign.id}`);
          continue;
        }

        try {
          // Personalize email with AI
          const personalizedEmail = await personalizeEmail(
            firstSequence.subject_template,
            firstSequence.body_template,
            contact,
            campaign.ai_instructions
          );

          // Send email via MS365
          await sendEmailViaMS365(
            ms365Token.access_token,
            contact.email,
            personalizedEmail.subject,
            personalizedEmail.body
          );

          // Record sent email
          await supabase.from("outreach_sent_emails").insert({
            campaign_id: campaign.id,
            contact_id: contact.id,
            sequence_id: firstSequence.id,
            sent_by: campaign.created_by,
            subject: personalizedEmail.subject,
            body: personalizedEmail.body,
            status: "sent",
          });

          // Update contact status
          await supabase
            .from("outreach_campaign_contacts")
            .update({ status: "sent" })
            .eq("id", contactEntry.id);

          console.log(`Email sent to ${contact.email}`);
        } catch (error) {
          console.error(`Error sending email to ${contact.email}:`, error);
          
          // Record failed email
          await supabase.from("outreach_sent_emails").insert({
            campaign_id: campaign.id,
            contact_id: contact.id,
            sequence_id: firstSequence.id,
            sent_by: campaign.created_by,
            subject: firstSequence.subject_template,
            body: firstSequence.body_template,
            status: "failed",
            error_message: error.message,
          });

          // Update contact status
          await supabase
            .from("outreach_campaign_contacts")
            .update({ status: "failed" })
            .eq("id", contactEntry.id);
        }
      }
    }

    return new Response(
      JSON.stringify({ message: "Outreach processing completed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in process-outreach-campaigns:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function personalizeEmail(
  subjectTemplate: string,
  bodyTemplate: string,
  contact: any,
  aiInstructions: string
): Promise<{ subject: string; body: string }> {
  if (!LOVABLE_API_KEY) {
    // Fallback: simple template replacement
    const subject = replaceVariables(subjectTemplate, contact);
    const body = replaceVariables(bodyTemplate, contact);
    return { subject, body };
  }

  try {
    const prompt = `${aiInstructions}

Kontaktinformationen:
- Name: ${contact.first_name} ${contact.last_name}
- Position: ${contact.position || "Nicht angegeben"}
- Unternehmen: ${contact.crm_company_id || "Nicht angegeben"}
- Email: ${contact.email}

Betreff-Vorlage: ${subjectTemplate}
E-Mail-Vorlage: ${bodyTemplate}

Bitte personalisiere die E-Mail basierend auf den Kontaktinformationen. Gib die personalisierte Version zurück.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "Du bist ein Assistent für E-Mail-Personalisierung. Antworte immer im JSON-Format mit den Feldern 'subject' und 'body'.",
          },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "personalize_email",
              description: "Personalisiere Betreff und Inhalt einer E-Mail",
              parameters: {
                type: "object",
                properties: {
                  subject: { type: "string", description: "Personalisierter Betreff" },
                  body: { type: "string", description: "Personalisierter E-Mail-Inhalt" },
                },
                required: ["subject", "body"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "personalize_email" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall && toolCall.function.arguments) {
      const args = JSON.parse(toolCall.function.arguments);
      return {
        subject: args.subject || replaceVariables(subjectTemplate, contact),
        body: args.body || replaceVariables(bodyTemplate, contact),
      };
    }

    // Fallback
    return {
      subject: replaceVariables(subjectTemplate, contact),
      body: replaceVariables(bodyTemplate, contact),
    };
  } catch (error) {
    console.error("Error personalizing email with AI:", error);
    // Fallback to simple template replacement
    return {
      subject: replaceVariables(subjectTemplate, contact),
      body: replaceVariables(bodyTemplate, contact),
    };
  }
}

function replaceVariables(template: string, contact: any): string {
  return template
    .replace(/\{\{first_name\}\}/g, contact.first_name || "")
    .replace(/\{\{last_name\}\}/g, contact.last_name || "")
    .replace(/\{\{email\}\}/g, contact.email || "")
    .replace(/\{\{position\}\}/g, contact.position || "")
    .replace(/\{\{company\}\}/g, contact.crm_company_id || "");
}

async function sendEmailViaMS365(
  accessToken: string,
  toEmail: string,
  subject: string,
  body: string
): Promise<void> {
  const response = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        subject: subject,
        body: {
          contentType: "HTML",
          content: body,
        },
        toRecipients: [
          {
            emailAddress: {
              address: toEmail,
            },
          },
        ],
      },
      saveToSentItems: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("MS365 API error:", response.status, errorText);
    throw new Error(`Failed to send email via MS365: ${response.status}`);
  }
}
