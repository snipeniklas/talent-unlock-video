import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WebhookNotification {
  subscriptionId: string;
  changeType: string;
  clientState?: string;
  resource: string;
  resourceData?: {
    "@odata.type": string;
    "@odata.id": string;
    "@odata.etag": string;
    id: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log("MS365 Webhook Request received:", req.method);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Microsoft sends a validation token when setting up the subscription
    const url = new URL(req.url);
    const validationToken = url.searchParams.get("validationToken");

    if (validationToken) {
      console.log("Webhook validation request received");
      // Microsoft expects a 200 OK response with the validation token as plain text
      return new Response(validationToken, {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
          ...corsHeaders,
        },
      });
    }

    // Handle actual webhook notifications
    const body = await req.json();
    console.log("Webhook notification received:", JSON.stringify(body, null, 2));

    const notifications: WebhookNotification[] = body.value || [];

    for (const notification of notifications) {
      console.log(`Processing notification for resource: ${notification.resource}`);
      console.log(`Change type: ${notification.changeType}`);
      console.log(`Subscription ID: ${notification.subscriptionId}`);

      // TODO: Process the notification
      // 1. Fetch the full email details from Microsoft Graph API
      // 2. Match email to CRM contacts
      // 3. Store in crm_emails table
      // 4. Supabase Realtime will automatically notify frontend
      
      // For now, just log the notification
      console.log("Notification processing would happen here");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: notifications.length 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in MS365 webhook receiver:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Failed to process webhook notification"
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
