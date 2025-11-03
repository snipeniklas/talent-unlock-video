import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🧹 Starting cleanup of stuck processing contacts...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: Find processing contacts WITH research data and mark them as completed
    const { data: contactsWithResearch, error: findWithResearchError } = await supabase
      .from("crm_contacts")
      .select("id")
      .eq("research_status", "processing")
      .in("id", 
        supabase
          .from("crm_contact_research")
          .select("contact_id")
      );

    if (findWithResearchError) {
      console.error("Error finding contacts with research:", findWithResearchError);
    } else if (contactsWithResearch && contactsWithResearch.length > 0) {
      const contactIdsWithResearch = contactsWithResearch.map(c => c.id);
      
      const { error: updateCompletedError } = await supabase
        .from("crm_contacts")
        .update({ 
          research_status: "completed",
          updated_at: new Date().toISOString()
        })
        .in("id", contactIdsWithResearch);

      if (updateCompletedError) {
        console.error("Error updating contacts to completed:", updateCompletedError);
      } else {
        console.log(`✅ Set ${contactIdsWithResearch.length} contacts with research to completed`);
      }
    }

    // Step 2: Find processing contacts WITHOUT research data and reset them to pending
    const { data: allProcessing } = await supabase
      .from("crm_contacts")
      .select("id")
      .eq("research_status", "processing");

    const { data: withResearch } = await supabase
      .from("crm_contact_research")
      .select("contact_id");

    const researchContactIds = new Set(withResearch?.map(r => r.contact_id) || []);
    const contactsWithoutResearch = allProcessing?.filter(c => !researchContactIds.has(c.id)) || [];

    if (contactsWithoutResearch.length > 0) {
      const contactIdsWithoutResearch = contactsWithoutResearch.map(c => c.id);
      
      const { error: updatePendingError } = await supabase
        .from("crm_contacts")
        .update({ 
          research_status: "pending",
          research_retry_count: 0,
          updated_at: new Date().toISOString()
        })
        .in("id", contactIdsWithoutResearch);

      if (updatePendingError) {
        console.error("Error updating contacts to pending:", updatePendingError);
      } else {
        console.log(`✅ Reset ${contactIdsWithoutResearch.length} contacts without research to pending`);
      }
    }

    console.log("✅ Cleanup completed successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Stuck contacts cleaned up successfully",
        markedCompleted: contactsWithResearch?.length || 0,
        resetToPending: contactsWithoutResearch.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error during cleanup:", error);
    return new Response(
      JSON.stringify({ error: "Unexpected error", details: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
