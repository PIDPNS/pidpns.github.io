-- ===============================================
-- STORAGE BUCKETS FOR OFFICIAL PAGE EDITOR
-- Run this after creating the official_page_content table
-- ===============================================

-- Create logos bucket for logo uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'logos',
  'logos', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Create photos bucket for general photo uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos',
  'photos',
  true, 
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Create storage policies for logos bucket
CREATE POLICY "Allow authenticated users to upload logos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'logos' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow public access to logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'logos');

CREATE POLICY "Allow authenticated users to update logos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'logos' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow authenticated users to delete logos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'logos' AND 
    auth.role() = 'authenticated'
  );

-- Create storage policies for photos bucket
CREATE POLICY "Allow authenticated users to upload photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'photos' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow public access to photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos');

CREATE POLICY "Allow authenticated users to update photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'photos' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow authenticated users to delete photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'photos' AND 
    auth.role() = 'authenticated'
  );
