-- Import existing users as CRM contacts
-- This is a one-time migration to sync existing profiles with CRM

-- Insert new CRM contacts for users that don't exist in CRM yet
INSERT INTO public.crm_contacts (
    user_id,
    first_name,
    last_name,
    email,
    status,
    priority,
    lead_source,
    crm_company_id,
    created_at,
    updated_at
)
SELECT 
    p.user_id,
    p.first_name,
    p.last_name,
    p.email,
    'contacted', -- Registered users are at least "contacted"
    'medium',
    'website_registration',
    NULL, -- crm_company_id can be assigned manually later (companies != crm_companies)
    p.created_at,
    NOW()
FROM profiles p
WHERE NOT EXISTS (
    -- Check if CRM contact already exists
    SELECT 1 FROM crm_contacts cc 
    WHERE cc.user_id = p.user_id 
    OR cc.email = p.email
)
AND p.user_id IS NOT NULL;

-- For users that already exist as CRM contacts (via email), link the user_id
UPDATE public.crm_contacts cc
SET 
    user_id = p.user_id,
    first_name = COALESCE(cc.first_name, p.first_name),
    last_name = COALESCE(cc.last_name, p.last_name),
    status = CASE 
        WHEN cc.status = 'new' THEN 'contacted' 
        ELSE cc.status 
    END,
    updated_at = NOW()
FROM profiles p
WHERE cc.email = p.email 
AND cc.user_id IS NULL
AND p.user_id IS NOT NULL;