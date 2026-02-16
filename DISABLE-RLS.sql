-- ============================================
-- DISABLE RLS (Quick Fix)
-- ============================================

ALTER TABLE brands DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('brands', 'contacts', 'messages', 'users');

SELECT '✅ RLS Disabled! Refresh your browser.' as status;
