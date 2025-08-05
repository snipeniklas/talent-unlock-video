-- Fix the trigger functions to use correct net.http_post syntax

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    company_data JSONB;
    new_company_id UUID;
    is_company_admin BOOLEAN := false;
    notification_payload JSONB;
BEGIN
    -- Extract company data from metadata
    company_data := NEW.raw_user_meta_data -> 'company';
    
    -- Check if this is a company registration (has company data)
    IF company_data IS NOT NULL THEN
        -- Create new company
        INSERT INTO public.companies (name, email, website)
        VALUES (
            company_data ->> 'name',
            company_data ->> 'email',
            company_data ->> 'website'
        )
        RETURNING id INTO new_company_id;
        
        -- User becomes company admin for new company
        is_company_admin := true;
        
        -- Prepare notification payload for admin email
        notification_payload := jsonb_build_object(
            'companyName', company_data ->> 'name',
            'companyEmail', company_data ->> 'email',
            'companyWebsite', company_data ->> 'website',
            'firstName', NEW.raw_user_meta_data ->> 'first_name',
            'lastName', NEW.raw_user_meta_data ->> 'last_name',
            'userEmail', NEW.email
        );
        
        -- Send admin notification (fire and forget)
        PERFORM net.http_post(
            'https://pcbpxhzaajbycxwompif.supabase.co/functions/v1/send-admin-notification',
            jsonb_build_object(
                'type', 'new_company',
                'data', notification_payload
            ),
            '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjYnB4aHphYWpieWN4d29tcGlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MDI5MTgsImV4cCI6MjA2OTk3ODkxOH0.nTrbVlxyN3k26yeNnOFVRkoIgvD9-zczAjF2H-4R798"}'::jsonb
        );
    END IF;
    
    -- Create profile
    INSERT INTO public.profiles (user_id, company_id, first_name, last_name, email)
    VALUES (
        NEW.id,
        new_company_id,
        NEW.raw_user_meta_data ->> 'first_name',
        NEW.raw_user_meta_data ->> 'last_name',
        NEW.email
    );
    
    -- Assign roles
    IF is_company_admin THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'company_admin');
    ELSE
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'user');
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Update search request notification function
CREATE OR REPLACE FUNCTION public.notify_admins_new_search_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    company_data RECORD;
    notification_payload JSONB;
BEGIN
    -- Get company information
    SELECT name INTO company_data FROM public.companies WHERE id = NEW.company_id;
    
    -- Prepare notification payload
    notification_payload := jsonb_build_object(
        'title', NEW.title,
        'description', NEW.description,
        'location', NEW.location,
        'employment_type', NEW.employment_type,
        'experience_level', NEW.experience_level,
        'salary_min', NEW.salary_min,
        'salary_max', NEW.salary_max,
        'companyName', company_data.name
    );
    
    -- Send admin notification (fire and forget)
    PERFORM net.http_post(
        'https://pcbpxhzaajbycxwompif.supabase.co/functions/v1/send-admin-notification',
        jsonb_build_object(
            'type', 'new_search_request',
            'data', notification_payload
        ),
        '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjYnB4aHphYWpieWN4d29tcGlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MDI5MTgsImV4cCI6MjA2OTk3ODkxOH0.nTrbVlxyN3k26yeNnOFVRkoIgvD9-zczAjF2H-4R798"}'::jsonb
    );
    
    RETURN NEW;
END;
$function$;

-- Update support message notification function
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
        'https://pcbpxhzaajbycxwompif.supabase.co/functions/v1/send-admin-notification',
        jsonb_build_object(
            'type', 'new_support_message',
            'data', notification_payload
        ),
        '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjYnB4aHphYWpieWN4d29tcGlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MDI5MTgsImV4cCI6MjA2OTk3ODkxOH0.nTrbVlxyN3k26yeNnOFVRkoIgvD9-zczAjF2H-4R798"}'::jsonb
    );
    
    RETURN NEW;
END;
$function$;