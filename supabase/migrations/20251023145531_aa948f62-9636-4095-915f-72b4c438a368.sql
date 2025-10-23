-- Allow anon and authenticated users to read lead companies
-- This is needed because after INSERT we do .select("id") to get the company ID
CREATE POLICY "Public can read lead companies"
ON public.crm_companies
FOR SELECT
TO anon, authenticated
USING (
  status = 'prospect'
);