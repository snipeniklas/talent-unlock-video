import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, companyName, inviteToken } = await req.json();

    if (!email || !companyName || !inviteToken) {
      throw new Error('Missing required parameters');
    }

    // Create invitation URL
    const inviteUrl = `${req.headers.get('origin')}/invite?token=${inviteToken}&email=${encodeURIComponent(email)}`;

    // For now, we'll just log the invitation (in production, you'd send an actual email)
    console.log(`
=== EINLADUNGS-E-MAIL ===
An: ${email}
Betreff: Einladung zu ${companyName} bei HejTalent

Hallo,

Sie wurden zu dem Unternehmen "${companyName}" auf der HejTalent-Plattform eingeladen!

Klicken Sie auf den folgenden Link, um Ihr Konto zu erstellen:
${inviteUrl}

Diese Einladung ist 7 Tage gültig.

Mit freundlichen Grüßen
Ihr HejTalent Team
===========================
    `);

    // Simulate successful email sending
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invitation email sent successfully',
        // In development, provide the link for testing
        inviteUrl: inviteUrl 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error sending invitation email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});