-- Recreate the trigger for support message notifications
DROP TRIGGER IF EXISTS trigger_notify_admins_new_support_message ON public.support_messages;

-- Make sure the function exists and recreate the trigger
CREATE TRIGGER trigger_notify_admins_new_support_message
    AFTER INSERT ON public.support_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_admins_new_support_message();