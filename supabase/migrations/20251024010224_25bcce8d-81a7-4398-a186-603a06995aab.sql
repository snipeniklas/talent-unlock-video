-- Reset processing locks for stuck contacts
-- This fixes contacts that are stuck in "processing" status
UPDATE outreach_campaign_contacts
SET status = 'pending'
WHERE status = 'processing';