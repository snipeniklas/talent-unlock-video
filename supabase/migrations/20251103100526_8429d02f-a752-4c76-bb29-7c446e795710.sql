-- One-time fix: Update CRM contacts that were contacted via outreach campaigns
-- Set status to 'contacted' and last_contact_date to the date of first sent email
UPDATE crm_contacts
SET 
  status = 'contacted',
  last_contact_date = (
    SELECT DATE(sent_at) 
    FROM outreach_sent_emails 
    WHERE contact_id = crm_contacts.id 
    ORDER BY sent_at ASC 
    LIMIT 1
  ),
  updated_at = now()
WHERE id IN (
  SELECT DISTINCT contact_id 
  FROM outreach_sent_emails
)
AND status = 'new';