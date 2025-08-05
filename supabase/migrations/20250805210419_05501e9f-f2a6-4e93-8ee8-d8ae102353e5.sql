-- Drop und recreate den Trigger mit einer vereinfachten Version zum Debugging
DROP TRIGGER IF EXISTS trigger_notify_admins_new_support_message ON public.support_messages;

-- Vereinfachte Trigger-Funktion nur zum Testen
CREATE OR REPLACE FUNCTION public.test_support_message_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
    -- Einfach nur einen HTTP-Call ohne komplexe Logik
    PERFORM net.http_post(
        'https://pcbpxhzaajbycxwompif.supabase.co/functions/v1/send-admin-notification',
        '{"type": "test", "message": "Trigger funktioniert!"}'::jsonb,
        '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjYnB4aHphYWpieWN4d29tcGlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MDI5MTgsImV4cCI6MjA2OTk3ODkxOH0.nTrbVlxyN3k26yeNnOFVRkoIgvD9-zczAjF2H-4R798"}'::jsonb
    );
    
    RETURN NEW;
END;
$function$;

-- Erstelle den Trigger mit der Test-Funktion
CREATE TRIGGER trigger_notify_admins_new_support_message 
    AFTER INSERT ON public.support_messages 
    FOR EACH ROW 
    EXECUTE FUNCTION public.test_support_message_trigger();