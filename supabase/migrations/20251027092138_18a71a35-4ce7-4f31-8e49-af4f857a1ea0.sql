-- Step 1: Remove duplicate entries in outreach_campaign_contacts
-- Keep only the most recent entry for each campaign_id + contact_id combination
DELETE FROM public.outreach_campaign_contacts
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY campaign_id, contact_id 
             ORDER BY added_at DESC
           ) as row_num
    FROM public.outreach_campaign_contacts
  ) t
  WHERE t.row_num > 1
);

-- Step 2: Add UNIQUE constraint to prevent future duplicates
ALTER TABLE public.outreach_campaign_contacts
ADD CONSTRAINT outreach_campaign_contacts_campaign_contact_unique 
UNIQUE (campaign_id, contact_id);

-- Step 3: Update the cleanup function to also reset stuck processing contacts
CREATE OR REPLACE FUNCTION public.cleanup_stuck_processing_contacts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Reset contacts that have been stuck in "processing" for more than 1 hour
  UPDATE public.outreach_campaign_contacts
  SET 
    status = 'pending',
    updated_at = now()
  WHERE status = 'processing'
    AND updated_at < now() - interval '1 hour';
  
  RAISE LOG 'Cleaned up stuck processing contacts';
END;
$function$;

-- Step 4: Add index for better performance on next_send_date queries
CREATE INDEX IF NOT EXISTS idx_outreach_campaign_contacts_next_send 
ON public.outreach_campaign_contacts(campaign_id, next_send_date, status) 
WHERE is_excluded = false;