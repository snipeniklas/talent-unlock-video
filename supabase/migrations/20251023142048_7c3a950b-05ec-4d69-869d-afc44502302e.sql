-- Add inquiry field to crm_contacts table
ALTER TABLE public.crm_contacts 
ADD COLUMN inquiry TEXT;

COMMENT ON COLUMN public.crm_contacts.inquiry IS 'Das konkrete Anliegen/Anfrage des Kontakts (z.B. aus Landing Page RaaS Formular)';

-- Create RLS policy to allow public users to insert lead inquiries
CREATE POLICY "Public can insert lead inquiries"
ON public.crm_contacts
FOR INSERT
TO anon, authenticated
WITH CHECK (
  first_name IS NOT NULL 
  AND last_name IS NOT NULL 
  AND email IS NOT NULL 
  AND phone IS NOT NULL
  AND inquiry IS NOT NULL
  AND status = 'new'
  AND priority IN ('medium', 'high')
);