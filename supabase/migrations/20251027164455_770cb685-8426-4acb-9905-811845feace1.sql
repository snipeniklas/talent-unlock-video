-- Add research status tracking columns to crm_contacts
CREATE TYPE research_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'skipped');

ALTER TABLE public.crm_contacts
ADD COLUMN IF NOT EXISTS research_status research_status DEFAULT NULL,
ADD COLUMN IF NOT EXISTS research_retry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS research_last_attempt TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Update trigger function to only set status instead of calling HTTP
CREATE OR REPLACE FUNCTION public.trigger_auto_research_contact()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Nur Status auf pending setzen wenn Email vorhanden ist
    IF NEW.email IS NOT NULL AND NEW.email != '' THEN
        NEW.research_status := 'pending';
        RAISE LOG 'Contact % marked for research', NEW.id;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Create pg_cron job to process research queue every 2 minutes
SELECT cron.schedule(
    'process-research-queue',
    '*/2 * * * *',
    $$
    SELECT net.http_post(
        'https://pcbpxhzaajbycxwompif.supabase.co/functions/v1/process-research-queue',
        '{}'::jsonb,
        '{"Content-Type": "application/json"}'::jsonb
    )
    $$
);