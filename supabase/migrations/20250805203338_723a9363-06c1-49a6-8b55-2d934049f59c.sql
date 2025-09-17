-- Update RLS policy for profiles to allow all authenticated users to read all profiles
DROP POLICY IF EXISTS "Users can view profiles in their company or admins can view all" ON public.profiles;

CREATE POLICY "All authenticated users can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);