-- Create Storage Bucket for WhatsApp Media
-- Run this in Supabase SQL Editor

-- 1. Create the bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'whatsapp-media',
  'whatsapp-media',
  true,
  52428800, -- 50MB
  NULL -- Allow all types
)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up RLS policies for the bucket

-- Allow public read access (to view images in chat)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'whatsapp-media' );

-- Allow authenticated users to upload
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK ( 
  bucket_id = 'whatsapp-media' 
  AND auth.role() = 'authenticated'
);

-- Allow public upload (for webhook server using anon key)
CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'whatsapp-media' );

-- Allow users to delete their own files
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
USING ( 
  bucket_id = 'whatsapp-media' 
  AND auth.role() = 'authenticated'
);

-- Allow public delete (for cleanup)
CREATE POLICY "Public Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'whatsapp-media' );

-- Verify the bucket was created
SELECT * FROM storage.buckets WHERE name = 'whatsapp-media';
