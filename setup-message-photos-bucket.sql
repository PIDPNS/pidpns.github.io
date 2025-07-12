-- ===============================================
-- SETUP MESSAGE PHOTOS STORAGE BUCKET
-- Run this in your Supabase SQL Editor
-- ===============================================

-- Create message-photos bucket for award message photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-photos',
  'message-photos',
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for message-photos bucket
CREATE POLICY "Allow authenticated users to upload message photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'message-photos' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow public access to message photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'message-photos');

CREATE POLICY "Allow authenticated users to update message photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'message-photos' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow authenticated users to delete message photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'message-photos' AND 
    auth.role() = 'authenticated'
  );
