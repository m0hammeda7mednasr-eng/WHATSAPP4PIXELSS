-- ============================================
-- FIX RLS - Allow anon to access everything
-- ============================================

-- Drop ALL policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname 
              FROM pg_policies 
              WHERE schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Create simple policies for anon
CREATE POLICY "anon_all" ON brands FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON contacts FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON messages FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON users FOR ALL TO anon USING (true) WITH CHECK (true);

-- Verify
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename;

-- Show data
SELECT 'Brands' as table_name, COUNT(*)::text as count FROM brands
UNION ALL
SELECT 'Contacts', COUNT(*)::text FROM contacts
UNION ALL
SELECT 'Messages', COUNT(*)::text FROM messages
UNION ALL
SELECT 'Users', COUNT(*)::text FROM users;
