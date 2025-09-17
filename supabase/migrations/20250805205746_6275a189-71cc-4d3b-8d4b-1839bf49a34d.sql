-- Force create the trigger with explicit schema reference
DROP TRIGGER IF EXISTS trigger_notify_admins_new_support_message ON public.support_messages;

CREATE TRIGGER trigger_notify_admins_new_support_message 
    AFTER INSERT ON public.support_messages 
    FOR EACH ROW 
    EXECUTE PROCEDURE public.notify_admins_new_support_message();

-- Verify the trigger was created
SELECT 
    trigger_name, 
    event_object_table, 
    action_timing, 
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_notify_admins_new_support_message';