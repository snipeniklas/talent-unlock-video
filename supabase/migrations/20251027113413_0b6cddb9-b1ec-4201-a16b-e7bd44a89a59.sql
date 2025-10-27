-- Update cron job to run every 15 minutes instead of every minute
-- This is more efficient since we pre-calculate send times at campaign creation

SELECT cron.unschedule('process-outreach-campaigns');
SELECT cron.unschedule('process-outreach-campaigns-every-10min');

-- Create new cron job that runs every 15 minutes
SELECT cron.schedule(
  'process-outreach-campaigns-every-15min',
  '*/15 * * * *', -- Every 15 minutes
  $$
  SELECT net.http_post(
    url := 'https://pcbpxhzaajbycxwompif.supabase.co/functions/v1/process-outreach-campaigns',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjYnB4aHphYWpieWN4d29tcGlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MDI5MTgsImV4cCI6MjA2OTk3ODkxOH0.nTrbVlxyN3k26yeNnOFVRkoIgvD9-zczAjF2H-4R798"}'::jsonb,
    body := '{"trigger": "cron"}'::jsonb
  ) AS request_id;
  $$
);