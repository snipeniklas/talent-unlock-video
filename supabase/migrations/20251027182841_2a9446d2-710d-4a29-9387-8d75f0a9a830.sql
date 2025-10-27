-- Create CRM Contact Notes table
CREATE TABLE IF NOT EXISTS public.crm_contact_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crm_contact_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crm_contact_notes
CREATE POLICY "Admins can manage all contact notes"
  ON public.crm_contact_notes
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create notes"
  ON public.crm_contact_notes
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can view notes they created"
  ON public.crm_contact_notes
  FOR SELECT
  USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update their own notes"
  ON public.crm_contact_notes
  FOR UPDATE
  USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete their own notes"
  ON public.crm_contact_notes
  FOR DELETE
  USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_crm_contact_notes_updated_at
  BEFORE UPDATE ON public.crm_contact_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_crm_contact_notes_contact_id ON public.crm_contact_notes(contact_id);
CREATE INDEX idx_crm_contact_notes_created_by ON public.crm_contact_notes(created_by);