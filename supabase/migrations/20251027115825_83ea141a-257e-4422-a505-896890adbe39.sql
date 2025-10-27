-- Drop old constraint
ALTER TABLE outreach_campaign_contacts 
DROP CONSTRAINT IF EXISTS outreach_campaign_contacts_status_check;

-- Add new constraint with all needed status values
ALTER TABLE outreach_campaign_contacts 
ADD CONSTRAINT outreach_campaign_contacts_status_check 
CHECK (status IN (
  'draft',
  'pending',
  'processing',
  'sent',
  'replied',
  'bounced',
  'failed',
  'completed'
));

-- Cleanup: Set any invalid status to 'draft'
UPDATE outreach_campaign_contacts
SET status = 'draft'
WHERE status NOT IN ('draft', 'pending', 'processing', 'sent', 'replied', 'bounced', 'failed', 'completed');