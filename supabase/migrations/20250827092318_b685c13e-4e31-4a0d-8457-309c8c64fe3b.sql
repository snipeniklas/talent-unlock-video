-- Create allocations table for assigning candidates to search requests
CREATE TABLE public.search_request_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  search_request_id UUID NOT NULL,
  candidate_id UUID NOT NULL,
  allocated_by UUID NOT NULL,
  allocated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'proposed',
  notes TEXT,
  client_feedback TEXT,
  feedback_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraints
  UNIQUE(search_request_id, candidate_id)
);

-- Add status constraint
ALTER TABLE public.search_request_allocations 
ADD CONSTRAINT valid_allocation_status 
CHECK (status IN ('proposed', 'presented', 'accepted', 'rejected', 'hired'));

-- Create indexes for better performance
CREATE INDEX idx_allocations_search_request ON public.search_request_allocations(search_request_id);
CREATE INDEX idx_allocations_candidate ON public.search_request_allocations(candidate_id);
CREATE INDEX idx_allocations_status ON public.search_request_allocations(status);

-- Enable RLS
ALTER TABLE public.search_request_allocations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage all allocations" 
ON public.search_request_allocations 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view allocations for their company search requests" 
ON public.search_request_allocations 
FOR SELECT 
USING (search_request_id IN (
  SELECT id FROM public.search_requests 
  WHERE company_id = get_user_company(auth.uid())
));

-- Create trigger for updated_at
CREATE TRIGGER update_allocations_updated_at
  BEFORE UPDATE ON public.search_request_allocations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();