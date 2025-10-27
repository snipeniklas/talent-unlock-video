-- Update next_send_date to NOW for Remote Kampagne contacts
-- This allows the follow-up emails to be sent immediately

UPDATE outreach_campaign_contacts
SET next_send_date = NOW()
WHERE campaign_id = '8163a18a-04e2-4051-96c7-4f6ab067ef3c'
  AND status = 'pending'
  AND next_sequence_number = 2;