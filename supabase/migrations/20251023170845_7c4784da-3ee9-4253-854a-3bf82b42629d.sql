-- Create table for storing AI research data about CRM contacts
CREATE TABLE public.crm_contact_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  research_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  researched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  researched_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(contact_id)
);

-- Index for fast contact lookups
CREATE INDEX idx_crm_contact_research_contact_id ON public.crm_contact_research(contact_id);

-- Enable Row Level Security
ALTER TABLE public.crm_contact_research ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins can manage all research data
CREATE POLICY "Admins can manage all research data"
  ON public.crm_contact_research
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add comment for documentation
COMMENT ON TABLE public.crm_contact_research IS 'Stores AI-generated research data for CRM contacts using Perplexity API. Research data includes professional background, company info, talking points, and social profiles.';