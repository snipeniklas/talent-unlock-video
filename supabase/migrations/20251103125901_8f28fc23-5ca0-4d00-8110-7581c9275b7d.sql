-- One-time data cleanup: Fix stuck contacts in processing status

-- Step 1: Mark contacts as completed if they have research data but are still in 'processing'
UPDATE public.crm_contacts
SET 
  research_status = 'completed',
  updated_at = now()
WHERE research_status = 'processing'
  AND id IN (
    SELECT DISTINCT contact_id 
    FROM public.crm_contact_research
  );

-- Step 2: Reset contacts to pending if they are in 'processing' but have no research data
UPDATE public.crm_contacts
SET 
  research_status = 'pending',
  research_retry_count = 0,
  updated_at = now()
WHERE research_status = 'processing'
  AND id NOT IN (
    SELECT DISTINCT contact_id 
    FROM public.crm_contact_research
  );