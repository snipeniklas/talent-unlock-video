-- Fix RLS policies for invitations and user creation

-- Update invitations policies for better access control
DROP POLICY IF EXISTS "Company admins can create invitations" ON public.invitations;
DROP POLICY IF EXISTS "Company admins can update their invitations" ON public.invitations;
DROP POLICY IF EXISTS "Company admins can view their company invitations" ON public.invitations;

CREATE POLICY "Company admins can create invitations for their company" 
ON public.invitations 
FOR INSERT 
WITH CHECK (
  company_id = get_user_company(auth.uid()) AND 
  has_role(auth.uid(), 'company_admin'::app_role) AND 
  invited_by = auth.uid()
);

CREATE POLICY "Company admins can update their company invitations" 
ON public.invitations 
FOR UPDATE 
USING (
  company_id = get_user_company(auth.uid()) AND 
  has_role(auth.uid(), 'company_admin'::app_role)
);

CREATE POLICY "Company admins can view their company invitations" 
ON public.invitations 
FOR SELECT 
USING (
  company_id = get_user_company(auth.uid()) AND 
  has_role(auth.uid(), 'company_admin'::app_role)
);

CREATE POLICY "Company admins can delete their company invitations" 
ON public.invitations 
FOR DELETE 
USING (
  company_id = get_user_company(auth.uid()) AND 
  has_role(auth.uid(), 'company_admin'::app_role)
);

-- Allow public access to validate invitations (needed for registration page)
CREATE POLICY "Public can view pending invitations for validation" 
ON public.invitations 
FOR SELECT 
TO anon
USING (status = 'pending' AND expires_at > now());

-- Update companies policy to allow company admins to update their company
DROP POLICY IF EXISTS "Company admins can update their company" ON public.companies;

CREATE POLICY "Company admins can update their own company" 
ON public.companies 
FOR UPDATE 
USING (
  id = get_user_company(auth.uid()) AND 
  has_role(auth.uid(), 'company_admin'::app_role)
);

-- Allow public updates to invitations (needed for marking as accepted during registration)
CREATE POLICY "Public can update invitations during registration" 
ON public.invitations 
FOR UPDATE 
TO anon
USING (status = 'pending' AND expires_at > now())
WITH CHECK (status IN ('accepted', 'pending'));

-- Allow creation of profiles during registration
CREATE POLICY "Profiles can be created during registration" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Allow creation of user roles during registration  
CREATE POLICY "User roles can be assigned during registration" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());