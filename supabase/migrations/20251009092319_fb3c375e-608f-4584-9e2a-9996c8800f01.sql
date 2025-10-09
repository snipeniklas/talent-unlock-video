-- Create table for storing Microsoft 365 access tokens
CREATE TABLE IF NOT EXISTS public.ms365_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  email_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, email_address)
);

-- Enable RLS
ALTER TABLE public.ms365_tokens ENABLE ROW LEVEL SECURITY;

-- Admins can manage all tokens
CREATE POLICY "Admins can manage all MS365 tokens"
ON public.ms365_tokens
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Users can view and update their own tokens
CREATE POLICY "Users can manage their own MS365 tokens"
ON public.ms365_tokens
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create table for storing Microsoft 365 webhook subscriptions
CREATE TABLE IF NOT EXISTS public.ms365_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id TEXT NOT NULL UNIQUE,
  resource TEXT NOT NULL,
  change_type TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.ms365_subscriptions ENABLE ROW LEVEL SECURITY;

-- Admins can manage all subscriptions
CREATE POLICY "Admins can manage all MS365 subscriptions"
ON public.ms365_subscriptions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create table for storing emails from Microsoft 365
CREATE TABLE IF NOT EXISTS public.crm_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  ms365_message_id TEXT NOT NULL UNIQUE,
  subject TEXT,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_emails TEXT[],
  cc_emails TEXT[],
  body_preview TEXT,
  body_content TEXT,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL,
  has_attachments BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  importance TEXT,
  conversation_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.crm_emails ENABLE ROW LEVEL SECURITY;

-- Admins can manage all emails
CREATE POLICY "Admins can manage all CRM emails"
ON public.crm_emails
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Enable Realtime for crm_emails
ALTER TABLE public.crm_emails REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_emails;

-- Create index for faster email lookups
CREATE INDEX idx_crm_emails_contact_id ON public.crm_emails(contact_id);
CREATE INDEX idx_crm_emails_received_at ON public.crm_emails(received_at DESC);
CREATE INDEX idx_crm_emails_from_email ON public.crm_emails(from_email);

-- Create trigger for updated_at
CREATE TRIGGER update_ms365_tokens_updated_at
  BEFORE UPDATE ON public.ms365_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ms365_subscriptions_updated_at
  BEFORE UPDATE ON public.ms365_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_emails_updated_at
  BEFORE UPDATE ON public.crm_emails
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();