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

    // Get Perplexity API Key
    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityKey) {
      throw new Error('PERPLEXITY_API_KEY not configured');
    }

    // Build research prompt
    const companyName = contact.crm_companies?.name || 'Unbekanntes Unternehmen';
    const companyIndustry = contact.crm_companies?.industry || '';
    const fullName = `${contact.first_name} ${contact.last_name}`;
    const position = contact.position || '';
    
    const researchPrompt = `
Recherchiere folgende Person für B2B Outreach:

Name: ${fullName}
Position: ${position}
Unternehmen: ${companyName}
Branche: ${companyIndustry}

Bitte finde und strukturiere folgende Informationen:

1. PROFESSIONAL SUMMARY (2-3 Sätze über die Person)
2. BERUFLICHER HINTERGRUND (Werdegang, Expertise, Verantwortungsbereiche)
3. UNTERNEHMENSINFOS (Was macht das Unternehmen, Größe, Besonderheiten)
4. AKTUELLE AKTIVITÄTEN (News, LinkedIn Posts, Interviews, etc. aus den letzten 6 Monaten)
5. INTERESSEN & FOKUSTHEMEN (Technologien, Trends, Themen die die Person beschäftigen)
6. KEY FACTS (3-5 wichtige Fakten als Bullet Points)
7. TALKING POINTS (3-5 konkrete Anknüpfungspunkte für ein erstes Gespräch)
8. SOCIAL PROFILES (LinkedIn, Twitter, GitHub URLs falls verfügbar)

Formatiere die Antwort klar strukturiert mit Überschriften. Falls keine Informationen gefunden werden, gib das ehrlich an.
    `.trim();

    console.log('Starting Perplexity research for:', fullName);

    // Perplexity API Call
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein professioneller B2B Research Assistent. Recherchiere gründlich und strukturiere die Informationen klar.'
          },
          {
            role: 'user',
            content: researchPrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2000,
      }),
    });

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text();
      console.error('Perplexity API error:', perplexityResponse.status, errorText);
      throw new Error(`Perplexity API error: ${perplexityResponse.status}`);
    }

    const perplexityData = await perplexityResponse.json();
    const rawResearch = perplexityData.choices[0].message.content;

    console.log('Perplexity research completed, parsing results...');

    // Convert research text to structured JSON using OpenAI
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const structurePrompt = `
Analysiere folgenden Research-Text und extrahiere die Informationen in folgendes JSON-Format:

{
  "summary": "2-3 Sätze Zusammenfassung",
  "professional_background": "Beruflicher Werdegang Text",
  "company_info": "Unternehmensinfos Text",
  "recent_activities": "Aktuelle Aktivitäten Text",
  "interests": "Interessen und Fokusthemen Text",
  "key_facts": ["Fakt 1", "Fakt 2", "Fakt 3"],
  "talking_points": ["Punkt 1", "Punkt 2", "Punkt 3"],
  "social_profiles": {
    "linkedin": "URL oder null",
    "twitter": "URL oder null",
    "github": "URL oder null"
  }
}

Research-Text:
${rawResearch}

Antworte NUR mit dem JSON-Objekt, ohne zusätzlichen Text.
    `.trim();

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Du bist ein JSON-Extraktions-Assistent.' },
          { role: 'user', content: structurePrompt }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 2000,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', openaiResponse.status, errorText);
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const structuredData = JSON.parse(openaiData.choices[0].message.content);

    console.log('Research data structured, saving to database...');

    // Get user ID from auth header for researched_by
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
        research_data: structuredData,
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
        data: structuredData
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
