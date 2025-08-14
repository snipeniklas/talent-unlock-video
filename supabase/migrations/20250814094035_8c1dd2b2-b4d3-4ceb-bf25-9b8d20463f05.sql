-- Remove the job_title constraint to allow free text input
ALTER TABLE public.search_requests 
DROP CONSTRAINT IF EXISTS check_job_title;