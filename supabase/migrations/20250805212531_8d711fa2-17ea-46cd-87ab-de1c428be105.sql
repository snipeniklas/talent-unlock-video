-- Korrigiere den Registrierungs-Trigger mit robuster Fehlerbehandlung
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
        
        -- Send admin notification with error handling
        BEGIN
            PERFORM net.http_post(
                'https://pcbpxhzaajbycxwompif.supabase.co/functions/v1/send-admin-notification',
                jsonb_build_object(
                    'type', 'new_company',
                    'data', notification_payload
                ),
                '{"Content-Type": "application/json"}'::jsonb
            );
            
            RAISE LOG 'New company notification sent successfully';
            
        EXCEPTION WHEN OTHERS THEN
            RAISE LOG 'Failed to send new company notification: %', SQLERRM;
            -- Continue execution even if HTTP call fails
        END;
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

-- Korrigiere den Suchaufträge-Trigger mit robuster Fehlerbehandlung
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
    RAISE LOG 'New search request trigger started for request ID: %', NEW.id;
    
    BEGIN
        -- Get company information
        SELECT name INTO company_data FROM public.companies WHERE id = NEW.company_id;
        
        RAISE LOG 'Company data retrieved: %', company_data;
        
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
        
        RAISE LOG 'Search request notification payload prepared: %', notification_payload;
        
        -- Send admin notification with error handling
        BEGIN
            PERFORM net.http_post(
                'https://pcbpxhzaajbycxwompif.supabase.co/functions/v1/send-admin-notification',
                jsonb_build_object(
                    'type', 'new_search_request',
                    'data', notification_payload
                ),
                '{"Content-Type": "application/json"}'::jsonb
            );
            
            RAISE LOG 'New search request notification sent successfully';
            
        EXCEPTION WHEN OTHERS THEN
            RAISE LOG 'Failed to send new search request notification: %', SQLERRM;
            -- Continue execution even if HTTP call fails
        END;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Search request trigger execution failed with error: %', SQLERRM;
    END;
    
    RETURN NEW;
END;
$function$;