-- ============================================
-- FINAL FIX - Run this in Supabase SQL Editor
-- ============================================

-- 1. Add whatsapp_token column if missing
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS whatsapp_token TEXT;

-- 2. Update existing brands
UPDATE brands 
SET whatsapp_token = 'your_token_here' 
WHERE whatsapp_token IS NULL;

-- 3. Drop ALL existing RLS policies
DROP POLICY IF EXISTS "Allow authenticated users to read brands" ON brands;
DROP POLICY IF EXISTS "Allow authenticated users to update brands" ON brands;
DROP POLICY IF EXISTS "Allow authenticated users to read contacts" ON contacts;
DROP POLICY IF EXISTS "Allow authenticated users to insert contacts" ON contacts;
DROP POLICY IF EXISTS "Allow authenticated users to update contacts" ON contacts;
DROP POLICY IF EXISTS "Allow authenticated users to read messages" ON messages;
DROP POLICY IF EXISTS "Allow authenticated users to insert messages" ON messages;
DROP POLICY IF EXISTS "Allow authenticated users to update messages" ON messages;
DROP POLICY IF EXISTS "Allow anon to read brands" ON brands;
DROP POLICY IF EXISTS "Allow anon to read contacts" ON contacts;
DROP POLICY IF EXISTS "Allow anon to insert contacts" ON contacts;
DROP POLICY IF EXISTS "Allow anon to update contacts" ON contacts;
DROP POLICY IF EXISTS "Allow anon to read messages" ON messages;
DROP POLICY IF EXISTS "Allow anon to insert messages" ON messages;
DROP POLICY IF EXISTS "Allow anon to update messages" ON messages;

-- 4. Create NEW simple policies (allow everything for anon)
CREATE POLICY "anon_brands_all" ON brands FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_contacts_all" ON contacts FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_messages_all" ON messages FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_users_all" ON users FOR ALL TO anon USING (true) WITH CHECK (true);

-- 5. Verify policies
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies
WHERE tablename IN ('brands', 'contacts', 'messages', 'users')
ORDER BY tablename, policyname;

-- 6. Show current data
SELECT 'Brands:' as info, COUNT(*) as count FROM brands
UNION ALL
SELECT 'Contacts:', COUNT(*) FROM contacts
UNION ALL
SELECT 'Messages:', COUNT(*) FROM messages
UNION ALL
SELECT 'Users:', COUNT(*) FROM users;

-- Done!
SELECT '✅ All fixed! Refresh your browser and try again.' as status;
