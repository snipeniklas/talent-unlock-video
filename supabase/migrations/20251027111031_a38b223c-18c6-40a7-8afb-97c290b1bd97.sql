-- Immediate fix: Reset stuck contacts from 'sent' or 'processing' to 'pending'
-- This fixes the Remote Kampagne and any other campaigns with stuck contacts

UPDATE outreach_campaign_contacts
SET status = 'pending'
WHERE status IN ('sent', 'processing')
  AND next_send_date <= NOW();