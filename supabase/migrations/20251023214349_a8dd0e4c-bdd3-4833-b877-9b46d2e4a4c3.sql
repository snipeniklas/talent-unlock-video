-- Create crm_tasks table
CREATE TABLE crm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Task Details
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  
  -- Assignments
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Links (all optional)
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
  company_id UUID REFERENCES crm_companies(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES outreach_campaigns(id) ON DELETE SET NULL,
  
  -- Timestamps
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('todo', 'in_progress', 'waiting', 'completed', 'cancelled')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

-- Indices for performance
CREATE INDEX idx_crm_tasks_assigned_to ON crm_tasks(assigned_to);
CREATE INDEX idx_crm_tasks_contact_id ON crm_tasks(contact_id);
CREATE INDEX idx_crm_tasks_company_id ON crm_tasks(company_id);
CREATE INDEX idx_crm_tasks_campaign_id ON crm_tasks(campaign_id);
CREATE INDEX idx_crm_tasks_due_date ON crm_tasks(due_date);
CREATE INDEX idx_crm_tasks_status ON crm_tasks(status);

-- Enable RLS
ALTER TABLE crm_tasks ENABLE ROW LEVEL SECURITY;

-- Admins can manage all tasks
CREATE POLICY "Admins can manage all tasks"
  ON crm_tasks
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Users can view assigned or created tasks
CREATE POLICY "Users can view assigned or created tasks"
  ON crm_tasks
  FOR SELECT
  USING (
    assigned_to = auth.uid() OR 
    created_by = auth.uid() OR 
    has_role(auth.uid(), 'admin')
  );

-- Users can create tasks
CREATE POLICY "Users can create tasks"
  ON crm_tasks
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Users can update assigned or created tasks
CREATE POLICY "Users can update assigned or created tasks"
  ON crm_tasks
  FOR UPDATE
  USING (
    assigned_to = auth.uid() OR 
    created_by = auth.uid() OR 
    has_role(auth.uid(), 'admin')
  );

-- Trigger for updated_at
CREATE TRIGGER update_crm_tasks_updated_at
  BEFORE UPDATE ON crm_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();