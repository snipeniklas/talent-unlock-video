import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting research queue processing...');

    // Fetch up to 15 pending contacts for faster processing
    const { data: pendingContacts, error: fetchError } = await supabase
      .from('crm_contacts')
      .select('id, email, first_name, last_name')
      .eq('research_status', 'pending')
      .not('email', 'is', null)
      .limit(15);

    if (fetchError) {
      console.error('Error fetching pending contacts:', fetchError);
      throw fetchError;
    }

    if (!pendingContacts || pendingContacts.length === 0) {
      console.log('No pending contacts to process');
      return new Response(
        JSON.stringify({ message: 'No pending contacts', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${pendingContacts.length} contacts to process`);

    const contactIds = pendingContacts.map(c => c.id);

    // Mark contacts as processing
    const { error: updateError } = await supabase
      .from('crm_contacts')
      .update({ 
        research_status: 'processing',
        research_last_attempt: new Date().toISOString()
      })
      .in('id', contactIds);

    if (updateError) {
      console.error('Error updating contact status to processing:', updateError);
    }

    let successCount = 0;
    let failureCount = 0;

    // Process each contact sequentially with delay
    for (const contact of pendingContacts) {
      try {
        console.log(`Processing research for contact ${contact.id} (${contact.email})`);

        // Call research-contact function
        const { data: researchData, error: researchError } = await supabase.functions.invoke(
          'research-contact',
          {
            body: { contact_id: contact.id }
          }
        );

        if (researchError) {
          throw researchError;
        }

        // Update contact status to completed
        const { error: completeError } = await supabase
          .from('crm_contacts')
          .update({ 
            research_status: 'completed',
            research_last_attempt: new Date().toISOString()
          })
          .eq('id', contact.id);

        if (completeError) {
          console.error(`Error marking contact ${contact.id} as completed:`, completeError);
        }

        successCount++;
        console.log(`Successfully completed research for contact ${contact.id}`);

        // Delay between requests to avoid rate limits (1 second for faster processing)
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Failed to research contact ${contact.id}:`, error);
        failureCount++;

        // Get current retry count
        const { data: contactData } = await supabase
          .from('crm_contacts')
          .select('research_retry_count')
          .eq('id', contact.id)
          .single();

        const retryCount = (contactData?.research_retry_count || 0) + 1;
        const maxRetries = 3;

        // Update status based on retry count
        const newStatus = retryCount >= maxRetries ? 'failed' : 'pending';

        const { error: failError } = await supabase
          .from('crm_contacts')
          .update({ 
            research_status: newStatus,
            research_retry_count: retryCount,
            research_last_attempt: new Date().toISOString()
          })
          .eq('id', contact.id);

        if (failError) {
          console.error(`Error updating failed contact ${contact.id}:`, failError);
        }

        console.log(`Contact ${contact.id} marked as ${newStatus} (retry ${retryCount}/${maxRetries})`);

        // Continue with next contact after short delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const result = {
      message: 'Queue processing completed',
      processed: pendingContacts.length,
      successful: successCount,
      failed: failureCount
    };

    console.log('Queue processing result:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-research-queue:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
