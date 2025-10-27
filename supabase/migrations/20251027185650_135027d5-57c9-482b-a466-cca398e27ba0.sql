-- Add daily_send_time column to outreach_campaigns
ALTER TABLE public.outreach_campaigns 
ADD COLUMN daily_send_time TIME;

-- Add comment for documentation
COMMENT ON COLUMN public.outreach_campaigns.daily_send_time IS 
'Die Uhrzeit (UTC), zu der täglich E-Mails für diese Kampagne versendet werden sollen. Wird beim Aktivieren der Kampagne automatisch gesetzt.';