-- Erstelle eine einfache Test-Trigger-Funktion die nur loggt
CREATE OR REPLACE FUNCTION public.simple_test_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    -- Einfaches Logging um zu sehen ob der Trigger feuert
    RAISE LOG 'TRIGGER GEFEUERT: Neue Support Message mit ID % erstellt', NEW.id;
    RAISE NOTICE 'Support Message Trigger wurde ausgeführt für Message ID: %', NEW.id;
    
    -- Versuche auch NOTIFY für Debugging
    PERFORM pg_notify('support_message_trigger', 'Message ID: ' || NEW.id::text);
    
    RETURN NEW;
END;
$function$;

-- Ersetze den Trigger
DROP TRIGGER IF EXISTS trigger_notify_admins_new_support_message ON public.support_messages;
CREATE TRIGGER trigger_notify_admins_new_support_message 
    AFTER INSERT ON public.support_messages 
    FOR EACH ROW 
    EXECUTE FUNCTION public.simple_test_trigger();