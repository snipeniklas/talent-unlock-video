-- Lösche alle existierenden notification Trigger für Support Messages
DROP TRIGGER IF EXISTS support_message_notification_trigger ON support_messages;
DROP TRIGGER IF EXISTS trigger_notify_admins_new_support_message ON support_messages;

-- Erstelle nur einen einzigen neuen Trigger
CREATE TRIGGER support_message_notification_trigger
    AFTER INSERT ON public.support_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_admins_new_support_message();