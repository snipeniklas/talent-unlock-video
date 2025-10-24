-- Add Service Role policies for process-outreach-campaigns Edge Function
-- These policies allow the Edge Function (running with Service Role key) to access necessary tables

-- 1. outreach_campaigns: Need to read campaign data and update status
CREATE POLICY "Service role can read campaigns"
ON public.outreach_campaigns
FOR SELECT
USING (auth.uid() IS NULL);

CREATE POLICY "Service role can update campaigns"
ON public.outreach_campaigns
FOR UPDATE
USING (auth.uid() IS NULL)
WITH CHECK (auth.uid() IS NULL);

-- 2. outreach_campaign_contacts: Need to read contacts and update their status/next_send_date
CREATE POLICY "Service role can read campaign contacts"
ON public.outreach_campaign_contacts
FOR SELECT
USING (auth.uid() IS NULL);

CREATE POLICY "Service role can update campaign contacts"
ON public.outreach_campaign_contacts
FOR UPDATE
USING (auth.uid() IS NULL)
WITH CHECK (auth.uid() IS NULL);

-- 3. outreach_email_sequences: Need to read email templates
CREATE POLICY "Service role can read email sequences"
ON public.outreach_email_sequences
FOR SELECT
USING (auth.uid() IS NULL);

-- 4. outreach_sent_emails: Need to insert sent email records
CREATE POLICY "Service role can insert sent emails"
ON public.outreach_sent_emails
FOR INSERT
WITH CHECK (auth.uid() IS NULL);

CREATE POLICY "Service role can read sent emails"
ON public.outreach_sent_emails
FOR SELECT
USING (auth.uid() IS NULL);

-- 5. crm_contacts: Need to read contact email data
CREATE POLICY "Service role can read crm contacts"
ON public.crm_contacts
FOR SELECT
USING (auth.uid() IS NULL);

-- 6. crm_contact_research: Need to read research data for personalization
CREATE POLICY "Service role can read contact research"
ON public.crm_contact_research
FOR SELECT
USING (auth.uid() IS NULL);

-- 7. crm_companies: Need to read company information
CREATE POLICY "Service role can read crm companies"
ON public.crm_companies
FOR SELECT
USING (auth.uid() IS NULL);

-- 8. ms365_tokens: Need to read and update tokens for sending emails
CREATE POLICY "Service role can read ms365 tokens"
ON public.ms365_tokens
FOR SELECT
USING (auth.uid() IS NULL);

CREATE POLICY "Service role can update ms365 tokens"
ON public.ms365_tokens
FOR UPDATE
USING (auth.uid() IS NULL)
WITH CHECK (auth.uid() IS NULL);

-- 9. user_email_settings: Need to read email signatures
CREATE POLICY "Service role can read email settings"
ON public.user_email_settings
FOR SELECT
USING (auth.uid() IS NULL);

-- 10. profiles: Need to read user profile data
CREATE POLICY "Service role can read profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NULL);

-- 11. companies: Need to read company names
CREATE POLICY "Service role can read companies"
ON public.companies
FOR SELECT
USING (auth.uid() IS NULL);