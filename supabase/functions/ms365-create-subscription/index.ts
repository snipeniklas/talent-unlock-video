import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, accessToken } = await req.json();

    if (!userId || !accessToken) {
      throw new Error("Missing userId or accessToken");
    }

    const webhookUrl = "https://pcbpxhzaajbycxwompif.supabase.co/functions/v1/ms365-webhook-receiver";
    
    // Create subscription for new emails
    const subscriptionData = {
      changeType: "created",
      notificationUrl: webhookUrl,
      resource: "me/mailFolders('Inbox')/messages",
      expirationDateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
      clientState: userId, // Pass user ID for identification
    };

    console.log("Creating webhook subscription:", JSON.stringify(subscriptionData, null, 2));

    const response = await fetch("https://graph.microsoft.com/v1.0/subscriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(subscriptionData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to create subscription:", errorText);
      throw new Error(`Failed to create subscription: ${response.status} ${errorText}`);
    }

    const subscription = await response.json();
    console.log("Subscription created:", subscription);

    // Store subscription in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: dbError } = await supabase
      .from("ms365_subscriptions")
      .insert({
        user_id: userId,
        subscription_id: subscription.id,
        resource: subscription.resource,
        change_type: subscription.changeType,
        expires_at: subscription.expirationDateTime,
      });

    if (dbError) {
      console.error("Failed to store subscription:", dbError);
      throw new Error("Failed to store subscription in database");
    }

    console.log("Subscription stored in database");

    return new Response(
      JSON.stringify({ success: true, subscription }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in create subscription:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
