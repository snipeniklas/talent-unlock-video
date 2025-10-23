-- Create cleanup function for stuck contacts (e.g., if edge function crashes during processing)
CREATE OR REPLACE FUNCTION public.cleanup_stuck_processing_contacts()
RETURNS void AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup job to run every 6 hours
SELECT cron.schedule(
  'cleanup-stuck-outreach-contacts',
  '0 */6 * * *',
  $$
  SELECT public.cleanup_stuck_processing_contacts();
  $$
);