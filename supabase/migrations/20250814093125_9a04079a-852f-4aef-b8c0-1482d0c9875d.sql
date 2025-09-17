-- Update search_requests table with new structure (without duplicate trigger)
-- Add new columns
ALTER TABLE public.search_requests 
ADD COLUMN customer_industry text,
ADD COLUMN number_of_workers integer,
ADD COLUMN job_title text,
ADD COLUMN work_areas text[],
ADD COLUMN experience_level_new text,
ADD COLUMN weekly_hours integer,
ADD COLUMN start_date date,
ADD COLUMN end_date date,
ADD COLUMN requirements_list text[],
ADD COLUMN skills_list text[],
ADD COLUMN main_tasks text[];

-- Add check constraints for the new fields
ALTER TABLE public.search_requests 
ADD CONSTRAINT check_job_title CHECK (job_title IN ('backoffice', 'software_developer', 'ki_developer')),
ADD CONSTRAINT check_experience_level_new CHECK (experience_level_new IN ('junior_ba', 'senior_ba', 'senior_ma')),
ADD CONSTRAINT check_weekly_hours CHECK (weekly_hours IN (20, 30, 40)),
ADD CONSTRAINT check_number_of_workers CHECK (number_of_workers > 0);