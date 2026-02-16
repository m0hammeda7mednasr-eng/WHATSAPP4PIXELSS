-- ============================================
-- Fix RLS Policies to allow anon key access
-- (Needed for backend API to work)
-- ============================================

-- Drop existing anon policies if they exist
DROP POLICY IF EXISTS "Allow anon to read brands" ON brands;
DROP POLICY IF EXISTS "Allow anon to read contacts" ON contacts;
DROP POLICY IF EXISTS "Allow anon to insert contacts" ON contacts;
DROP POLICY IF EXISTS "Allow anon to update contacts" ON contacts;
DROP POLICY IF EXISTS "Allow anon to read messages" ON messages;
DROP POLICY IF EXISTS "Allow anon to insert messages" ON messages;
DROP POLICY IF EXISTS "Allow anon to update messages" ON messages;

-- Brands: Allow anon to read
CREATE POLICY "Allow anon to read brands"
  ON brands FOR SELECT TO anon USING (true);

-- Contacts: Allow anon to read/write
CREATE POLICY "Allow anon to read contacts"
  ON contacts FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon to insert contacts"
  ON contacts FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon to update contacts"
  ON contacts FOR UPDATE TO anon USING (true);

-- Messages: Allow anon to read/write
CREATE POLICY "Allow anon to read messages"
  ON messages FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon to insert messages"
  ON messages FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon to update messages"
  ON messages FOR UPDATE TO anon USING (true);

-- Show all policies
SELECT schemaname, tablename, policyname, roles
FROM pg_policies
WHERE tablename IN ('brands', 'contacts', 'messages')
ORDER BY tablename, policyname;
