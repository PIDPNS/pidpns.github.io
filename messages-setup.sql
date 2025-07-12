-- ===============================================
-- DATABASE TABLE STRUCTURE FOR AWARD MESSAGES
-- Run this to create the messages table in Supabase
-- ===============================================

-- Create the award_messages table
CREATE TABLE IF NOT EXISTS award_messages (
  id BIGSERIAL PRIMARY KEY,
  recipient_name TEXT NOT NULL,
  message TEXT NOT NULL,
  photo_url TEXT,
  sender_email TEXT,
  sender_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by TEXT
);

-- Create RLS policies for the award_messages table
ALTER TABLE award_messages ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to insert messages
CREATE POLICY "Allow authenticated users to insert messages"
ON award_messages FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy for authenticated users to read their own messages
CREATE POLICY "Allow users to read their own messages"
ON award_messages FOR SELECT
TO authenticated
USING (sender_email = auth.email());

-- Policy for admins to read all messages (you can modify this based on your admin setup)
CREATE POLICY "Allow admins to read all messages"
ON award_messages FOR SELECT
TO authenticated
USING (true); -- You might want to add admin role check here

-- Policy for admins to update messages (approval/rejection)
CREATE POLICY "Allow admins to update messages"
ON award_messages FOR UPDATE
TO authenticated
USING (true); -- You might want to add admin role check here

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_award_messages_status 
ON award_messages(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_award_messages_sender 
ON award_messages(sender_email, created_at DESC);

-- Create storage bucket for message photos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-photos', 'message-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for message photos
CREATE POLICY "Allow authenticated users to upload message photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'message-photos');

CREATE POLICY "Allow public to view message photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'message-photos');

CREATE POLICY "Allow authenticated users to delete their message photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'message-photos');
