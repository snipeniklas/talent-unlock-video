-- Add DELETE policies for search_requests table
-- Users can delete their own search requests
CREATE POLICY "Users can delete their own search requests" 
ON public.search_requests 
FOR DELETE 
USING (created_by = auth.uid());

-- Company admins can delete all search requests from their company
CREATE POLICY "Company admins can delete their company search requests" 
ON public.search_requests 
FOR DELETE 
USING ((company_id = get_user_company(auth.uid())) AND has_role(auth.uid(), 'company_admin'::app_role));

-- Admins can delete all search requests
CREATE POLICY "Admins can delete all search requests" 
ON public.search_requests 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));