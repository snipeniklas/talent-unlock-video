-- Trigger-Funktion für automatische Contact Research
CREATE OR REPLACE FUNCTION public.trigger_auto_research_contact()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Nur Research starten wenn Email vorhanden ist
    IF NEW.email IS NOT NULL AND NEW.email != '' THEN
        BEGIN
            -- Asynchroner HTTP-Call zur Research Edge Function
            PERFORM net.http_post(
                'https://pcbpxhzaajbycxwompif.supabase.co/functions/v1/research-contact',
                jsonb_build_object('contact_id', NEW.id),
                jsonb_build_object(
                    'Content-Type', 'application/json',
                    'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjYnB4aHphYWpieWN4d29tcGlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MDI5MTgsImV4cCI6MjA2OTk3ODkxOH0.nTrbVlxyN3k26yeNnOFVRkoIgvD9-zczAjF2H-4R798'
                )
            );
            
            RAISE LOG 'Auto research triggered for contact ID: %', NEW.id;
            
        EXCEPTION WHEN OTHERS THEN
            -- Fehler loggen aber INSERT nicht blockieren
            RAISE LOG 'Failed to trigger auto research for contact %: %', NEW.id, SQLERRM;
        END;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Trigger auf crm_contacts Tabelle
DROP TRIGGER IF EXISTS auto_research_new_contact ON public.crm_contacts;

CREATE TRIGGER auto_research_new_contact
    AFTER INSERT ON public.crm_contacts
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_auto_research_contact();