import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contact_id } = await req.json();
    
    if (!contact_id) {
      throw new Error('contact_id is required');
    }

    // Initialize Supabase Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Load contact data
    const { data: contact, error: contactError } = await supabase
      .from('crm_contacts')
      .select(`
        *,
        crm_companies (
          name,
          website,
          industry
        )
      `)
      .eq('id', contact_id)
      .single();

    if (contactError || !contact) {
      throw new Error('Contact not found');
    }

    // Get API Keys
    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY');
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!perplexityKey) {
      throw new Error('PERPLEXITY_API_KEY not configured');
    }
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const companyName = contact.crm_companies?.name || 'Unbekanntes Unternehmen';
    const companyIndustry = contact.crm_companies?.industry || '';
    const fullName = `${contact.first_name} ${contact.last_name}`;
    const position = contact.position || '';
    
    // === CONTACT RESEARCH ===
    const contactPrompt = `
Recherchiere folgende Person für B2B Outreach:

Name: ${fullName}
Position: ${position}
Unternehmen: ${companyName}

Bitte finde und strukturiere folgende Informationen:

1. PROFESSIONAL SUMMARY (2-3 Sätze über die Person)
2. BERUFLICHER HINTERGRUND (Werdegang, Expertise, Verantwortungsbereiche)
3. AKTUELLE AKTIVITÄTEN (News, LinkedIn Posts, Interviews, etc. aus den letzten 6 Monaten)
4. INTERESSEN & FOKUSTHEMEN (Technologien, Trends, Themen die die Person beschäftigen)
5. KEY FACTS (3-5 wichtige Fakten als Bullet Points)
6. TALKING POINTS (3-5 konkrete Anknüpfungspunkte für ein erstes Gespräch)
7. SOCIAL PROFILES (LinkedIn, Twitter, GitHub URLs falls verfügbar)

Formatiere die Antwort klar strukturiert mit Überschriften.
    `.trim();

    console.log('Starting contact research for:', fullName);

    const contactResearchResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein professioneller B2B Research Assistent. Recherchiere gründlich und strukturiere die Informationen klar.'
          },
          {
            role: 'user',
            content: contactPrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2000,
      }),
    });

    if (!contactResearchResponse.ok) {
      const errorText = await contactResearchResponse.text();
      console.error('Perplexity API error (contact):', contactResearchResponse.status, errorText);
      throw new Error(`Perplexity API error (contact): ${contactResearchResponse.status}`);
    }

    const contactData = await contactResearchResponse.json();
    const rawContactResearch = contactData.choices[0].message.content;

    // === COMPANY RESEARCH ===
    const companyPrompt = `
Recherchiere folgendes Unternehmen für B2B Outreach:

Unternehmen: ${companyName}
Branche: ${companyIndustry}
Website: ${contact.crm_companies?.website || ''}

Bitte finde und strukturiere folgende Informationen:

1. COMPANY OVERVIEW (Was macht das Unternehmen, Mission, Vision)
2. PRODUCTS & SERVICES (Hauptprodukte/Dienstleistungen)
3. COMPANY SIZE & STRUCTURE (Mitarbeiteranzahl, Standorte, Struktur)
4. RECENT NEWS & DEVELOPMENTS (Aktuelle News, Produktlaunches, Finanzierungen aus den letzten 6 Monaten)
5. CHALLENGES & PAIN POINTS (Typische Herausforderungen in der Branche)
6. TECHNOLOGY STACK (Verwendete Technologien falls bekannt)
7. KEY FACTS (3-5 wichtige Fakten als Bullet Points)
8. BUSINESS OPPORTUNITIES (Mögliche Ansatzpunkte für Zusammenarbeit)

Formatiere die Antwort klar strukturiert mit Überschriften.
    `.trim();

    console.log('Starting company research for:', companyName);

    const companyResearchResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein professioneller B2B Research Assistent. Recherchiere gründlich und strukturiere die Informationen klar.'
          },
          {
            role: 'user',
            content: companyPrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2000,
      }),
    });

    if (!companyResearchResponse.ok) {
      const errorText = await companyResearchResponse.text();
      console.error('Perplexity API error (company):', companyResearchResponse.status, errorText);
      throw new Error(`Perplexity API error (company): ${companyResearchResponse.status}`);
    }

    const companyData = await companyResearchResponse.json();
    const rawCompanyResearch = companyData.choices[0].message.content;

    console.log('Both researches completed, structuring data...');

    // === Structure Contact Data ===
    const contactStructurePrompt = `
Analysiere folgenden Research-Text und extrahiere die Informationen in folgendes JSON-Format:

{
  "summary": "2-3 Sätze Zusammenfassung",
  "professional_background": "Beruflicher Werdegang Text",
  "recent_activities": "Aktuelle Aktivitäten Text",
  "interests": "Interessen und Fokusthemen Text",
  "key_facts": ["Fakt 1", "Fakt 2", "Fakt 3"],
  "talking_points": ["Punkt 1", "Punkt 2", "Punkt 3"],
  "social_profiles": {
    "linkedin": "vollständige LinkedIn URL oder null",
    "twitter": "vollständige Twitter URL oder null",
    "xing": "vollständige Xing URL oder null",
    "github": "vollständige GitHub URL oder null"
  }
}

Research-Text:
${rawContactResearch}

Antworte NUR mit dem JSON-Objekt, ohne zusätzlichen Text.
    `.trim();

    const contactOpenaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Du bist ein JSON-Extraktions-Assistent.' },
          { role: 'user', content: contactStructurePrompt }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 2000,
      }),
    });

    if (!contactOpenaiResponse.ok) {
      throw new Error(`OpenAI API error (contact): ${contactOpenaiResponse.status}`);
    }

    const contactOpenaiData = await contactOpenaiResponse.json();
    const structuredContactData = JSON.parse(contactOpenaiData.choices[0].message.content);

    // === Structure Company Data ===
    const companyStructurePrompt = `
Analysiere folgenden Research-Text und extrahiere die Informationen in folgendes JSON-Format:

{
  "overview": "Company overview Text",
  "products_services": "Products & services Text",
  "size_structure": "Company size & structure Text",
  "recent_news": "Recent news & developments Text",
  "challenges": "Challenges & pain points Text",
  "technology_stack": "Technology stack Text",
  "key_facts": ["Fakt 1", "Fakt 2", "Fakt 3"],
  "opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"]
}

Research-Text:
${rawCompanyResearch}

Antworte NUR mit dem JSON-Objekt, ohne zusätzlichen Text.
    `.trim();

    const companyOpenaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Du bist ein JSON-Extraktions-Assistent.' },
          { role: 'user', content: companyStructurePrompt }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 2000,
      }),
    });

    if (!companyOpenaiResponse.ok) {
      throw new Error(`OpenAI API error (company): ${companyOpenaiResponse.status}`);
    }

    const companyOpenaiData = await companyOpenaiResponse.json();
    const structuredCompanyData = JSON.parse(companyOpenaiData.choices[0].message.content);

    console.log('Research data structured, saving to database...');

    // Get user ID from auth header
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    // Save to database (UPSERT)
    const { error: saveError } = await supabase
      .from('crm_contact_research')
      .upsert({
        contact_id: contact_id,
        contact_research_data: structuredContactData,
        company_research_data: structuredCompanyData,
        researched_by: userId,
        researched_at: new Date().toISOString(),
      }, {
        onConflict: 'contact_id'
      });

    if (saveError) {
      console.error('Error saving research:', saveError);
      throw new Error('Failed to save research data');
    }

    console.log('Research completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          contact: structuredContactData,
          company: structuredCompanyData
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in research-contact:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
