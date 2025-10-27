-- Tabelle für die Verknüpfung zwischen Kampagnen und Listen
CREATE TABLE IF NOT EXISTS public.outreach_campaign_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.outreach_campaigns(id) ON DELETE CASCADE,
  list_id UUID NOT NULL REFERENCES public.crm_contact_lists(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, list_id)
);

-- RLS Policies für outreach_campaign_lists
ALTER TABLE public.outreach_campaign_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage campaign lists"
  ON public.outreach_campaign_lists
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can read campaign lists"
  ON public.outreach_campaign_lists
  FOR SELECT
  USING (auth.uid() IS NULL);

-- Funktion, die neue Kontakte automatisch zu Kampagnen hinzufügt
CREATE OR REPLACE FUNCTION public.auto_add_contact_to_campaigns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Füge den neuen Kontakt zu allen aktiven/draft Kampagnen hinzu, die diese Liste verwenden
  INSERT INTO public.outreach_campaign_contacts (campaign_id, contact_id, status, next_sequence_number, next_send_date)
  SELECT 
    ocl.campaign_id,
    NEW.contact_id,
    'pending',
    1,
    NULL
  FROM public.outreach_campaign_lists ocl
  JOIN public.outreach_campaigns oc ON ocl.campaign_id = oc.id
  WHERE ocl.list_id = NEW.list_id
    AND oc.status IN ('draft', 'active')
    AND NOT EXISTS (
      -- Prüfe ob Kontakt nicht bereits in der Kampagne ist
      SELECT 1 FROM public.outreach_campaign_contacts occ
      WHERE occ.campaign_id = ocl.campaign_id
        AND occ.contact_id = NEW.contact_id
    );
  
  RETURN NEW;
END;
$$;

-- Trigger für automatisches Hinzufügen von Kontakten
CREATE TRIGGER auto_add_contact_to_campaigns_trigger
  AFTER INSERT ON public.crm_contact_list_members
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_add_contact_to_campaigns();

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_campaign_lists_campaign_id ON public.outreach_campaign_lists(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_lists_list_id ON public.outreach_campaign_lists(list_id);