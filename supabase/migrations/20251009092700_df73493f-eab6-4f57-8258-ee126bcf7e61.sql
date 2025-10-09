-- Add user_id to crm_emails to track which user's email account received this
ALTER TABLE public.crm_emails
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for user-based email lookups
CREATE INDEX idx_crm_emails_user_id ON public.crm_emails(user_id);

-- Update RLS policies for crm_emails to allow users to see their own emails
DROP POLICY IF EXISTS "Admins can manage all CRM emails" ON public.crm_emails;

CREATE POLICY "Admins can manage all CRM emails"
ON public.crm_emails
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own CRM emails"
ON public.crm_emails
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own CRM emails"
ON public.crm_emails
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Add a settings table for user-specific email preferences
CREATE TABLE IF NOT EXISTS public.user_email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  sync_enabled BOOLEAN DEFAULT true,
  sync_sent_items BOOLEAN DEFAULT false,
  auto_match_contacts BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_email_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for email settings
CREATE POLICY "Users can manage their own email settings"
ON public.user_email_settings
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all email settings"
ON public.user_email_settings
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_user_email_settings_updated_at
  BEFORE UPDATE ON public.user_email_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();