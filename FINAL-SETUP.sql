-- ============================================
-- إعداد نهائي كامل - شغّل ده في Supabase SQL Editor
-- ============================================

-- 1. إضافة whatsapp_token column للـ brands
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS whatsapp_token TEXT;

-- 2. RLS Policies للسماح للـ anon key (للـ webhook server)
DROP POLICY IF EXISTS "Allow anon to read brands" ON brands;
DROP POLICY IF EXISTS "Allow anon to read contacts" ON contacts;
DROP POLICY IF EXISTS "Allow anon to insert contacts" ON contacts;
DROP POLICY IF EXISTS "Allow anon to update contacts" ON contacts;
DROP POLICY IF EXISTS "Allow anon to read messages" ON messages;
DROP POLICY IF EXISTS "Allow anon to insert messages" ON messages;
DROP POLICY IF EXISTS "Allow anon to update messages" ON messages;

CREATE POLICY "Allow anon to read brands"
  ON brands FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon to read contacts"
  ON contacts FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon to insert contacts"
  ON contacts FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon to update contacts"
  ON contacts FOR UPDATE TO anon USING (true);

CREATE POLICY "Allow anon to read messages"
  ON messages FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon to insert messages"
  ON messages FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon to update messages"
  ON messages FOR UPDATE TO anon USING (true);

-- 3. تحديث الـ brands الموجودة بـ token تجريبي
UPDATE brands 
SET whatsapp_token = 'your_token_here'
WHERE whatsapp_token IS NULL;

-- 4. عرض النتيجة
SELECT 
  '✅ Setup completed!' as status,
  COUNT(*) as total_brands
FROM brands;

SELECT 
  id,
  name,
  phone_number_id,
  display_phone_number,
  CASE 
    WHEN whatsapp_token IS NULL THEN '❌ Missing Token'
    WHEN whatsapp_token = 'your_token_here' THEN '⚠️  Test Token (Update Required)'
    ELSE '✅ Token Configured'
  END as token_status
FROM brands;
