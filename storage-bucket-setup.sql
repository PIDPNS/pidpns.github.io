-- ===============================================
-- STORAGE BUCKET SETUP FOR MESSAGE PHOTOS
-- Run this in your Supabase SQL Editor to ensure storage is properly configured
-- ===============================================

-- Create the message-photos bucket if it doesn't exist
-- (This might already exist based on your current script.js usage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-photos', 'message-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files to message-photos bucket
CREATE POLICY "Allow authenticated users to upload message photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'message-photos');

-- Allow public read access to message photos
CREATE POLICY "Allow public read access to message photos" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'message-photos');

-- Allow users to delete their own uploaded photos (optional)
CREATE POLICY "Allow users to delete their own message photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'message-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
