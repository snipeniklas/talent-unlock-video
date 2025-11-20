-- Set CASCADE DELETE for all candidate-related foreign keys
-- This ensures when a candidate is deleted, all related data is automatically removed

-- First, drop existing foreign keys and recreate them with CASCADE
ALTER TABLE candidate_identity 
DROP CONSTRAINT IF EXISTS candidate_identity_candidate_id_fkey,
ADD CONSTRAINT candidate_identity_candidate_id_fkey 
  FOREIGN KEY (candidate_id) 
  REFERENCES candidates(id) 
  ON DELETE CASCADE;

ALTER TABLE candidate_experience 
DROP CONSTRAINT IF EXISTS candidate_experience_candidate_id_fkey,
ADD CONSTRAINT candidate_experience_candidate_id_fkey 
  FOREIGN KEY (candidate_id) 
  REFERENCES candidates(id) 
  ON DELETE CASCADE;

ALTER TABLE candidate_languages 
DROP CONSTRAINT IF EXISTS candidate_languages_candidate_id_fkey,
ADD CONSTRAINT candidate_languages_candidate_id_fkey 
  FOREIGN KEY (candidate_id) 
  REFERENCES candidates(id) 
  ON DELETE CASCADE;

ALTER TABLE candidate_links 
DROP CONSTRAINT IF EXISTS candidate_links_candidate_id_fkey,
ADD CONSTRAINT candidate_links_candidate_id_fkey 
  FOREIGN KEY (candidate_id) 
  REFERENCES candidates(id) 
  ON DELETE CASCADE;

-- For search_request_allocations, we SET NULL instead of CASCADE
-- This preserves the allocation history even if the candidate is deleted
ALTER TABLE search_request_allocations 
DROP CONSTRAINT IF EXISTS search_request_allocations_candidate_id_fkey,
ADD CONSTRAINT search_request_allocations_candidate_id_fkey 
  FOREIGN KEY (candidate_id) 
  REFERENCES candidates(id) 
  ON DELETE SET NULL;