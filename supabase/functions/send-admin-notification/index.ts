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
  type: 'new_company' | 'new_search_request' | 'new_support_message';
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

    // Get all admin users with their profiles
    const { data: adminUsers, error: adminError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    if (adminError) {
      throw new Error(`Failed to fetch admin roles: ${adminError.message}`);
    }

    if (!adminUsers || adminUsers.length === 0) {
      console.log('No admin users found');
      return new Response(JSON.stringify({ success: true, message: 'No admins to notify' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get profiles for admin users
    const adminUserIds = adminUsers.map(user => user.user_id);
    const { data: adminProfiles, error: profileError } = await supabase
      .from('profiles')
      .select('email, first_name, last_name')
      .in('user_id', adminUserIds);

    if (profileError) {
      throw new Error(`Failed to fetch admin profiles: ${profileError.message}`);
    }

    if (!adminProfiles || adminProfiles.length === 0) {
      console.log('No admin profiles found');
      return new Response(JSON.stringify({ success: true, message: 'No admins to notify' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const adminEmails = adminProfiles.map(profile => profile.email).filter(Boolean);

    let subject = '';
    let htmlContent = '';

    if (type === 'new_company') {
      subject = `🎉 Neue Unternehmensregistrierung auf HejTalent`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>HejTalent - Neue Unternehmensregistrierung</title>
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
                  Neue Unternehmensregistrierung
                </h2>
                <p style="color: #64748b; font-size: 16px; margin: 0;">
                  Ein neues Unternehmen hat sich auf der HejTalent Platform registriert
                </p>
              </div>
              
              <!-- Company Info Card -->
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #4D64ED;">
                <h3 style="color: #1e293b; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">
                  Unternehmensinformationen
                </h3>
                <div style="space-y: 12px;">
                  <div style="margin-bottom: 12px;">
                    <span style="display: inline-block; width: 140px; color: #475569; font-weight: 500; font-size: 14px;">Firmenname:</span>
                    <span style="color: #1e293b; font-weight: 600;">${data.companyName || 'Nicht angegeben'}</span>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <span style="display: inline-block; width: 140px; color: #475569; font-weight: 500; font-size: 14px;">E-Mail:</span>
                    <span style="color: #1e293b;">${data.companyEmail || 'Nicht angegeben'}</span>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <span style="display: inline-block; width: 140px; color: #475569; font-weight: 500; font-size: 14px;">Website:</span>
                    <span style="color: #1e293b;">${data.companyWebsite || 'Nicht angegeben'}</span>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <span style="display: inline-block; width: 140px; color: #475569; font-weight: 500; font-size: 14px;">Ansprechpartner:</span>
                    <span style="color: #1e293b; font-weight: 600;">${data.firstName || ''} ${data.lastName || ''}</span>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <span style="display: inline-block; width: 140px; color: #475569; font-weight: 500; font-size: 14px;">Kontakt E-Mail:</span>
                    <span style="color: #1e293b;">${data.userEmail || ''}</span>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <span style="display: inline-block; width: 140px; color: #475569; font-weight: 500; font-size: 14px;">Registriert am:</span>
                    <span style="color: #1e293b;">${new Date().toLocaleString('de-DE')}</span>
                  </div>
                </div>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="#" style="display: inline-block; background: linear-gradient(135deg, #4D64ED, #4053d6); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(77, 100, 237, 0.25);">
                  Admin Dashboard öffnen
                </a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0;">
                Diese Benachrichtigung wurde automatisch vom <strong>HejTalent</strong> System gesendet.
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0 0;">
                © 2024 HejTalent - Professionelle Talentakquise
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (type === 'new_search_request') {
      subject = `🔍 Neuer Suchauftrag auf HejTalent`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>HejTalent - Neuer Suchauftrag</title>
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
                <div style="display: inline-block; background-color: #f0fdf4; padding: 16px; border-radius: 50%; margin-bottom: 16px;">
                  <span style="font-size: 32px;">🔍</span>
                </div>
                <h2 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 8px 0;">
                  Neuer Suchauftrag erstellt
                </h2>
                <p style="color: #64748b; font-size: 16px; margin: 0;">
                  Ein neuer Suchauftrag wurde auf der HejTalent Platform erstellt
                </p>
              </div>
              
              <!-- Search Request Info Card -->
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #10b981;">
                <h3 style="color: #1e293b; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">
                  Auftragsinformationen
                </h3>
                <div style="space-y: 12px;">
                  <div style="margin-bottom: 12px;">
                    <span style="display: inline-block; width: 140px; color: #475569; font-weight: 500; font-size: 14px;">Titel:</span>
                    <span style="color: #1e293b; font-weight: 600;">${data.title || 'Nicht angegeben'}</span>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <span style="display: inline-block; width: 140px; color: #475569; font-weight: 500; font-size: 14px;">Unternehmen:</span>
                    <span style="color: #1e293b; font-weight: 600;">${data.companyName || 'Nicht angegeben'}</span>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <span style="display: inline-block; width: 140px; color: #475569; font-weight: 500; font-size: 14px; vertical-align: top;">Beschreibung:</span>
                    <span style="color: #1e293b;">${data.description ? data.description.substring(0, 200) + (data.description.length > 200 ? '...' : '') : 'Nicht angegeben'}</span>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <span style="display: inline-block; width: 140px; color: #475569; font-weight: 500; font-size: 14px;">Standort:</span>
                    <span style="color: #1e293b;">${data.location || 'Nicht angegeben'}</span>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <span style="display: inline-block; width: 140px; color: #475569; font-weight: 500; font-size: 14px;">Anstellungsart:</span>
                    <span style="color: #1e293b;">${data.employment_type || 'Nicht angegeben'}</span>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <span style="display: inline-block; width: 140px; color: #475569; font-weight: 500; font-size: 14px;">Erfahrungslevel:</span>
                    <span style="color: #1e293b;">${data.experience_level || 'Nicht angegeben'}</span>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <span style="display: inline-block; width: 140px; color: #475569; font-weight: 500; font-size: 14px;">Gehaltsspanne:</span>
                    <span style="color: #1e293b; font-weight: 600;">
                      ${data.salary_min && data.salary_max ? `€${data.salary_min.toLocaleString()} - €${data.salary_max.toLocaleString()}` : 'Nicht angegeben'}
                    </span>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <span style="display: inline-block; width: 140px; color: #475569; font-weight: 500; font-size: 14px;">Erstellt am:</span>
                    <span style="color: #1e293b;">${new Date().toLocaleString('de-DE')}</span>
                  </div>
                </div>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="#" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.25);">
                  Suchauftrag bearbeiten
                </a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0;">
                Diese Benachrichtigung wurde automatisch vom <strong>HejTalent</strong> System gesendet.
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0 0;">
                © 2024 HejTalent - Professionelle Talentakquise
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (type === 'new_support_message') {
      subject = `💬 Neue Support-Nachricht von ${data.companyName}`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>HejTalent - Neue Support-Nachricht</title>
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
                <div style="display: inline-block; background-color: ${data.priority === 'high' ? '#fef2f2' : '#fef3c7'}; padding: 16px; border-radius: 50%; margin-bottom: 16px;">
                  <span style="font-size: 32px;">💬</span>
                </div>
                <h2 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 8px 0;">
                  Neue Support-Nachricht
                </h2>
                <p style="color: #64748b; font-size: 16px; margin: 0;">
                  Eine neue Support-Nachricht von <strong>${data.companyName}</strong> erhalten
                </p>
              </div>
              
              <!-- Ticket Info Card -->
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid ${data.priority === 'high' ? '#ef4444' : data.priority === 'medium' ? '#f59e0b' : '#10b981'};">
                <h3 style="color: #1e293b; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">
                  Ticket-Informationen
                </h3>
                <div style="space-y: 12px;">
                  <div style="margin-bottom: 12px;">
                    <span style="display: inline-block; width: 140px; color: #475569; font-weight: 500; font-size: 14px;">Ticket-Titel:</span>
                    <span style="color: #1e293b; font-weight: 600;">${data.ticketTitle || 'Nicht angegeben'}</span>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <span style="display: inline-block; width: 140px; color: #475569; font-weight: 500; font-size: 14px;">Unternehmen:</span>
                    <span style="color: #1e293b; font-weight: 600;">${data.companyName || 'Nicht angegeben'}</span>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <span style="display: inline-block; width: 140px; color: #475569; font-weight: 500; font-size: 14px;">Von:</span>
                    <span style="color: #1e293b;">${data.senderName || 'Unbekannt'}</span>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <span style="display: inline-block; width: 140px; color: #475569; font-weight: 500; font-size: 14px;">E-Mail:</span>
                    <span style="color: #1e293b;">${data.senderEmail || 'Keine E-Mail'}</span>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <span style="display: inline-block; width: 140px; color: #475569; font-weight: 500; font-size: 14px;">Kategorie:</span>
                    <span style="color: #1e293b;">${data.category || 'Allgemein'}</span>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <span style="display: inline-block; width: 140px; color: #475569; font-weight: 500; font-size: 14px;">Priorität:</span>
                    <span style="color: ${data.priority === 'high' ? '#ef4444' : data.priority === 'medium' ? '#f59e0b' : '#10b981'}; font-weight: 600;">
                      ${data.priority === 'high' ? '🔴 Hoch' : data.priority === 'medium' ? '🟡 Mittel' : '🟢 Niedrig'}
                    </span>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <span style="display: inline-block; width: 140px; color: #475569; font-weight: 500; font-size: 14px;">Status:</span>
                    <span style="color: #1e293b;">${data.ticketStatus || 'Offen'}</span>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <span style="display: inline-block; width: 140px; color: #475569; font-weight: 500; font-size: 14px;">Gesendet am:</span>
                    <span style="color: #1e293b;">${new Date().toLocaleString('de-DE')}</span>
                  </div>
                </div>
              </div>
              
              <!-- Message Content -->
              <div style="background-color: #fff; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
                <h3 style="color: #1e293b; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">
                  Nachrichteninhalt
                </h3>
                <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; border-left: 3px solid #4D64ED; line-height: 1.6;">
                  <p style="color: #374151; margin: 0; white-space: pre-wrap; font-size: 15px;">${data.messageContent || 'Kein Inhalt verfügbar'}</p>
                </div>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="#" style="display: inline-block; background: linear-gradient(135deg, #ef4444, #dc2626); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.25);">
                  Support-Ticket bearbeiten
                </a>
              </div>
              
              <!-- Urgent Notice -->
              ${data.priority === 'high' ? `
              <div style="background: linear-gradient(135deg, #fef2f2, #fee2e2); border: 1px solid #fecaca; border-radius: 8px; padding: 16px; text-align: center;">
                <p style="color: #dc2626; font-weight: 600; margin: 0; font-size: 14px;">
                  ⚠️ Diese Nachricht hat hohe Priorität - bitte zeitnah bearbeiten!
                </p>
              </div>
              ` : ''}
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0;">
                Diese Benachrichtigung wurde automatisch vom <strong>HejTalent</strong> System gesendet.
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0 0;">
                © 2024 HejTalent - Professionelle Talentakquise
              </p>
            </div>
          </div>
        </body>
        </html>
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