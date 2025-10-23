-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule outreach campaign processing every 10 minutes
SELECT cron.schedule(
  'process-outreach-campaigns',
  '*/10 * * * *', -- Every 10 minutes
  $$
  SELECT
    net.http_post(
      url := 'https://pcbpxhzaajbycxwompif.supabase.co/functions/v1/process-outreach-campaigns',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjYnB4aHphYWpieWN4d29tcGlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MDI5MTgsImV4cCI6MjA2OTk3ODkxOH0.nTrbVlxyN3k26yeNnOFVRkoIgvD9-zczAjF2H-4R798"}'::jsonb,
      body := '{}'::jsonb
    ) as request_id;
  $$
);