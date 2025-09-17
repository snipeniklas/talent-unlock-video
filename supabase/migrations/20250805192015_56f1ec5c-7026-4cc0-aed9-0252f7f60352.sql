-- Migration: Von Recruiting zu RaaS (Resources as a Service)
-- Umbenennung von candidates zu resources und candidate_assignments zu resource_allocations

-- 1. Neue resources Tabelle erstellen (basiert auf candidates)
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  location TEXT,
  current_position TEXT,
  experience_years INTEGER,
  skills TEXT[],
  languages TEXT[],
  education TEXT,
  availability TEXT CHECK (availability IN ('immediate', '2_weeks', '1_month', '3_months')),
  hourly_rate_min INTEGER,
  hourly_rate_max INTEGER,
  cv_url TEXT,
  portfolio_url TEXT,
  notes TEXT, -- Interne Notizen für HeyTalent
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'allocated', 'busy', 'unavailable')),
  created_by UUID NOT NULL, -- Admin der die Ressource angelegt hat
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Neue resource_allocations Tabelle erstellen (basiert auf candidate_assignments)
CREATE TABLE public.resource_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  search_request_id UUID NOT NULL REFERENCES public.search_requests(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  allocated_by UUID NOT NULL, -- Admin der die Zuweisung gemacht hat
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'reviewed', 'allocated', 'active', 'completed', 'cancelled')),
  client_feedback TEXT,
  admin_notes TEXT,
  hourly_rate INTEGER, -- Vereinbarter Stundensatz
  estimated_hours_per_week INTEGER,
  start_date DATE,
  end_date DATE,
  allocated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(search_request_id, resource_id)
);

-- 3. Daten von candidates zu resources migrieren
INSERT INTO public.resources (
  id, first_name, last_name, email, phone, location, current_position,
  experience_years, skills, languages, education, availability,
  hourly_rate_min, hourly_rate_max, cv_url, portfolio_url, notes,
  rating, status, created_by, created_at, updated_at
)
SELECT 
  id, first_name, last_name, email, phone, location, current_position,
  experience_years, skills, languages, education, availability,
  salary_expectation_min, salary_expectation_max, cv_url, portfolio_url, notes,
  rating, 
  CASE 
    WHEN status = 'interviewing' THEN 'allocated'
    WHEN status = 'placed' THEN 'busy'
    ELSE status
  END,
  created_by, created_at, updated_at
FROM public.candidates;

-- 4. Daten von candidate_assignments zu resource_allocations migrieren
INSERT INTO public.resource_allocations (
  id, search_request_id, resource_id, allocated_by, status,
  client_feedback, admin_notes, allocated_at, updated_at
)
SELECT 
  id, search_request_id, candidate_id, assigned_by,
  CASE 
    WHEN status = 'shortlisted' THEN 'allocated'
    WHEN status = 'interview_scheduled' THEN 'active'
    WHEN status = 'interview_completed' THEN 'active'
    WHEN status = 'offer_made' THEN 'active'
    WHEN status = 'accepted' THEN 'completed'
    WHEN status = 'rejected' THEN 'cancelled'
    ELSE status
  END,
  client_feedback, admin_notes, assigned_at, updated_at
FROM public.candidate_assignments;

-- 5. RLS für resources
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Nur Admins können Ressourcen verwalten
CREATE POLICY "Admins can manage resources" 
ON public.resources 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 6. RLS für resource_allocations  
ALTER TABLE public.resource_allocations ENABLE ROW LEVEL SECURITY;

-- Admins können alle Zuweisungen verwalten
CREATE POLICY "Admins can manage resource allocations" 
ON public.resource_allocations 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Kunden können Zuweisungen für ihre Suchaufträge sehen
CREATE POLICY "Users can view allocations for their search requests" 
ON public.resource_allocations 
FOR SELECT 
USING (
  search_request_id IN (
    SELECT id FROM public.search_requests 
    WHERE company_id = get_user_company(auth.uid())
  )
);

-- Kunden können Status von Zuweisungen für ihre Suchaufträge aktualisieren
CREATE POLICY "Users can update allocation status for their requests" 
ON public.resource_allocations 
FOR UPDATE 
USING (
  search_request_id IN (
    SELECT id FROM public.search_requests 
    WHERE company_id = get_user_company(auth.uid())
  )
);

-- 7. Trigger für automatische Timestamps
CREATE TRIGGER update_resources_updated_at
BEFORE UPDATE ON public.resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resource_allocations_updated_at
BEFORE UPDATE ON public.resource_allocations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Alte Tabellen löschen (nachdem Daten migriert wurden)
DROP TABLE public.candidate_assignments;
DROP TABLE public.candidates;