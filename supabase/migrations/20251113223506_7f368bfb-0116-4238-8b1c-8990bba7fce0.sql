-- Create function to get total candidates count (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_total_candidates_count()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(*)::integer FROM candidates;
$$;