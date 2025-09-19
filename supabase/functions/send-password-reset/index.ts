import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { email, requestingUserId } = await req.json()
    
    console.log('Password reset requested for:', email, 'by user:', requestingUserId)

    // Überprüfen ob der anfragende Benutzer Admin ist
    const { data: userRoles, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', requestingUserId)

    if (roleError) {
      console.error('Error checking user role:', roleError)
      throw new Error('Berechtigung konnte nicht überprüft werden')
    }

    const isAdmin = userRoles?.some(role => role.role === 'admin')
    if (!isAdmin) {
      throw new Error('Keine Berechtigung für diese Aktion')
    }

    // Passwort-Reset Link generieren
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
    })

    if (error) {
      console.error('Error generating reset link:', error)
      throw error
    }

    console.log('Password reset link generated successfully for:', email)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Passwort-Reset Link wurde an ${email} gesendet.`
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in send-password-reset function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unbekannter Fehler beim Senden des Passwort-Resets'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 400 
      }
    )
  }
})