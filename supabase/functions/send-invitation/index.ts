import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "HejTalent <noreply@snipe-media.de>",
      to: [email],
      subject: `Einladung zu ${companyName} bei HejTalent`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Einladung zu HejTalent</h1>
          <p>Hallo,</p>
          <p>Sie wurden zu dem Unternehmen <strong>"${companyName}"</strong> auf der HejTalent-Plattform eingeladen!</p>
          <p>Klicken Sie auf den folgenden Button, um Ihr Konto zu erstellen:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${inviteUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Konto erstellen</a>
          </div>
          <p style="color: #666; font-size: 14px;">Diese Einladung ist 7 Tage gültig.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            Mit freundlichen Grüßen<br>
            Ihr HejTalent Team
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invitation email sent successfully',
        emailId: emailResponse.data?.id
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