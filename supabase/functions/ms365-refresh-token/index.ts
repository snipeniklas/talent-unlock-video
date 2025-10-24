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
    const { userId } = await req.json();

    if (!userId) {
      throw new Error("userId is required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the current token
    const { data: tokenData, error: tokenError } = await supabase
      .from("ms365_tokens")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (tokenError || !tokenData) {
      console.error("Token not found for user:", userId);
      throw new Error("No MS365 token found for user");
    }

    // Check if token is expired or will expire in the next 5 minutes
    const expiresAt = new Date(tokenData.expires_at);
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    if (expiresAt > fiveMinutesFromNow) {
      console.log("Token is still valid, no refresh needed");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Token is still valid",
          accessToken: tokenData.access_token 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Token expired or expiring soon, refreshing...");

    const clientId = Deno.env.get("MS365_CLIENT_ID")!;
    const clientSecret = Deno.env.get("MS365_CLIENT_SECRET")!;
    const tenantId = Deno.env.get("MS365_TENANT_ID")!;

    // Refresh the token
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: tokenData.refresh_token,
        grant_type: "refresh_token",
        scope: "offline_access https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Mail.ReadWrite https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/User.Read",
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token refresh failed:", errorText);
      throw new Error("Failed to refresh token");
    }

    const newTokenData = await tokenResponse.json();
    const newExpiresAt = new Date(Date.now() + newTokenData.expires_in * 1000);

    console.log("Token refreshed successfully");

    // Update the token in the database
    const { error: updateError } = await supabase
      .from("ms365_tokens")
      .update({
        access_token: newTokenData.access_token,
        refresh_token: newTokenData.refresh_token || tokenData.refresh_token, // Use new refresh token if provided
        expires_at: newExpiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("email_address", tokenData.email_address);

    if (updateError) {
      console.error("Failed to update token in database:", updateError);
      throw new Error("Failed to update token");
    }

    console.log("✅ Token refresh successful for user:", userId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Token refreshed successfully",
        accessToken: newTokenData.access_token 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in token refresh:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
};

serve(handler);
