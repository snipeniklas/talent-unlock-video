-- Add email_signature column to user_email_settings
ALTER TABLE public.user_email_settings 
ADD COLUMN email_signature text;