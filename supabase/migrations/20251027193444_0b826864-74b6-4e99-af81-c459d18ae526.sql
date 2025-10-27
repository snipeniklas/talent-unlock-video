-- Add next_send_date column to outreach_campaigns table
ALTER TABLE outreach_campaigns 
ADD COLUMN next_send_date TIMESTAMPTZ;

-- Create index for performance on active campaigns
CREATE INDEX idx_campaigns_next_send ON outreach_campaigns(next_send_date) 
WHERE status = 'active';

-- Enable pg_cron and pg_net extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule pg_cron job to process due campaigns every 5 minutes
SELECT cron.schedule(
  'process-due-outreach-campaigns',
  '*/5 * * * *',  -- Every 5 minutes
  $$
  SELECT net.http_post(
    url := 'https://pcbpxhzaajbycxwompif.supabase.co/functions/v1/process-outreach-campaigns',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjYnB4aHphYWpieWN4d29tcGlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MDI5MTgsImV4cCI6MjA2OTk3ODkxOH0.nTrbVlxyN3k26yeNnOFVRkoIgvD9-zczAjF2H-4R798'
    ),
    body := jsonb_build_object('immediate', false)
  ) as request_id;
  $$
);