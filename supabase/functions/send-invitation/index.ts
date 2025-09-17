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
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>HejTalent - Einladung zu ${companyName}</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 10px 15px -3px rgba(70, 79, 108, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #4D64ED, #4053d6); padding: 32px 24px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.025em;">
                HejTalent
              </h1>
              <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 8px 0 0 0;">
                Professionelle Talentakquise
              </p>
            </div>
            
            <!-- Content -->
            <div style="padding: 32px 24px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-block; background-color: #f0f8ff; padding: 16px; border-radius: 50%; margin-bottom: 16px;">
                  <span style="font-size: 32px;">🎉</span>
                </div>
                <h2 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 8px 0;">
                  Sie wurden eingeladen!
                </h2>
                <p style="color: #64748b; font-size: 16px; margin: 0;">
                  Willkommen bei der HejTalent Platform
                </p>
              </div>
              
              <!-- Invitation Info -->
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 32px; text-align: center;">
                <p style="color: #374151; font-size: 16px; margin: 0 0 8px 0;">
                  Sie wurden eingeladen, dem Unternehmen
                </p>
                <h3 style="color: #1e293b; font-size: 20px; font-weight: 700; margin: 0 0 16px 0;">
                  ${companyName}
                </h3>
                <p style="color: #64748b; font-size: 14px; margin: 0;">
                  auf der HejTalent-Plattform beizutreten
                </p>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #4D64ED, #4053d6); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(77, 100, 237, 0.25); transition: all 0.3s ease;">
                  Konto erstellen
                </a>
              </div>
              
              <!-- Validity Notice -->
              <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border: 1px solid #f9d71c; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0;">
                <p style="color: #92400e; font-weight: 500; margin: 0; font-size: 14px;">
                  ⏰ Diese Einladung ist 7 Tage gültig
                </p>
              </div>
              
              <!-- Link Alternative -->
              <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="color: #64748b; font-size: 14px; margin: 0 0 8px 0; text-align: center;">
                  Falls der Button nicht funktioniert, kopieren Sie diesen Link:
                </p>
                <p style="color: #4D64ED; font-size: 12px; word-break: break-all; text-align: center; margin: 0;">
                  ${inviteUrl}
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 8px 0;">
                Mit freundlichen Grüßen
              </p>
              <p style="color: #1e293b; font-weight: 600; font-size: 14px; margin: 0 0 16px 0;">
                Ihr HejTalent Team
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                © 2024 HejTalent - Professionelle Talentakquise
              </p>
            </div>
          </div>
        </body>
        </html>
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