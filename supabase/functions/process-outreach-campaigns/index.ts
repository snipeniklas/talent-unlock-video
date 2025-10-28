import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MAX_EMAILS_PER_SEQUENCE_PER_DAY = 10; // Max 10 emails per sequence per day

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

    // Parse request body for immediate flag and optional campaignId
    const requestBody = await req.json().catch(() => ({}));
    const immediate = requestBody.immediate || false;
    const campaignId = requestBody.campaignId;
    
    if (immediate) {
      console.log("⚡ IMMEDIATE MODE - Processing now regardless of next_send_date");
    }

    const now = new Date();
    console.log(`⏰ Current time: ${now.toISOString()}`);

    // Get active campaigns
    let campaignQuery = supabase
      .from("outreach_campaigns")
      .select(`
        *,
        outreach_email_sequences(*)
      `)
      .eq("status", "active");
    
    // Filter by next_send_date unless immediate mode
    if (!immediate) {
      campaignQuery = campaignQuery.lte("next_send_date", now.toISOString());
    }
    
    if (campaignId) {
      campaignQuery = campaignQuery.eq("id", campaignId);
    }
    
    const { data: allCampaigns, error: campaignsError } = await campaignQuery;

    if (campaignsError) {
      console.error("Error fetching campaigns:", campaignsError);
      throw campaignsError;
    }

    if (!allCampaigns || allCampaigns.length === 0) {
      console.log("ℹ️ No active campaigns found");
      return new Response(
        JSON.stringify({ message: "No active campaigns" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!allCampaigns || allCampaigns.length === 0) {
      console.log("ℹ️ No campaigns due for processing");
      return new Response(
        JSON.stringify({ message: "No campaigns to process" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`✅ Processing ${allCampaigns.length} campaign(s)`);

    // STARTUP VALIDATION: Auto-fix any stuck "processing" contacts
    console.log(`🔧 Running startup validation to fix any stuck 'processing' contacts...`);
    
    const { data: stuckContacts, error: stuckError } = await supabase
      .from("outreach_campaign_contacts")
      .select("id, status, contact_id, crm_contacts(email)")
      .in("campaign_id", allCampaigns.map(c => c.id))
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

    for (const campaign of allCampaigns) {
      console.log(`\n=== Processing Campaign: ${campaign.name} (ID: ${campaign.id}) ===`);

      // Fetch ALL due contacts for this campaign (new + follow-ups)
      const { data: allDueContacts, error: contactsError } = await supabase
        .from("outreach_campaign_contacts")
        .select("*, crm_contacts(*)")
        .eq("campaign_id", campaign.id)
        .eq("status", "pending")
        .eq("is_excluded", false)
        .or(`next_sequence_number.eq.1,and(next_sequence_number.gt.1,next_send_date.lte.${now.toISOString()})`)
        .order("next_sequence_number", { ascending: true })
        .order("added_at", { ascending: true });

      if (contactsError) {
        console.error(`Error fetching contacts:`, contactsError);
        continue;
      }

      // Group by sequence and limit each sequence to MAX_EMAILS_PER_SEQUENCE_PER_DAY
      const contactsBySequence = new Map<number, any[]>();

      for (const contact of allDueContacts || []) {
        const seqNum = contact.next_sequence_number || 1;
        if (!contactsBySequence.has(seqNum)) {
          contactsBySequence.set(seqNum, []);
        }
        
        const seqContacts = contactsBySequence.get(seqNum)!;
        if (seqContacts.length < MAX_EMAILS_PER_SEQUENCE_PER_DAY) {
          seqContacts.push(contact);
        }
      }

      // Flatten back to a single list
      const contactsToProcess = Array.from(contactsBySequence.values()).flat();

      console.log(`📊 Campaign "${campaign.name}":`);
      for (const [seqNum, contacts] of contactsBySequence.entries()) {
        console.log(`  - Sequenz ${seqNum}: ${contacts.length} E-Mails`);
      }
      console.log(`  - Total: ${contactsToProcess.length} E-Mails`);

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
      for (const contactEntry of contactsToProcess) {
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
          // Use campaign's daily_send_time to schedule at exact same time each day
          const allSequences = campaign.outreach_email_sequences || [];
          const nextSeqNum = nextSequenceNumber + 1;
          const subsequentSequence = allSequences.find((s: any) => s.sequence_number === nextSeqNum);

          let nextSendDate = null;
          if (subsequentSequence) {
            // Calculate date: today + delay_days
            const sendDate = new Date();
            sendDate.setDate(sendDate.getDate() + subsequentSequence.delay_days);
            
            // Set exact time from campaign's daily_send_time
            if (campaign.daily_send_time) {
              const [hour, minute, second] = campaign.daily_send_time.split(':').map(Number);
              sendDate.setUTCHours(hour, minute, second || 0, 0);
            }
            
            nextSendDate = sendDate.toISOString();
            console.log(`📅 Next email (#${nextSeqNum}) scheduled for ${nextSendDate} (${subsequentSequence.delay_days} days from now at ${campaign.daily_send_time})`);
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

      // After processing all contacts in this campaign, update next_send_date
      const nextSendDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // +24h
      await supabase
        .from("outreach_campaigns")
        .update({ next_send_date: nextSendDate.toISOString() })
        .eq("id", campaign.id);

      console.log(`📅 Next send for "${campaign.name}": ${nextSendDate.toISOString()}`);
    }

    console.log(`✅ Outreach processing completed. Total emails sent: ${totalEmailsSent}`);

    return new Response(
      JSON.stringify({ 
        message: "Outreach processing completed",
        emails_sent: totalEmailsSent,
        campaigns_processed: allCampaigns.length
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
    
    // Load research data for this contact (if available)
    let researchContext = "";
    const { data: researchData } = await supabase
      .from('crm_contact_research')
      .select('contact_research_data, company_research_data')
      .eq('contact_id', contact.id)
      .maybeSingle();

    if (researchData) {
      const contactResearch = researchData.contact_research_data;
      const companyResearch = researchData.company_research_data;
      
      let contactInfo = "";
      let companyInfo = "";
      
      // Parse Contact Research
      if (contactResearch && Object.keys(contactResearch).length > 0) {
        contactInfo = `
KONTAKT RESEARCH-DATEN:
${contactResearch.summary ? `- Zusammenfassung: ${contactResearch.summary}` : ''}
${contactResearch.professional_background ? `- Beruflicher Hintergrund: ${contactResearch.professional_background}` : ''}
${contactResearch.current_role_details ? `- Aktuelle Position: ${contactResearch.current_role_details}` : ''}
${contactResearch.recent_activities ? `- Aktuelle Aktivitäten: ${contactResearch.recent_activities}` : ''}
${contactResearch.key_facts ? `- Key Facts: ${Array.isArray(contactResearch.key_facts) ? contactResearch.key_facts.join(', ') : contactResearch.key_facts}` : ''}
${contactResearch.talking_points ? `- Gesprächsansätze: ${Array.isArray(contactResearch.talking_points) ? contactResearch.talking_points.join(', ') : contactResearch.talking_points}` : ''}
${contactResearch.interests ? `- Interessen: ${Array.isArray(contactResearch.interests) ? contactResearch.interests.join(', ') : contactResearch.interests}` : ''}
`;
      }
      
      // Parse Company Research
      if (companyResearch && Object.keys(companyResearch).length > 0) {
        companyInfo = `
UNTERNEHMENS RESEARCH-DATEN:
${companyResearch.company_overview ? `- Überblick: ${companyResearch.company_overview}` : ''}
${companyResearch.recent_news ? `- Aktuelle News: ${companyResearch.recent_news}` : ''}
${companyResearch.products_services ? `- Produkte & Services: ${companyResearch.products_services}` : ''}
${companyResearch.growth_signals ? `- Wachstumssignale: ${Array.isArray(companyResearch.growth_signals) ? companyResearch.growth_signals.join(', ') : companyResearch.growth_signals}` : ''}
${companyResearch.pain_points ? `- Potenzielle Pain Points: ${Array.isArray(companyResearch.pain_points) ? companyResearch.pain_points.join(', ') : companyResearch.pain_points}` : ''}
${companyResearch.competitors ? `- Wettbewerber: ${Array.isArray(companyResearch.competitors) ? companyResearch.competitors.join(', ') : companyResearch.competitors}` : ''}
`;
      }
      
      if (contactInfo || companyInfo) {
        researchContext = `
${contactInfo}
${companyInfo}

⭐ WICHTIG: Nutze diese Research-Daten für eine hochgradig personalisierte E-Mail!
- Beziehe dich auf spezifische Details aus der Research
- Nutze Talking Points als natürliche Gesprächseinstiege
- Adressiere relevante Pain Points des Unternehmens
- Erwähne aktuelle Entwicklungen/News wenn relevant
`;
      }
    }

    // Create prompt for OpenAI
    const systemPrompt = `Du bist ein Experte für B2B E-Mail-Verfassung und Personalisierung.

Deine Aufgabe: Schreibe eine KOMPLETT NEUE, individuell personalisierte E-Mail basierend auf:
1. E-Mail-Prompts (Anweisungen WIE die E-Mail geschrieben werden soll)
2. Kontakt-Informationen (Name, Position, Unternehmen, Branche)
3. Absender-Unternehmen (Firma, Wertversprechen)
4. Kampagnen-Kontext (Zielgruppe, CTA, AI-Anweisungen)
5. Optional: Research-Daten über den Kontakt UND dessen Unternehmen

WICHTIG - DIE PROMPTS SIND ANWEISUNGEN, KEINE VORLAGEN:
- Die "Prompts" sind ANWEISUNGEN, keine Texte zum Kopieren
- Schreibe die E-Mail KOMPLETT NEU basierend auf diesen Anweisungen
- Personalisiere JEDEN Aspekt der E-Mail für den spezifischen Kontakt
- Nutze die Kontakt- und Research-Daten für maximale Relevanz
- KEINE Variablen wie {{first_name}} verwenden - schreibe alles direkt
- Nutze das Wertversprechen des Absender-Unternehmens intelligent
- Falls Research-Daten vorhanden sind, nutze sie GEZIELT für spezifische Anknüpfungspunkte
- Beziehe dich auf konkrete Details aus der Research (aktuelle Aktivitäten, News, Pain Points)
- Verwende Talking Points als natürliche Gesprächseinstiege

FORMATIERUNGS-ANFORDERUNGEN:
- Generiere HTML-formatierte E-Mail-Inhalte (NUR Content, KEINE vollständige HTML-Struktur)
- Nutze <p> Tags für Absätze
- Nutze <br> für Zeilenumbrüche innerhalb von Absätzen
- Füge KEINE <html>, <head> oder <body> Tags hinzu
- Halte die Formatierung sauber und professionell

KRITISCH - SIGNATUR UND GRUßFORMEL:
- Füge KEINE Grußformel hinzu (KEIN "Mit besten Grüßen", "Mit freundlichen Grüßen", "Viele Grüße", etc.)
- Füge KEINE Signatur hinzu (KEIN Name, KEINE Kontaktdaten, KEIN Firmenname am Ende)
- Die E-Mail endet DIREKT mit dem Call-to-Action
- Die Signatur wird automatisch aus der Datenbank angehängt
- Schreibe NICHTS nach dem CTA

Beispiel-Output (ENDET mit CTA, KEINE Signatur):
<p>Guten Tag Herr Müller,</p>
<p>als CTO bei TechCorp kennen Sie sicherlich die Herausforderungen bei der Skalierung von Entwicklerteams. Genau hier setzen wir an.</p>
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
- ENDE direkt nach dem CTA - keine Signatur!
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
