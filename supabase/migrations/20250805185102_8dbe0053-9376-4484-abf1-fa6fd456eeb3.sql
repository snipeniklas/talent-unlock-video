-- Tabelle für Suchaufträge (die von Kunden erstellt werden)
CREATE TABLE public.search_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  created_by UUID NOT NULL, -- User ID des Kunden
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  location TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  employment_type TEXT CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'freelance')),
  skills_required TEXT[],
  experience_level TEXT CHECK (experience_level IN ('junior', 'mid', 'senior', 'lead')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabelle für Bewerberprofile (von HejTalent-Admins erstellt)
CREATE TABLE public.candidates (
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
  salary_expectation_min INTEGER,
  salary_expectation_max INTEGER,
  cv_url TEXT,
  portfolio_url TEXT,
  notes TEXT, -- Interne Notizen für HejTalent
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'interviewing', 'placed', 'unavailable')),
  created_by UUID NOT NULL, -- Admin der den Bewerber angelegt hat
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabelle für Zuweisungen von Bewerbern zu Suchaufträgen
CREATE TABLE public.candidate_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  search_request_id UUID NOT NULL REFERENCES public.search_requests(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL, -- Admin der die Zuweisung gemacht hat
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'reviewed', 'shortlisted', 'interview_scheduled', 'interview_completed', 'offer_made', 'accepted', 'rejected')),
  client_feedback TEXT,
  admin_notes TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(search_request_id, candidate_id)
);

-- RLS für search_requests
ALTER TABLE public.search_requests ENABLE ROW LEVEL SECURITY;

-- Kunden können ihre eigenen Suchaufträge sehen und erstellen
CREATE POLICY "Users can view their company search requests" 
ON public.search_requests 
FOR SELECT 
USING (company_id = get_user_company(auth.uid()));

CREATE POLICY "Users can create search requests for their company" 
ON public.search_requests 
FOR INSERT 
WITH CHECK (company_id = get_user_company(auth.uid()) AND created_by = auth.uid());

CREATE POLICY "Users can update their company search requests" 
ON public.search_requests 
FOR UPDATE 
USING (company_id = get_user_company(auth.uid()));

-- Admins können alle Suchaufträge sehen
CREATE POLICY "Admins can view all search requests" 
ON public.search_requests 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS für candidates
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- Nur Admins können Bewerber verwalten
CREATE POLICY "Admins can manage candidates" 
ON public.candidates 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS für candidate_assignments  
ALTER TABLE public.candidate_assignments ENABLE ROW LEVEL SECURITY;

-- Admins können alle Zuweisungen verwalten
CREATE POLICY "Admins can manage assignments" 
ON public.candidate_assignments 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Kunden können Zuweisungen für ihre Suchaufträge sehen
CREATE POLICY "Users can view assignments for their search requests" 
ON public.candidate_assignments 
FOR SELECT 
USING (
  search_request_id IN (
    SELECT id FROM public.search_requests 
    WHERE company_id = get_user_company(auth.uid())
  )
);

-- Kunden können Status von Zuweisungen für ihre Suchaufträge aktualisieren
CREATE POLICY "Users can update assignment status for their requests" 
ON public.candidate_assignments 
FOR UPDATE 
USING (
  search_request_id IN (
    SELECT id FROM public.search_requests 
    WHERE company_id = get_user_company(auth.uid())
  )
);

-- Trigger für automatische Timestamps
CREATE TRIGGER update_search_requests_updated_at
BEFORE UPDATE ON public.search_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at
BEFORE UPDATE ON public.candidates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_candidate_assignments_updated_at
BEFORE UPDATE ON public.candidate_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();