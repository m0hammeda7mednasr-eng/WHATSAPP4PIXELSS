-- Fix Storage RLS Policies for WhatsApp Media
-- Run this in Supabase SQL Editor

-- 1. Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies (if any) to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow Upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow Delete" ON storage.objects;

-- 3. Create new policies for whatsapp-media bucket

-- Allow ANYONE to read (view images in chat)
CREATE POLICY "Anyone can view whatsapp media"
ON storage.objects FOR SELECT
USING (bucket_id = 'whatsapp-media');

-- Allow ANYONE to upload (important for webhook server using anon key)
CREATE POLICY "Anyone can upload whatsapp media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'whatsapp-media');

-- Allow ANYONE to update
CREATE POLICY "Anyone can update whatsapp media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'whatsapp-media')
WITH CHECK (bucket_id = 'whatsapp-media');

-- Allow ANYONE to delete
CREATE POLICY "Anyone can delete whatsapp media"
ON storage.objects FOR DELETE
USING (bucket_id = 'whatsapp-media');

-- 4. Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%whatsapp%'
ORDER BY policyname;

-- Expected output: 4 policies
-- - Anyone can view whatsapp media (SELECT)
-- - Anyone can upload whatsapp media (INSERT)
-- - Anyone can update whatsapp media (UPDATE)
-- - Anyone can delete whatsapp media (DELETE)
