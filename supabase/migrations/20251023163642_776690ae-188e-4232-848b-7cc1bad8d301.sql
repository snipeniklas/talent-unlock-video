-- Add new columns to outreach_campaigns for better AI personalization
ALTER TABLE outreach_campaigns 
ADD COLUMN target_audience TEXT,
ADD COLUMN desired_cta TEXT;

-- Add tracking columns to outreach_campaign_contacts for follow-up management
ALTER TABLE outreach_campaign_contacts
ADD COLUMN next_sequence_number INTEGER DEFAULT 1,
ADD COLUMN next_send_date TIMESTAMPTZ,
ADD COLUMN is_excluded BOOLEAN DEFAULT false;

-- Create index for efficient queries on next_send_date
CREATE INDEX idx_outreach_contacts_next_send 
ON outreach_campaign_contacts(next_send_date) 
WHERE is_excluded = false AND status != 'failed';

-- Add comments for documentation
COMMENT ON COLUMN outreach_campaigns.target_audience IS 'Description of target audience for AI personalization';
COMMENT ON COLUMN outreach_campaigns.desired_cta IS 'Desired call-to-action to be integrated in emails';
COMMENT ON COLUMN outreach_campaign_contacts.next_sequence_number IS 'Tracks which email sequence should be sent next (1, 2, 3, etc.)';
COMMENT ON COLUMN outreach_campaign_contacts.next_send_date IS 'Date when the next email should be sent based on delay_days';
COMMENT ON COLUMN outreach_campaign_contacts.is_excluded IS 'If true, contact is manually excluded from receiving more emails';