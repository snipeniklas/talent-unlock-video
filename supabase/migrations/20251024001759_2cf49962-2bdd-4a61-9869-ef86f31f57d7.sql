-- Fix outreach campaign contacts to start sending immediately
-- Set next_send_date to NOW() for all pending contacts that don't have it set

UPDATE outreach_campaign_contacts
SET next_send_date = NOW()
WHERE next_send_date IS NULL 
  AND status = 'pending';