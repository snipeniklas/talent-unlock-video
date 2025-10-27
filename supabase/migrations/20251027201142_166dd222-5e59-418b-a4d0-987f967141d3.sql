-- Create/Update Auto-Research Trigger Function
CREATE OR REPLACE FUNCTION public.trigger_auto_research_contact()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Nur Status auf pending setzen wenn Email vorhanden ist
    IF NEW.email IS NOT NULL AND NEW.email != '' THEN
        NEW.research_status := 'pending';
        RAISE LOG 'Contact % marked for research', NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Lösche alten Trigger falls vorhanden
DROP TRIGGER IF EXISTS trigger_auto_research_contact ON public.crm_contacts;

-- Erstelle neuen BEFORE INSERT Trigger
CREATE TRIGGER trigger_auto_research_contact
BEFORE INSERT ON public.crm_contacts
FOR EACH ROW
EXECUTE FUNCTION public.trigger_auto_research_contact();

-- Optional: Markiere bestehende Contacts mit Email für Research
-- Uncomment the following lines if you want to backfill existing contacts:
-- UPDATE public.crm_contacts
-- SET research_status = 'pending'
-- WHERE email IS NOT NULL 
--   AND email != ''
--   AND research_status IS NULL;