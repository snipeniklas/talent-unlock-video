-- Add phone number field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN phone text;

-- Make phone number not nullable for new registrations
-- (existing users can have null values)
-- We'll enforce this in the application layer