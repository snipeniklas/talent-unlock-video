-- Allow all authenticated users to view all candidates (for "All Specialists" tab)
CREATE POLICY "All authenticated users can view all candidates"
ON public.candidates
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Allow all authenticated users to view all candidate identities
CREATE POLICY "All authenticated users can view all candidate identities"
ON public.candidate_identity
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Allow all authenticated users to view all candidate experiences
CREATE POLICY "All authenticated users can view all candidate experiences"
ON public.candidate_experience
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Allow all authenticated users to view all candidate languages
CREATE POLICY "All authenticated users can view all candidate languages"
ON public.candidate_languages
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Allow all authenticated users to view all candidate links
CREATE POLICY "All authenticated users can view all candidate links"
ON public.candidate_links
FOR SELECT
USING (auth.uid() IS NOT NULL);