-- Add user_id column to crm_contacts to link registered users
ALTER TABLE public.crm_contacts 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX idx_crm_contacts_user_id ON public.crm_contacts(user_id);

-- Ensure one user can only appear once as a contact
ALTER TABLE public.crm_contacts 
ADD CONSTRAINT unique_user_contact UNIQUE(user_id);

-- Update handle_new_user function to create/link CRM contacts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    company_data JSONB;
    new_company_id UUID;
    new_crm_company_id UUID;
    is_company_admin BOOLEAN := false;
    notification_payload JSONB;
    existing_contact_id UUID;
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
        
        -- Also create CRM company entry
        INSERT INTO public.crm_companies (name, email, website, status)
        VALUES (
            company_data ->> 'name',
            company_data ->> 'email',
            company_data ->> 'website',
            'customer'
        )
        RETURNING id INTO new_crm_company_id;
        
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
    
    -- CRM Integration: Check if contact with this email already exists
    SELECT id INTO existing_contact_id
    FROM public.crm_contacts
    WHERE email = NEW.email
    LIMIT 1;
    
    IF existing_contact_id IS NOT NULL THEN
        -- Contact exists, link it to the registered user
        UPDATE public.crm_contacts
        SET 
            user_id = NEW.id,
            first_name = COALESCE(first_name, NEW.raw_user_meta_data ->> 'first_name'),
            last_name = COALESCE(last_name, NEW.raw_user_meta_data ->> 'last_name'),
            status = CASE 
                WHEN status = 'new' THEN 'contacted' 
                ELSE status 
            END,
            crm_company_id = COALESCE(crm_company_id, new_crm_company_id),
            updated_at = now()
        WHERE id = existing_contact_id;
        
        RAISE LOG 'Existing contact % linked to user %', existing_contact_id, NEW.id;
    ELSE
        -- No existing contact, create new CRM contact for registered user
        INSERT INTO public.crm_contacts (
            user_id,
            first_name,
            last_name,
            email,
            status,
            priority,
            lead_source,
            crm_company_id
        )
        VALUES (
            NEW.id,
            NEW.raw_user_meta_data ->> 'first_name',
            NEW.raw_user_meta_data ->> 'last_name',
            NEW.email,
            'contacted',
            'medium',
            'website_registration',
            new_crm_company_id
        );
        
        RAISE LOG 'New CRM contact created for user %', NEW.id;
    END IF;
    
    RETURN NEW;
END;
$function$;