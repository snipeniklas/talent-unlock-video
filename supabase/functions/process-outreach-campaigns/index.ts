import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MAX_EMAILS_PER_RUN = 50; // Max emails per function invocation

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

    // Parse request body for campaignId and forceProcess flag
    const requestBody = await req.json().catch(() => ({}));
    const campaignId = requestBody.campaignId;
    const forceProcess = requestBody.forceProcess || false;
    
    if (forceProcess) {
      console.log("⚡ FORCE PROCESS MODE ENABLED - Processing immediately");
    }

    console.log(`Current time: ${new Date().toISOString()}`);

    // Get campaigns based on campaignId or all active campaigns (NOT draft)
    let query = supabase
      .from("outreach_campaigns")
      .select(`
        *,
        outreach_campaign_contacts!inner(
          id,
          contact_id,
          status,
          next_sequence_number,
          next_send_date,
          is_excluded,
          crm_contacts(*)
        ),
        outreach_email_sequences(*)
      `);
    
    if (campaignId) {
      query = query.eq("id", campaignId).eq("status", "active");
    } else {
      query = query.eq("status", "active");
    }
    
    const { data: campaigns, error: campaignsError } = await query;

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

    // STARTUP VALIDATION: Auto-fix any stuck "processing" contacts
    console.log(`🔧 Running startup validation to fix any stuck 'processing' contacts...`);
    
    const { data: stuckContacts, error: stuckError } = await supabase
      .from("outreach_campaign_contacts")
      .select("id, status, contact_id, crm_contacts(email)")
      .in("campaign_id", campaigns.map(c => c.id))
      .eq("status", "processing");

    if (stuckContacts && stuckContacts.length > 0) {
      console.log(`⚠️ Found ${stuckContacts.length} stuck 'processing' contacts - resetting to 'pending'`);
      
      for (const stuck of stuckContacts) {
        const contactEmail = stuck.crm_contacts?.email || 'unknown';
        console.log(`🔧 Resetting contact ${contactEmail} (ID: ${stuck.contact_id}) from 'processing' to 'pending'`);
        
        await supabase
          .from("outreach_campaign_contacts")
          .update({ 
            status: "pending",
            updated_at: new Date().toISOString()
          })
          .eq("id", stuck.id);
      }
      
      console.log(`✅ Reset ${stuckContacts.length} stuck contacts to 'pending'`);
    } else {
      console.log(`✅ No stuck 'processing' contacts found`);
    }

    // Track total emails sent in this run
    let totalEmailsSent = 0;

    for (const campaign of campaigns) {
      // Stop processing if we've reached the limit
      if (totalEmailsSent >= MAX_EMAILS_PER_RUN) {
        console.log(`Reached email limit (${MAX_EMAILS_PER_RUN}), stopping for this run`);
        break;
      }
      console.log(`\n=== Processing Campaign: ${campaign.name} (ID: ${campaign.id}) ===`);

      // STEP 1: DEDUPLICATE CONTACTS
      // This prevents sending multiple emails to the same contact if duplicate entries exist
      const uniqueContacts = new Map();
      for (const contactEntry of campaign.outreach_campaign_contacts) {
        const contactId = contactEntry.contact_id;
        
        if (!uniqueContacts.has(contactId)) {
          uniqueContacts.set(contactId, contactEntry);
        } else {
          // If duplicate exists, keep the one with the earliest next_send_date
          const existing = uniqueContacts.get(contactId);
          const existingDate = existing.next_send_date ? new Date(existing.next_send_date) : new Date(0);
          const currentDate = contactEntry.next_send_date ? new Date(contactEntry.next_send_date) : new Date(0);
          
          if (currentDate < existingDate) {
            console.log(`⚠️ Duplicate contact detected: ${contactId}. Using entry with earlier next_send_date.`);
            uniqueContacts.set(contactId, contactEntry);
          }
        }
      }

      console.log(`Total contact entries: ${campaign.outreach_campaign_contacts.length}`);
      console.log(`Unique contacts after deduplication: ${uniqueContacts.size}`);

      // Replace the campaign contacts array with deduplicated version
      campaign.outreach_campaign_contacts = Array.from(uniqueContacts.values());

      // Get MS365 token for the campaign creator and refresh if needed
      console.log(`🔄 Checking MS365 token for user ${campaign.created_by}...`);
      
      // Call token refresh function to ensure token is valid
      const refreshResponse = await supabase.functions.invoke("ms365-refresh-token", {
        body: { userId: campaign.created_by }
      });

      if (refreshResponse.error || !refreshResponse.data?.success) {
        console.error(`❌ Failed to refresh/validate MS365 token for user ${campaign.created_by}:`, refreshResponse.error);
        continue;
      }

      console.log(`✅ MS365 token valid for user ${campaign.created_by}`);

      // Get the fresh token from the database
      const { data: tokenData, error: tokenError } = await supabase
        .from("ms365_tokens")
        .select("access_token, user_id")
        .eq("user_id", campaign.created_by)
        .single();

      if (tokenError || !tokenData) {
        console.error(`❌ No MS365 token found for user ${campaign.created_by}`);
        continue;
      }

      const ms365Token: MS365Token = tokenData;

      // Load campaign creator's email signature
      const { data: emailSettings } = await supabase
        .from("user_email_settings")
        .select("email_signature")
        .eq("user_id", campaign.created_by)
        .maybeSingle();

      // Load sender profile data for fallback signature
      const { data: senderProfile } = await supabase
        .from("profiles")
        .select("first_name, last_name, email, company_id")
        .eq("user_id", campaign.created_by)
        .single();

      // Load company context for AI personalization
      let companyName = "";
      let companyContext = "";
      if (senderProfile?.company_id) {
        const { data: companyData } = await supabase
          .from("companies")
          .select("name, website, value_proposition")
          .eq("id", senderProfile.company_id)
          .single();
        
        companyName = companyData?.name || "";
        
        if (companyData) {
          companyContext = `
ABSENDER-UNTERNEHMEN:
- Name: ${companyData.name || 'Nicht verfügbar'}
- Wertversprechen: ${companyData.value_proposition || 'Nicht verfügbar'}
- Website: ${companyData.website || 'Nicht verfügbar'}
`;
        }
      }

      // Use custom signature or generate fallback
      const emailSignature = emailSettings?.email_signature ||
        generateFallbackSignature(
          senderProfile?.first_name || "",
          senderProfile?.last_name || "",
          companyName,
          senderProfile?.email || ""
        );

      // Process each contact in this campaign
      for (const contactEntry of campaign.outreach_campaign_contacts) {
        // Stop if we've reached the email limit for this run
        if (totalEmailsSent >= MAX_EMAILS_PER_RUN) {
          console.log(`Reached email limit (${MAX_EMAILS_PER_RUN}) during campaign processing`);
          break;
        }

        // Skip excluded contacts
        if (contactEntry.is_excluded) {
          console.log(`⏭️ SKIP: Contact ${contactEntry.crm_contacts?.email || contactEntry.contact_id} - EXCLUDED by user`);
          continue;
        }

        // Skip contacts that are already completed or failed
        if (contactEntry.status === "failed" || contactEntry.status === "completed") {
          console.log(`⏭️ SKIP: Contact ${contactEntry.crm_contacts?.email || contactEntry.contact_id} - Status: ${contactEntry.status.toUpperCase()}`);
          continue;
        }

        // Skip contacts that are not ready to be sent yet (UNLESS forceProcess is true)
        // This also provides natural deduplication - if next_send_date is in the future,
        // the contact won't be processed even if function runs multiple times
        if (!forceProcess && contactEntry.next_send_date) {
          const sendDate = new Date(contactEntry.next_send_date);
          const now = new Date();
          if (sendDate > now) {
            const hoursUntilReady = Math.round((sendDate.getTime() - now.getTime()) / (1000 * 60 * 60));
            console.log(`⏭️ SKIP: Contact ${contactEntry.crm_contacts?.email || contactEntry.contact_id} - Not ready yet (next send in ${hoursUntilReady}h: ${sendDate.toISOString()})`);
            continue;
          }
        }
        
        if (forceProcess) {
          console.log(`⚡ FORCE PROCESS: Sending to contact ${contactEntry.contact_id} immediately (ignoring delays)`);
        }

        console.log(`Processing contact: ${contactEntry.contact_id} (${contactEntry.crm_contacts?.email})`);

        const contact = contactEntry.crm_contacts;
        if (!contact?.email) {
          console.log(`⏭️ SKIP: Contact ${contactEntry.contact_id} - No email address`);
          continue;
        }

        // Log contact details before attempting lock
        console.log(`✅ READY: Contact ${contact.email} - Status: ${contactEntry.status}, Next Seq: #${contactEntry.next_sequence_number || 1}`);

        // STEP 2: OPTIMISTIC LOCKING
        // Try to acquire lock by setting status to "processing"
        // This prevents race conditions when multiple function instances run simultaneously
        const { data: lockData, error: lockError } = await supabase
          .from("outreach_campaign_contacts")
          .update({ 
            status: "processing",
            updated_at: new Date().toISOString()
          })
          .eq("id", contactEntry.id)
          .eq("status", "pending") // Only lock if status is still "pending"
          .select();

        if (lockError || !lockData || lockData.length === 0) {
          console.log(`❌ LOCK FAILED: Contact ${contact.email} - Current status is NOT 'pending' (might be '${contactEntry.status}')`);
          continue;
        }

        console.log(`🔒 LOCK ACQUIRED: Contact ${contact.email} - Processing sequence #${contactEntry.next_sequence_number || 1}`);

        // Get the next email sequence to send
        const nextSequenceNumber = contactEntry.next_sequence_number || 1;
        const nextSequence = campaign.outreach_email_sequences?.find(
          (seq: any) => seq.sequence_number === nextSequenceNumber
        );

        if (!nextSequence) {
          console.log(`No more sequences for contact ${contactEntry.contact_id}, marking as completed`);
          // Mark campaign contact as completed and release lock
          await supabase
            .from("outreach_campaign_contacts")
            .update({ 
              status: "completed",
              updated_at: new Date().toISOString()
            })
            .eq("id", contactEntry.id);
          continue;
        }

        console.log(`Processing contact ${contact.email} with sequence #${nextSequenceNumber}`);

        try {
          // Personalize email with AI
          const personalizedEmail = await personalizeEmail(
            nextSequence.subject_template,
            nextSequence.body_template,
            contact,
            campaign.ai_instructions || "",
            campaign.target_audience || "",
            campaign.desired_cta || "",
            nextSequenceNumber,
            emailSignature,
            companyContext
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
            contact_id: contactEntry.contact_id,
            sequence_id: nextSequence.id,
            sent_by: campaign.created_by,
            subject: personalizedEmail.subject,
            body: personalizedEmail.body,
            status: "sent",
          });

          // Calculate next send date based on the next sequence's delay
          // Follow-ups go out at the SAME TIME as the original email, just X days later
          const allSequences = campaign.outreach_email_sequences || [];
          const nextSeqNum = nextSequenceNumber + 1;
          const subsequentSequence = allSequences.find((s: any) => s.sequence_number === nextSeqNum);

          let nextSendDate = null;
          if (subsequentSequence) {
            // Use the current time (when the email was just sent) as the base
            const now = new Date();
            nextSendDate = new Date(now.getTime() + subsequentSequence.delay_days * 24 * 60 * 60 * 1000);
            console.log(`Next email (#${nextSeqNum}) scheduled for ${nextSendDate.toISOString()} (${subsequentSequence.delay_days} days from now)`);
          } else {
            console.log(`No more sequences after #${nextSequenceNumber} for contact ${contact.email}`);
          }

          // Update contact with next sequence info and release lock
          // Setting next_send_date in the future provides natural deduplication
          const updateData = {
            status: subsequentSequence ? "pending" : "completed", // Back to pending for next sequence
            next_sequence_number: nextSeqNum,
            next_send_date: nextSendDate,
            updated_at: new Date().toISOString()
          };

          console.log(`📝 Updating contact ${contactEntry.id} to status: ${updateData.status}, next sequence: ${nextSeqNum}`);

          const { data: updateResult, error: updateError } = await supabase
            .from("outreach_campaign_contacts")
            .update(updateData)
            .eq("id", contactEntry.id)
            .select();

          if (updateError) {
            console.error(`❌ Failed to update contact status:`, updateError);
            throw new Error(`Contact status update failed: ${updateError.message}`);
          }

          if (!updateResult || updateResult.length === 0) {
            console.error(`⚠️ Contact ${contactEntry.id} update returned no rows!`);
          } else {
            console.log(`✅ Contact ${contactEntry.id} updated successfully to status: ${updateResult[0].status}`);
          }

          console.log(`✅ Email sent to ${contact.email}`);
          totalEmailsSent++;
        } catch (error) {
          console.error(`❌ Error sending email to ${contact.email}:`, error);
          console.error(`❌ Error details:`, error.message);
          
          // Record failed email with detailed error message
          await supabase.from("outreach_sent_emails").insert({
            campaign_id: campaign.id,
            contact_id: contactEntry.contact_id,
            sequence_id: nextSequence.id,
            sent_by: campaign.created_by,
            subject: nextSequence.subject_template,
            body: nextSequence.body_template,
            status: "failed",
            error_message: `${error.message} | Stack: ${error.stack?.substring(0, 500)}`,
          });

          // Release lock on error - keep as pending so it can be retried
          await supabase
            .from("outreach_campaign_contacts")
            .update({ 
              status: "pending",
              updated_at: new Date().toISOString()
            })
            .eq("id", contactEntry.id);
        }
      }
    }

    console.log(`Outreach processing completed. Emails sent in this run: ${totalEmailsSent}/${MAX_EMAILS_PER_RUN}`);

    return new Response(
      JSON.stringify({ 
        message: "Outreach processing completed",
        emails_sent: totalEmailsSent,
        max_per_run: MAX_EMAILS_PER_RUN
      }),
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
  aiInstructions: string,
  targetAudience: string,
  desiredCta: string,
  sequenceNumber: number,
  emailSignature: string,
  companyContext: string
): Promise<{ subject: string; body: string }> {
  // CRITICAL: OpenAI API Key MUST be set for personalization
  if (!OPENAI_API_KEY) {
    const errorMsg = "❌ KRITISCHER FEHLER: OPENAI_API_KEY nicht gesetzt! E-Mail-Personalisierung nicht möglich.";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    // Get supabase instance for research data lookup
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Optional: Load research data for this contact (if available)
    let researchContext = "";
    const { data: researchData } = await supabase
      .from('crm_contact_research')
      .select('research_data')
      .eq('contact_id', contact.id)
      .maybeSingle();

    if (researchData?.research_data) {
      const research = researchData.research_data;
      researchContext = `

ZUSÄTZLICHE RESEARCH-DATEN ÜBER DEN KONTAKT:
- Zusammenfassung: ${research.summary || 'Nicht verfügbar'}
- Beruflicher Hintergrund: ${research.professional_background || 'Nicht verfügbar'}
- Aktuelle Aktivitäten: ${research.recent_activities || 'Nicht verfügbar'}
- Key Facts: ${research.key_facts?.join(', ') || 'Nicht verfügbar'}
- Talking Points: ${research.talking_points?.join(', ') || 'Nicht verfügbar'}

Nutze diese Informationen für eine hochgradig personalisierte E-Mail!
`;
    }

    // Create prompt for OpenAI
    const systemPrompt = `Du bist ein Experte für B2B E-Mail-Verfassung und Personalisierung.

Deine Aufgabe: Schreibe eine KOMPLETT NEUE, individuell personalisierte E-Mail basierend auf:
1. E-Mail-Prompts (Anweisungen WIE die E-Mail geschrieben werden soll)
2. Kontakt-Informationen (Name, Position, Unternehmen, Branche)
3. Absender-Unternehmen (Firma, Wertversprechen)
4. Kampagnen-Kontext (Zielgruppe, CTA, AI-Anweisungen)
5. Optional: Research-Daten über den Kontakt

WICHTIG - DIE PROMPTS SIND ANWEISUNGEN, KEINE VORLAGEN:
- Die "Prompts" sind ANWEISUNGEN, keine Texte zum Kopieren
- Schreibe die E-Mail KOMPLETT NEU basierend auf diesen Anweisungen
- Personalisiere JEDEN Aspekt der E-Mail für den spezifischen Kontakt
- Nutze die Kontakt- und Research-Daten für maximale Relevanz
- KEINE Variablen wie {{first_name}} verwenden - schreibe alles direkt
- Nutze das Wertversprechen des Absender-Unternehmens intelligent

FORMATIERUNGS-ANFORDERUNGEN:
- Generiere HTML-formatierte E-Mail-Inhalte (NUR Content, KEINE vollständige HTML-Struktur)
- Nutze <p> Tags für Absätze
- Nutze <br> für Zeilenumbrüche innerhalb von Absätzen
- Füge KEINE <html>, <head> oder <body> Tags hinzu
- Halte die Formatierung sauber und professionell
- Die Signatur wird automatisch angehängt - füge sie NICHT manuell hinzu

Beispiel-Output:
<p>Hallo Max,</p>
<p>als CTO bei TechCorp kennen Sie sicherlich die Herausforderungen bei der Skalierung von Entwicklerteams.<br>
Genau hier setzen wir an.</p>
<p>Hätten Sie nächste Woche 15 Minuten für einen kurzen Austausch?</p>

Wichtig:
- Schreibe JEDE E-Mail komplett neu (kein Copy-Paste)
- Beachte die Anweisungen aus den Prompts genau
- Personalisiere basierend auf Position, Unternehmen und Branche
- Integriere die Zielgruppe und den CTA natürlich
- Verknüpfe das Wertversprechen des Absenders mit den Bedürfnissen des Kontakts
- Falls Research-Daten vorhanden sind, nutze sie für spezifische Anknüpfungspunkte
- Vermeide generische Floskeln
- Halte die E-Mail professionell aber persönlich
- Deutsch als Sprache`;

    const userPrompt = `
E-MAIL-ANWEISUNGEN:
Betreff-Prompt: ${subjectTemplate}
E-Mail-Prompt: ${bodyTemplate}

KONTAKT-INFORMATIONEN:
- Vorname: ${contact.first_name || 'Nicht verfügbar'}
- Nachname: ${contact.last_name || 'Nicht verfügbar'}
- Position: ${contact.position || 'Nicht verfügbar'}
- Abteilung: ${contact.department || 'Nicht verfügbar'}
- Unternehmen: ${contact.crm_companies?.name || 'Nicht verfügbar'}
- Branche: ${contact.crm_companies?.industry || 'Nicht verfügbar'}

${companyContext || ''}
KAMPAGNEN-KONTEXT:
- Zielgruppe: ${targetAudience || 'Nicht spezifiziert'}
- Gewünschter CTA: ${desiredCta || 'Nicht spezifiziert'}
- Sequenz-Nummer: ${sequenceNumber} (1 = Erstkontakt, 2+ = Follow-up)
- Zusätzliche AI-Anweisungen: ${aiInstructions || 'Keine'}
${researchContext}

WICHTIG: Nutze das Wertversprechen des Absender-Unternehmens um die E-Mail relevant und ansprechend zu gestalten. Verknüpfe es mit den Bedürfnissen des Kontakts und seiner Position.

Erstelle jetzt die personalisierte E-Mail basierend auf den Anweisungen.
    `.trim();

    console.log(`🤖 Calling OpenAI for email personalization (sequence ${sequenceNumber})...`);
    console.log(`📧 Contact: ${contact.first_name} ${contact.last_name} (${contact.email})`);
    console.log(`📝 Subject Prompt: ${subjectTemplate.substring(0, 100)}...`);
    console.log(`📝 Body Prompt: ${bodyTemplate.substring(0, 100)}...`);

    // OpenAI API Call
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Cost-efficient & fast
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_email",
              description: "Generiere einen komplett neuen, personalisierten E-Mail-Betreff und -Inhalt basierend auf den Anweisungen",
              parameters: {
                type: "object",
                properties: {
                  subject: { 
                    type: "string",
                    description: "Der personalisierte E-Mail-Betreff (NEU geschrieben basierend auf Betreff-Prompt)"
                  },
                  body: { 
                    type: "string",
                    description: "Der vollständige, personalisierte E-Mail-Inhalt als HTML (NEU geschrieben basierend auf E-Mail-Prompt)"
                  }
                },
                required: ["subject", "body"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { 
          type: "function", 
          function: { name: "generate_email" } 
        },
        max_completion_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("📨 OpenAI Response received");
    
    // Parse Tool Call Response
    const toolCall = data.choices[0].message.tool_calls?.[0];
    if (!toolCall) {
      console.error("❌ No tool call in OpenAI response:", JSON.stringify(data));
      throw new Error("No tool call in OpenAI response");
    }

    const result = JSON.parse(toolCall.function.arguments);
    
    console.log("✅ OpenAI personalization successful");
    console.log(`📧 Generated Subject: ${result.subject}`);
    console.log(`📝 Generated Body Preview: ${result.body.substring(0, 150)}...`);

    return {
      subject: result.subject,
      body: result.body + emailSignature,
    };

  } catch (error) {
    console.error("❌ KRITISCHER FEHLER in OpenAI personalization:", error);
    console.error("❌ Fehler-Details:", error.message);
    
    // Re-throw error instead of falling back silently
    throw new Error(`E-Mail-Personalisierung fehlgeschlagen: ${error.message}`);
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
    
    // Better error message for expired tokens
    if (response.status === 401) {
      throw new Error("MS365 Token abgelaufen - bitte MS365 neu verbinden");
    }
    
    throw new Error(`Failed to send email via MS365: ${response.status}`);
  }
}

/**
 * Generate fallback HTML signature if user hasn't defined one
 */
function generateFallbackSignature(
  firstName: string,
  lastName: string,
  company: string,
  email: string
): string {
  return `
<br><br>
<p>Beste Grüße<br>
<strong>${firstName} ${lastName}</strong><br>
${company}<br>
<a href="mailto:${email}">${email}</a></p>
  `.trim();
}
