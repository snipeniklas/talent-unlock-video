-- Allow admins to create invitations
CREATE POLICY "Admins can create invitations for their company" 
ON public.invitations 
FOR INSERT 
WITH CHECK (
  (company_id = get_user_company(auth.uid())) AND 
  (invited_by = auth.uid()) AND 
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role))
);

-- Allow admins to view invitations for their company
CREATE POLICY "Admins can view their company invitations" 
ON public.invitations 
FOR SELECT 
USING (
  (company_id = get_user_company(auth.uid())) AND 
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role))
);

-- Allow admins to update invitations for their company
CREATE POLICY "Admins can update their company invitations" 
ON public.invitations 
FOR UPDATE 
USING (
  (company_id = get_user_company(auth.uid())) AND 
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role))
);

-- Allow admins to delete invitations for their company
CREATE POLICY "Admins can delete their company invitations" 
ON public.invitations 
FOR DELETE 
USING (
  (company_id = get_user_company(auth.uid())) AND 
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role))
);

-- Add a role column to invitations table to specify what role the invited user should get
ALTER TABLE public.invitations ADD COLUMN invited_role app_role DEFAULT 'user'::app_role;