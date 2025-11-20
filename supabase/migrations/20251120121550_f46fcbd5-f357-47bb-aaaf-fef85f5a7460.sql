-- Fix the foreign key constraint for search_request_allocations
-- Change from SET NULL to CASCADE so allocations are completely removed when candidate is deleted

ALTER TABLE search_request_allocations 
DROP CONSTRAINT IF EXISTS search_request_allocations_candidate_id_fkey;

ALTER TABLE search_request_allocations
ADD CONSTRAINT search_request_allocations_candidate_id_fkey 
FOREIGN KEY (candidate_id) 
REFERENCES candidates(id) 
ON DELETE CASCADE;