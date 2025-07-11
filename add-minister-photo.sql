-- ===============================================
-- ADD MINISTER PHOTO FIELD TO OFFICIAL PAGE CONTENT
-- Run this to add minister photo support
-- ===============================================

-- Add minister photo URL field to existing table
ALTER TABLE official_page_content 
ADD COLUMN IF NOT EXISTS minister_photo_url TEXT DEFAULT NULL;
