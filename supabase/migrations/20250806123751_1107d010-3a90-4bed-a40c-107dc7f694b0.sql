-- Remove old company admin policies (they are now covered by the broader admin policies)
DROP POLICY IF EXISTS "Company admins can create invitations for their company" ON public.invitations;
DROP POLICY IF EXISTS "Company admins can view their company invitations" ON public.invitations;
DROP POLICY IF EXISTS "Company admins can update their company invitations" ON public.invitations;
DROP POLICY IF EXISTS "Company admins can delete their company invitations" ON public.invitations;