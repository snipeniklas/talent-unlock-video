-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Create RLS policies for avatar uploads
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Admins can upload avatars" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update avatars" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete avatars" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars' AND has_role(auth.uid(), 'admin'::app_role));

-- Add avatar_url column to candidate_identity table
ALTER TABLE public.candidate_identity 
ADD COLUMN avatar_url TEXT;