-- Add updated_at column to outreach_campaign_contacts
ALTER TABLE public.outreach_campaign_contacts 
ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();

-- Create trigger for automatic updated_at updates
CREATE TRIGGER update_outreach_campaign_contacts_updated_at
BEFORE UPDATE ON public.outreach_campaign_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();