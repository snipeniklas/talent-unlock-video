-- Fix the relationship between profiles and user_roles tables
-- This will resolve the "Could not find a relationship" error

-- First, let's add the missing foreign key constraint between profiles and user_roles
ALTER TABLE public.user_roles 
ADD CONSTRAINT fk_user_roles_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add an index for better performance on the join
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- Add an index on profiles.user_id for better join performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Also add foreign key constraint between profiles and auth.users if not exists
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;