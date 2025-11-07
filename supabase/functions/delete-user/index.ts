import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeleteUserRequest {
  userId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Keine Autorisierung vorhanden');
    }

    // Verify the requesting user is an admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: requestingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !requestingUser) {
      console.error('Auth error:', authError);
      throw new Error('Ungültige Autorisierung');
    }

    // Check if requesting user has admin role
    const { data: userRoles, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', requestingUser.id);

    if (roleError) {
      console.error('Role check error:', roleError);
      throw new Error('Fehler beim Überprüfen der Berechtigungen');
    }

    const isAdmin = userRoles?.some(r => r.role === 'admin');
    if (!isAdmin) {
      throw new Error('Keine Berechtigung für diese Aktion');
    }

    // Parse request body
    const { userId }: DeleteUserRequest = await req.json();

    if (!userId) {
      throw new Error('Benutzer-ID fehlt');
    }

    console.log('Deleting user:', userId, 'requested by admin:', requestingUser.id);

    // Prevent admin from deleting themselves
    if (userId === requestingUser.id) {
      throw new Error('Sie können sich nicht selbst löschen');
    }

    // Step 1: Delete user_roles
    console.log('Deleting user_roles...');
    const { error: rolesDeleteError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (rolesDeleteError) {
      console.error('Error deleting user_roles:', rolesDeleteError);
      throw new Error('Fehler beim Löschen der Benutzerrollen');
    }

    // Step 2: Delete profile (this might cascade to other tables)
    console.log('Deleting profile...');
    const { error: profileDeleteError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('user_id', userId);

    if (profileDeleteError) {
      console.error('Error deleting profile:', profileDeleteError);
      throw new Error('Fehler beim Löschen des Benutzerprofils');
    }

    // Step 3: Delete any related data that might not cascade
    // MS365 tokens
    console.log('Deleting MS365 tokens...');
    await supabaseAdmin
      .from('ms365_tokens')
      .delete()
      .eq('user_id', userId);

    // MS365 subscriptions
    console.log('Deleting MS365 subscriptions...');
    await supabaseAdmin
      .from('ms365_subscriptions')
      .delete()
      .eq('user_id', userId);

    // User email settings
    console.log('Deleting user email settings...');
    await supabaseAdmin
      .from('user_email_settings')
      .delete()
      .eq('user_id', userId);

    // CRM contacts linked to this user
    console.log('Unlinking CRM contacts...');
    await supabaseAdmin
      .from('crm_contacts')
      .update({ user_id: null })
      .eq('user_id', userId);

    // Step 4: Delete the auth user (this is the final step)
    console.log('Deleting auth user...');
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError);
      throw new Error('Fehler beim Löschen des Auth-Benutzers');
    }

    console.log('User successfully deleted:', userId);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Benutzer erfolgreich gelöscht'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in delete-user function:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
