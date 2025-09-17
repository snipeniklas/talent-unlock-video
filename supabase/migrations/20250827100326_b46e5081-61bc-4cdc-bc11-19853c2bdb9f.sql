-- Allow customers to view candidate data for allocated candidates
CREATE POLICY "Users can view candidates allocated to their search requests"
ON public.candidates
FOR SELECT
USING (
  id IN (
    SELECT candidate_id 
    FROM public.search_request_allocations sra
    JOIN public.search_requests sr ON sra.search_request_id = sr.id
    WHERE sr.company_id = get_user_company(auth.uid())
  )
);

-- Allow customers to view candidate identity for allocated candidates
CREATE POLICY "Users can view candidate identity for allocated candidates"
ON public.candidate_identity
FOR SELECT
USING (
  candidate_id IN (
    SELECT candidate_id 
    FROM public.search_request_allocations sra
    JOIN public.search_requests sr ON sra.search_request_id = sr.id
    WHERE sr.company_id = get_user_company(auth.uid())
  )
);

-- Allow customers to view candidate experience for allocated candidates
CREATE POLICY "Users can view candidate experience for allocated candidates"
ON public.candidate_experience
FOR SELECT
USING (
  candidate_id IN (
    SELECT candidate_id 
    FROM public.search_request_allocations sra
    JOIN public.search_requests sr ON sra.search_request_id = sr.id
    WHERE sr.company_id = get_user_company(auth.uid())
  )
);

-- Allow customers to view candidate languages for allocated candidates
CREATE POLICY "Users can view candidate languages for allocated candidates"
ON public.candidate_languages
FOR SELECT
USING (
  candidate_id IN (
    SELECT candidate_id 
    FROM public.search_request_allocations sra
    JOIN public.search_requests sr ON sra.search_request_id = sr.id
    WHERE sr.company_id = get_user_company(auth.uid())
  )
);

-- Allow customers to view candidate links for allocated candidates
CREATE POLICY "Users can view candidate links for allocated candidates"
ON public.candidate_links
FOR SELECT
USING (
  candidate_id IN (
    SELECT candidate_id 
    FROM public.search_request_allocations sra
    JOIN public.search_requests sr ON sra.search_request_id = sr.id
    WHERE sr.company_id = get_user_company(auth.uid())
  )
);

-- Allow customers to update allocation status for their search requests
CREATE POLICY "Users can update allocations for their company search requests"
ON public.search_request_allocations
FOR UPDATE
USING (
  search_request_id IN (
    SELECT id 
    FROM public.search_requests 
    WHERE company_id = get_user_company(auth.uid())
  )
)
WITH CHECK (
  search_request_id IN (
    SELECT id 
    FROM public.search_requests 
    WHERE company_id = get_user_company(auth.uid())
  )
);