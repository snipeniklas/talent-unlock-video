import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdminNotificationRequest {
  type: 'new_company' | 'new_search_request';
  data: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data }: AdminNotificationRequest = await req.json();

    if (!type || !data) {
      throw new Error('Missing required parameters');
    }

    // Get all admin users
    const { data: adminUsers, error: adminError } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        profiles!inner(email, first_name, last_name)
      `)
      .eq('role', 'admin');

    if (adminError) {
      throw new Error(`Failed to fetch admin users: ${adminError.message}`);
    }

    if (!adminUsers || adminUsers.length === 0) {
      console.log('No admin users found');
      return new Response(JSON.stringify({ success: true, message: 'No admins to notify' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const adminEmails = adminUsers.map(user => user.profiles.email).filter(Boolean);

    let subject = '';
    let htmlContent = '';

    if (type === 'new_company') {
      subject = `🎉 Neue Unternehmensregistrierung auf HejTalent`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            🎉 Neue Unternehmensregistrierung
          </h1>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #007bff; margin-top: 0;">Unternehmensinformationen:</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; font-weight: bold; width: 150px;">Firmenname:</td>
                <td style="padding: 8px;">${data.companyName || 'Nicht angegeben'}</td>
              </tr>
              <tr style="background-color: white;">
                <td style="padding: 8px; font-weight: bold;">E-Mail:</td>
                <td style="padding: 8px;">${data.companyEmail || 'Nicht angegeben'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Website:</td>
                <td style="padding: 8px;">${data.companyWebsite || 'Nicht angegeben'}</td>
              </tr>
              <tr style="background-color: white;">
                <td style="padding: 8px; font-weight: bold;">Ansprechpartner:</td>
                <td style="padding: 8px;">${data.firstName || ''} ${data.lastName || ''}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Ansprechpartner E-Mail:</td>
                <td style="padding: 8px;">${data.userEmail || ''}</td>
              </tr>
              <tr style="background-color: white;">
                <td style="padding: 8px; font-weight: bold;">Registriert am:</td>
                <td style="padding: 8px;">${new Date().toLocaleString('de-DE')}</td>
              </tr>
            </table>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Diese Benachrichtigung wurde automatisch vom HejTalent-System gesendet.
          </p>
        </div>
      `;
    } else if (type === 'new_search_request') {
      subject = `🔍 Neuer Suchauftrag auf HejTalent`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 2px solid #28a745; padding-bottom: 10px;">
            🔍 Neuer Suchauftrag erstellt
          </h1>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #28a745; margin-top: 0;">Auftragsinformationen:</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; font-weight: bold; width: 150px;">Titel:</td>
                <td style="padding: 8px;">${data.title || 'Nicht angegeben'}</td>
              </tr>
              <tr style="background-color: white;">
                <td style="padding: 8px; font-weight: bold;">Unternehmen:</td>
                <td style="padding: 8px;">${data.companyName || 'Nicht angegeben'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Beschreibung:</td>
                <td style="padding: 8px;">${data.description ? data.description.substring(0, 200) + (data.description.length > 200 ? '...' : '') : 'Nicht angegeben'}</td>
              </tr>
              <tr style="background-color: white;">
                <td style="padding: 8px; font-weight: bold;">Standort:</td>
                <td style="padding: 8px;">${data.location || 'Nicht angegeben'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Anstellungsart:</td>
                <td style="padding: 8px;">${data.employment_type || 'Nicht angegeben'}</td>
              </tr>
              <tr style="background-color: white;">
                <td style="padding: 8px; font-weight: bold;">Erfahrungslevel:</td>
                <td style="padding: 8px;">${data.experience_level || 'Nicht angegeben'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Gehaltsspanne:</td>
                <td style="padding: 8px;">
                  ${data.salary_min && data.salary_max ? `€${data.salary_min.toLocaleString()} - €${data.salary_max.toLocaleString()}` : 'Nicht angegeben'}
                </td>
              </tr>
              <tr style="background-color: white;">
                <td style="padding: 8px; font-weight: bold;">Erstellt am:</td>
                <td style="padding: 8px;">${new Date().toLocaleString('de-DE')}</td>
              </tr>
            </table>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Diese Benachrichtigung wurde automatisch vom HejTalent-System gesendet.
          </p>
        </div>
      `;
    }

    // Send email to all admins
    const emailResponse = await resend.emails.send({
      from: "HejTalent System <noreply@snipe-media.de>",
      to: adminEmails,
      subject: subject,
      html: htmlContent,
    });

    console.log("Admin notification email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin notification sent successfully',
        emailId: emailResponse.data?.id,
        adminCount: adminEmails.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error sending admin notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});