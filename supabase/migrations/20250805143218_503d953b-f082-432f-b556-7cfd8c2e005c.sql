-- Create app_role enum with company_admin
CREATE TYPE public.app_role AS ENUM ('admin', 'company_admin', 'user');

-- Create companies table
CREATE TABLE public.companies (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Create invitations table for company invites
CREATE TABLE public.invitations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(company_id, email)
);

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id AND role = _role
    );
$$;

-- Create security definer function to get user's company
CREATE OR REPLACE FUNCTION public.get_user_company(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    SELECT company_id
    FROM public.profiles
    WHERE user_id = _user_id;
$$;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    company_data JSONB;
    new_company_id UUID;
    is_company_admin BOOLEAN := false;
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
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invitations_updated_at
    BEFORE UPDATE ON public.invitations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for companies
CREATE POLICY "Users can view their own company" 
ON public.companies FOR SELECT 
USING (id = public.get_user_company(auth.uid()));

CREATE POLICY "Company admins can update their company" 
ON public.companies FOR UPDATE 
USING (
    id = public.get_user_company(auth.uid()) 
    AND public.has_role(auth.uid(), 'company_admin')
);

-- RLS Policies for profiles
CREATE POLICY "Users can view profiles in their company" 
ON public.profiles FOR SELECT 
USING (
    company_id = public.get_user_company(auth.uid())
    OR user_id = auth.uid()
);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (user_id = auth.uid());

-- RLS Policies for user_roles
CREATE POLICY "Users can view roles in their company" 
ON public.user_roles FOR SELECT 
USING (
    user_id IN (
        SELECT p.user_id 
        FROM public.profiles p 
        WHERE p.company_id = public.get_user_company(auth.uid())
    )
    OR user_id = auth.uid()
);

-- RLS Policies for invitations
CREATE POLICY "Company admins can view their company invitations" 
ON public.invitations FOR SELECT 
USING (
    company_id = public.get_user_company(auth.uid())
    AND public.has_role(auth.uid(), 'company_admin')
);

CREATE POLICY "Company admins can create invitations" 
ON public.invitations FOR INSERT 
WITH CHECK (
    company_id = public.get_user_company(auth.uid())
    AND public.has_role(auth.uid(), 'company_admin')
    AND invited_by = auth.uid()
);

CREATE POLICY "Company admins can update their invitations" 
ON public.invitations FOR UPDATE 
USING (
    company_id = public.get_user_company(auth.uid())
    AND public.has_role(auth.uid(), 'company_admin')
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_invitations_company_id ON public.invitations(company_id);
CREATE INDEX idx_invitations_email ON public.invitations(email);