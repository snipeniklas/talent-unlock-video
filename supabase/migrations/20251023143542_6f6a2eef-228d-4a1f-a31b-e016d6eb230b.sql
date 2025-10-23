-- Allow public users to insert companies when submitting lead inquiries
CREATE POLICY "Public can insert lead companies"
ON public.crm_companies
FOR INSERT
TO anon, authenticated
WITH CHECK (
  name IS NOT NULL 
  AND status = 'prospect'
);