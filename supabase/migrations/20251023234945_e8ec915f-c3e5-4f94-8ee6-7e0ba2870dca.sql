-- Create contact lists table
CREATE TABLE public.crm_contact_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create contact list members (join table)
CREATE TABLE public.crm_contact_list_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES public.crm_contact_lists(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  added_by UUID REFERENCES auth.users(id),
  UNIQUE(list_id, contact_id)
);

-- Enable RLS
ALTER TABLE public.crm_contact_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contact_list_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crm_contact_lists
CREATE POLICY "Admins can manage all contact lists"
  ON public.crm_contact_lists
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for crm_contact_list_members
CREATE POLICY "Admins can manage all list members"
  ON public.crm_contact_list_members
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at on crm_contact_lists
CREATE TRIGGER update_crm_contact_lists_updated_at
  BEFORE UPDATE ON public.crm_contact_lists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_crm_contact_list_members_list_id ON public.crm_contact_list_members(list_id);
CREATE INDEX idx_crm_contact_list_members_contact_id ON public.crm_contact_list_members(contact_id);