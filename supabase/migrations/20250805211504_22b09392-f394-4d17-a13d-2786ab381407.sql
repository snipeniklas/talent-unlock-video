-- Erstelle den korrekten Trigger für Support Messages ohne "status" Spalte
DROP TRIGGER IF EXISTS support_message_notification_trigger ON support_messages;

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
    http_response RECORD;
BEGIN
    -- Log the start
    RAISE LOG 'Support message trigger started for message ID: %', NEW.id;
    
    BEGIN
        -- Get ticket information (nur existierende Spalten verwenden)
        SELECT 
            title, 
            category, 
            priority, 
            status,  -- Diese Spalte existiert in support_tickets
            company_id 
        INTO ticket_data 
        FROM public.support_tickets 
        WHERE id = NEW.ticket_id;
        
        RAISE LOG 'Ticket data retrieved: %', ticket_data;
        
        -- Get company information
        SELECT name INTO company_data FROM public.companies WHERE id = ticket_data.company_id;
        
        RAISE LOG 'Company data retrieved: %', company_data;
        
        -- Get sender information
        SELECT 
            first_name, 
            last_name, 
            email 
        INTO sender_data 
        FROM public.profiles 
        WHERE user_id = NEW.sender_id;
        
        RAISE LOG 'Sender data retrieved: %', sender_data;
        
        -- Prepare notification payload
        notification_payload := jsonb_build_object(
            'ticketTitle', ticket_data.title,
            'category', ticket_data.category,
            'priority', ticket_data.priority,
            'ticketStatus', ticket_data.status,  -- Korrekte Spalte aus support_tickets
            'companyName', company_data.name,
            'senderName', CONCAT(sender_data.first_name, ' ', sender_data.last_name),
            'senderEmail', sender_data.email,
            'messageContent', NEW.content
        );
        
        RAISE LOG 'Notification payload prepared: %', notification_payload;
        
        -- Try to send admin notification
        BEGIN
            SELECT status, content INTO http_response
            FROM net.http_post(
                'https://pcbpxhzaajbycxwompif.supabase.co/functions/v1/send-admin-notification',
                jsonb_build_object(
                    'type', 'new_support_message',
                    'data', notification_payload
                ),
                '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjYnB4aHphYWpieWN4d29tcGlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MDI5MTgsImV4cCI6MjA2OTk3ODkxOH0.nTrbVlxyN3k26yeNnOFVRkoIgvD9-zczAjF2H-4R798"}'::jsonb
            );
            
            RAISE LOG 'HTTP POST successful - Status: %, Content: %', http_response.status, http_response.content;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE LOG 'HTTP POST failed with error: %', SQLERRM;
            -- Continue execution even if HTTP call fails
        END;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Trigger execution failed with error: %', SQLERRM;
    END;
    
    RETURN NEW;
END;
$function$;

-- Trigger erstellen
CREATE TRIGGER support_message_notification_trigger
    AFTER INSERT ON public.support_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_admins_new_support_message();