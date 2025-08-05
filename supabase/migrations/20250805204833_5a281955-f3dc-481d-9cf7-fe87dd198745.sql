-- Create trigger for support message notifications
CREATE OR REPLACE FUNCTION public.notify_admins_new_support_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    ticket_data RECORD;
    company_data RECORD;
    sender_data RECORD;
    notification_payload JSONB;
BEGIN
    -- Get ticket information
    SELECT 
        title, 
        category, 
        priority, 
        status, 
        company_id 
    INTO ticket_data 
    FROM public.support_tickets 
    WHERE id = NEW.ticket_id;
    
    -- Get company information
    SELECT name INTO company_data FROM public.companies WHERE id = ticket_data.company_id;
    
    -- Get sender information
    SELECT 
        first_name, 
        last_name, 
        email 
    INTO sender_data 
    FROM public.profiles 
    WHERE user_id = NEW.sender_id;
    
    -- Prepare notification payload
    notification_payload := jsonb_build_object(
        'ticketTitle', ticket_data.title,
        'category', ticket_data.category,
        'priority', ticket_data.priority,
        'status', ticket_data.status,
        'companyName', company_data.name,
        'senderName', CONCAT(sender_data.first_name, ' ', sender_data.last_name),
        'senderEmail', sender_data.email,
        'messageContent', NEW.content
    );
    
    -- Send admin notification (fire and forget)
    PERFORM net.http_post(
        url := 'https://pcbpxhzaajbycxwompif.supabase.co/functions/v1/send-admin-notification',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjYnB4aHphYWpieWN4d29tcGlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MDI5MTgsImV4cCI6MjA2OTk3ODkxOH0.nTrbVlxyN3k26yeNnOFVRkoIgvD9-zczAjF2H-4R798"}'::jsonb,
        body := jsonb_build_object(
            'type', 'new_support_message',
            'data', notification_payload
        )::text
    );
    
    RETURN NEW;
END;
$function$;

-- Create trigger for new support messages
DROP TRIGGER IF EXISTS trigger_notify_admins_new_support_message ON public.support_messages;
CREATE TRIGGER trigger_notify_admins_new_support_message
    AFTER INSERT ON public.support_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_admins_new_support_message();