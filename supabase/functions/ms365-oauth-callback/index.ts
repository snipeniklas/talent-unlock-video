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
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state"); // user_id
    const error = url.searchParams.get("error");

    if (error) {
      throw new Error(`OAuth error: ${error}`);
    }

    if (!code || !state) {
      throw new Error("Missing code or state parameter");
    }

    const clientId = Deno.env.get("MS365_CLIENT_ID")!;
    const clientSecret = Deno.env.get("MS365_CLIENT_SECRET")!;
    const tenantId = Deno.env.get("MS365_TENANT_ID")!;
    const redirectUri = "https://hejtalent.de/admin/ms365-callback";

    // Exchange code for tokens
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        scope: "offline_access https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Mail.ReadWrite https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/User.Read",
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token exchange failed:", errorText);
      throw new Error("Failed to exchange authorization code");
    }

    const tokenData = await tokenResponse.json();
    console.log("Token exchange successful");

    // Get user's email address
    const graphResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!graphResponse.ok) {
      throw new Error("Failed to fetch user info from Microsoft Graph");
    }

    const userData = await graphResponse.json();
    console.log("User email:", userData.mail || userData.userPrincipalName);

    // Store tokens in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    const { error: dbError } = await supabase
      .from("ms365_tokens")
      .upsert({
        user_id: state,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt.toISOString(),
        email_address: userData.mail || userData.userPrincipalName,
      }, {
        onConflict: "user_id,email_address"
      });

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to store tokens");
    }

    console.log("Tokens stored successfully");

    // Create webhook subscription
    const subscriptionResponse = await fetch("https://pcbpxhzaajbycxwompif.supabase.co/functions/v1/ms365-create-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokenData.access_token}`,
      },
      body: JSON.stringify({
        userId: state,
        accessToken: tokenData.access_token,
      }),
    });

    if (!subscriptionResponse.ok) {
      console.error("Failed to create webhook subscription");
    } else {
      console.log("Webhook subscription created successfully");
    }

    // Redirect back to CRM with success
    return new Response(null, {
      status: 302,
      headers: {
        Location: "https://hejtalent.de/admin/crm/contacts?ms365=connected",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in MS365 OAuth callback:", error);
    return new Response(null, {
      status: 302,
      headers: {
        Location: `https://hejtalent.de/admin/crm/contacts?error=${encodeURIComponent(error.message)}`,
        ...corsHeaders,
      },
    });
  }
};

serve(handler);
