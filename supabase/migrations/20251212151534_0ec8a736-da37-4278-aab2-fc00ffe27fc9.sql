-- Update the trigger function to also include 'paused' campaigns
-- This allows contacts to be added to campaigns while they are paused
CREATE OR REPLACE FUNCTION public.auto_add_contact_to_campaigns()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Add the new contact to all active/draft/paused campaigns that use this list
  -- FIX: Set next_send_date = NOW() to prevent race conditions
  -- FIX: Include 'paused' status so contacts can be added during pause
  INSERT INTO public.outreach_campaign_contacts (campaign_id, contact_id, status, next_sequence_number, next_send_date)
  SELECT 
    ocl.campaign_id,
    NEW.contact_id,
    'pending',
    1,
    NOW()  -- Set next_send_date immediately to prevent duplicate processing
  FROM public.outreach_campaign_lists ocl
  JOIN public.outreach_campaigns oc ON ocl.campaign_id = oc.id
  WHERE ocl.list_id = NEW.list_id
    AND oc.status IN ('draft', 'active', 'paused')  -- Include paused campaigns
    AND NOT EXISTS (
      -- Check if contact is not already in the campaign
      SELECT 1 FROM public.outreach_campaign_contacts occ
      WHERE occ.campaign_id = ocl.campaign_id
        AND occ.contact_id = NEW.contact_id
    );
  
  RETURN NEW;
END;
$function$;