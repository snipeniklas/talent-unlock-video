-- Update RLS policy for profiles to allow admins to read all profiles
DROP POLICY IF EXISTS "Users can view profiles in their company" ON public.profiles;

CREATE POLICY "Users can view profiles in their company or admins can view all" 
ON public.profiles 
FOR SELECT 
USING (
  (company_id = get_user_company(auth.uid())) OR 
  (user_id = auth.uid()) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Also update support tickets policy to ensure admins can read all company data
DROP POLICY IF EXISTS "Users can view their company tickets" ON public.support_tickets;

CREATE POLICY "Users can view their company tickets or admins can view all" 
ON public.support_tickets 
FOR SELECT 
USING (
  company_id = get_user_company(auth.uid()) OR 
  has_role(auth.uid(), 'admin'::app_role)
);