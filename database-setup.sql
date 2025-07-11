-- ===============================================
-- DATABASE TABLE STRUCTURE FOR OFFICIAL PAGE CONTENT
-- Run this to ensure all required columns exist
-- ===============================================

-- Create the official_page_content table if it doesn't exist
CREATE TABLE IF NOT EXISTS official_page_content (
  id BIGSERIAL PRIMARY KEY,
  title TEXT,
  event_name TEXT,
  event_subtitle TEXT,
  event_description TEXT,
  officiated_text TEXT,
  vip_name TEXT,
  vip_position TEXT,
  event_date TEXT,
  event_time TEXT,
  event_location TEXT,
  slogan TEXT,
  logo_url TEXT,
  minister_photo_url TEXT,
  additional_logos JSONB DEFAULT '[]'::jsonb, -- Array of additional logo URLs with positions
  bottom_logos JSONB DEFAULT '[]'::jsonb, -- Array of bottom logo URLs with positions
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add the additional_logos column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'official_page_content' 
    AND column_name = 'additional_logos'
  ) THEN
    ALTER TABLE official_page_content 
    ADD COLUMN additional_logos JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add the bottom_logos column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'official_page_content' 
    AND column_name = 'bottom_logos'
  ) THEN
    ALTER TABLE official_page_content 
    ADD COLUMN bottom_logos JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Create or update RLS policies
ALTER TABLE official_page_content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Allow authenticated users to read official page content" ON official_page_content;
DROP POLICY IF EXISTS "Allow authenticated users to insert official page content" ON official_page_content;
DROP POLICY IF EXISTS "Allow authenticated users to update official page content" ON official_page_content;

-- Policy for authenticated users to read all records
CREATE POLICY "Allow authenticated users to read official page content"
ON official_page_content FOR SELECT
TO authenticated
USING (true);

-- Policy for authenticated users to insert records
CREATE POLICY "Allow authenticated users to insert official page content"
ON official_page_content FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy for authenticated users to update records
CREATE POLICY "Allow authenticated users to update official page content"
ON official_page_content FOR UPDATE
TO authenticated
USING (true);

-- Create an index on is_active for better performance
CREATE INDEX IF NOT EXISTS idx_official_page_content_active 
ON official_page_content(is_active, created_at DESC);

-- Insert default content if table is empty
INSERT INTO official_page_content (
  title, event_name, event_subtitle, event_description,
  officiated_text, vip_name, vip_position,
  event_date, event_time, event_location, slogan,
  additional_logos, bottom_logos, is_active
) 
SELECT 
  'PIDPNS Official Digital Backdrop',
  'Digital Innovation Event',
  'Technology & Digital Transformation',
  'Advancing Malaysia''s Digital Future',
  'Officiated by',
  'Minister Name',
  'Minister of Digital',
  'Date: TBD',
  'Time: TBD',
  'Cyberjaya, Malaysia',
  'Digital Innovation for Malaysia',
  '[]'::jsonb,
  '[]'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM official_page_content WHERE is_active = true);
