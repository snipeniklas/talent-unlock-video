-- Allow users to update their own company (not just company_admins)
CREATE POLICY "Users can update their own company"
  ON public.companies
  FOR UPDATE
  USING (id = get_user_company(auth.uid()))
  WITH CHECK (id = get_user_company(auth.uid()));