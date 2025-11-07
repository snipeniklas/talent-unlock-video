import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeleteCompanyRequest {
  companyId: string;
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
    const { companyId }: DeleteCompanyRequest = await req.json();

    if (!companyId) {
      throw new Error('Unternehmens-ID fehlt');
    }

    console.log('Deleting company:', companyId, 'requested by admin:', requestingUser.id);

    // Check if company has any users
    const { data: companyUsers, error: usersCheckError } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('company_id', companyId);

    if (usersCheckError) {
      console.error('Error checking company users:', usersCheckError);
      throw new Error('Fehler beim Prüfen der Unternehmensbenutzer');
    }

    if (companyUsers && companyUsers.length > 0) {
      throw new Error(`Das Unternehmen hat noch ${companyUsers.length} Benutzer. Bitte löschen Sie zuerst alle Benutzer.`);
    }

    // Check if company has search requests
    const { data: searchRequests, error: searchRequestsError } = await supabaseAdmin
      .from('search_requests')
      .select('id')
      .eq('company_id', companyId);

    if (searchRequestsError) {
      console.error('Error checking search requests:', searchRequestsError);
      throw new Error('Fehler beim Prüfen der Suchanfragen');
    }

    if (searchRequests && searchRequests.length > 0) {
      throw new Error(`Das Unternehmen hat noch ${searchRequests.length} Suchanfragen. Diese müssen zuerst gelöscht werden.`);
    }

    // Delete support tickets for this company
    console.log('Deleting support tickets...');
    const { error: ticketsDeleteError } = await supabaseAdmin
      .from('support_tickets')
      .delete()
      .eq('company_id', companyId);

    if (ticketsDeleteError) {
      console.error('Error deleting support tickets:', ticketsDeleteError);
      // Continue anyway - tickets might not exist
    }

    // Delete invitations for this company
    console.log('Deleting invitations...');
    const { error: invitationsDeleteError } = await supabaseAdmin
      .from('invitations')
      .delete()
      .eq('company_id', companyId);

    if (invitationsDeleteError) {
      console.error('Error deleting invitations:', invitationsDeleteError);
      // Continue anyway - invitations might not exist
    }

    // Finally delete the company
    console.log('Deleting company record...');
    const { error: companyDeleteError } = await supabaseAdmin
      .from('companies')
      .delete()
      .eq('id', companyId);

    if (companyDeleteError) {
      console.error('Error deleting company:', companyDeleteError);
      throw new Error('Fehler beim Löschen des Unternehmens');
    }

    console.log('Company successfully deleted:', companyId);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Unternehmen erfolgreich gelöscht'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in delete-company function:', error);
    
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
