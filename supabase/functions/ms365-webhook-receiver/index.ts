import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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

async function getAccessToken(userId: string): Promise<string | null> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await supabase
    .from("ms365_tokens")
    .select("access_token, refresh_token, expires_at")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    console.error("Failed to get access token:", error);
    return null;
  }

  // Check if token is expired
  const expiresAt = new Date(data.expires_at);
  if (expiresAt < new Date()) {
    console.log("Token expired, refreshing...");
    // TODO: Implement token refresh
    return null;
  }

  return data.access_token;
}

async function fetchEmailDetails(accessToken: string, messageId: string) {
  const url = `https://graph.microsoft.com/v1.0/me/messages/${messageId}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch email: ${response.status}`);
  }

  return await response.json();
}

async function matchEmailToContact(fromEmail: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await supabase
    .from("crm_contacts")
    .select("id")
    .eq("email", fromEmail)
    .single();

  if (error || !data) {
    console.log("No matching contact found for:", fromEmail);
    return null;
  }

  return data.id;
}

async function storeEmail(emailData: any, contactId: string | null, userId: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { error } = await supabase
    .from("crm_emails")
    .insert({
      user_id: userId,
      contact_id: contactId,
      ms365_message_id: emailData.id,
      subject: emailData.subject,
      from_email: emailData.from?.emailAddress?.address,
      from_name: emailData.from?.emailAddress?.name,
      to_emails: emailData.toRecipients?.map((r: any) => r.emailAddress.address),
      cc_emails: emailData.ccRecipients?.map((r: any) => r.emailAddress.address),
      body_preview: emailData.bodyPreview,
      body_content: emailData.body?.content,
      received_at: emailData.receivedDateTime,
      has_attachments: emailData.hasAttachments,
      is_read: emailData.isRead,
      importance: emailData.importance,
      conversation_id: emailData.conversationId,
    });

  if (error) {
    console.error("Failed to store email:", error);
    throw error;
  }

  console.log("Email stored successfully for user:", userId);
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

      try {
        const userId = notification.clientState;
        if (!userId) {
          console.error("No user ID in notification");
          continue;
        }

        // Get access token for this user
        const accessToken = await getAccessToken(userId);
        if (!accessToken) {
          console.error("Failed to get access token for user:", userId);
          continue;
        }

        // Extract message ID from resource
        const messageId = notification.resourceData?.id;
        if (!messageId) {
          console.error("No message ID in notification");
          continue;
        }

        // Fetch full email details
        console.log("Fetching email details for message:", messageId);
        const emailData = await fetchEmailDetails(accessToken, messageId);

        // Match email to CRM contact
        const fromEmail = emailData.from?.emailAddress?.address;
        const contactId = fromEmail ? await matchEmailToContact(fromEmail) : null;

        // Store email in database with user_id
        await storeEmail(emailData, contactId, userId);

        console.log("Email processed and stored successfully");
        
        // Supabase Realtime will automatically notify frontend
      } catch (error) {
        console.error("Error processing notification:", error);
        // Continue with next notification
      }
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
