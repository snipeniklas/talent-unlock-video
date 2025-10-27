-- Create outreach_contact_activities table for tracking removal reasons and other activities
CREATE TABLE IF NOT EXISTS public.outreach_contact_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.outreach_campaigns(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('removed_no_contact', 'removed_reply_received', 'removed_meeting_booked', 'added', 'email_sent', 'email_opened', 'email_clicked')),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  reply_content TEXT,
  meeting_date TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.outreach_contact_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage all activities"
  ON public.outreach_contact_activities
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view activities for their campaigns"
  ON public.outreach_contact_activities
  FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM public.outreach_campaigns
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_outreach_activities_campaign ON public.outreach_contact_activities(campaign_id);
CREATE INDEX idx_outreach_activities_contact ON public.outreach_contact_activities(contact_id);
CREATE INDEX idx_outreach_activities_type ON public.outreach_contact_activities(activity_type);
CREATE INDEX idx_outreach_activities_created_at ON public.outreach_contact_activities(created_at DESC);