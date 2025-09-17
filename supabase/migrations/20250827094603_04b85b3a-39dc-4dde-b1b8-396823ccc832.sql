-- Add RLS policy for admins to view all companies
CREATE POLICY "Admins can view all companies" 
ON public.companies 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));