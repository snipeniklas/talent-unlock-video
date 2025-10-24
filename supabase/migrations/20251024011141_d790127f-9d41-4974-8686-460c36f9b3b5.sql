-- Reset all contacts stuck in processing status
UPDATE public.outreach_campaign_contacts
SET status = 'pending'
WHERE status = 'processing';