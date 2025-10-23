-- Add value_proposition field to companies table for outreach personalization
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS value_proposition TEXT;

COMMENT ON COLUMN companies.value_proposition IS 'Company value proposition for outreach email personalization';