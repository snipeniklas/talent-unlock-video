-- Add status tracking for client feedback on allocated candidates
-- This allows clients to manage candidates in different stages (interested, not interested, etc.)

-- Update search_request_allocations table to include client status
ALTER TABLE public.search_request_allocations 
ADD COLUMN IF NOT EXISTS client_status TEXT DEFAULT 'proposed' CHECK (client_status IN ('proposed', 'reviewed', 'interested', 'not_interested', 'interview_scheduled', 'hired', 'rejected'));

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_search_request_allocations_client_status 
ON public.search_request_allocations(client_status);

-- Add index for querying by search request
CREATE INDEX IF NOT EXISTS idx_search_request_allocations_search_request_id 
ON public.search_request_allocations(search_request_id);

-- Update the updated_at timestamp when client_status changes
CREATE OR REPLACE FUNCTION update_allocation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamp
DROP TRIGGER IF EXISTS trigger_update_allocation_updated_at ON public.search_request_allocations;
CREATE TRIGGER trigger_update_allocation_updated_at
    BEFORE UPDATE ON public.search_request_allocations
    FOR EACH ROW
    EXECUTE FUNCTION update_allocation_updated_at();