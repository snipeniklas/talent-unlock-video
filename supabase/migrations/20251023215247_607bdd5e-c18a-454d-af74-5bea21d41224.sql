-- Drop the old status check constraint
ALTER TABLE crm_contacts DROP CONSTRAINT IF EXISTS crm_contacts_status_check;

-- Add new constraint with UI-compatible status values
ALTER TABLE crm_contacts ADD CONSTRAINT crm_contacts_status_check 
CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'));

-- Migrate any existing data with old status values to new ones
UPDATE crm_contacts SET status = 'contacted' WHERE status = 'follow_up';
UPDATE crm_contacts SET status = 'proposal' WHERE status = 'proposal_sent';