-- Add optional category column to candidates table
ALTER TABLE public.candidates ADD COLUMN category text;

-- Add comment for documentation
COMMENT ON COLUMN public.candidates.category IS 'Resource category: ki, it, or backoffice (optional)';