-- ============================================
-- COMPLETE DATABASE SETUP
-- Run this ONCE in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CREATE USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ============================================
-- 2. CREATE BRANDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone_number_id TEXT NOT NULL UNIQUE,
  display_phone_number TEXT NOT NULL,
  whatsapp_token TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. CREATE CONTACTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  wa_id TEXT NOT NULL,
  name TEXT NOT NULL,
  profile_pic_url TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(brand_id, wa_id)
);

CREATE INDEX IF NOT EXISTS idx_contacts_brand_id ON contacts(brand_id);
CREATE INDEX IF NOT EXISTS idx_contacts_last_message ON contacts(brand_id, last_message_at DESC);

-- ============================================
-- 4. CREATE MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'interactive', 'document', 'audio', 'video')),
  body TEXT,
  media_url TEXT,
  media_type TEXT,
  file_name TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  wa_message_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_contact_id ON messages(contact_id);
CREATE INDEX IF NOT EXISTS idx_messages_brand_id ON messages(brand_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- ============================================
-- 5. ENABLE RLS
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. DROP OLD POLICIES
-- ============================================
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
DROP POLICY IF EXISTS "anon_brands_all" ON brands;
DROP POLICY IF EXISTS "anon_contacts_all" ON contacts;
DROP POLICY IF EXISTS "anon_messages_all" ON messages;
DROP POLICY IF EXISTS "anon_users_all" ON users;

-- ============================================
-- 7. CREATE NEW SIMPLE POLICIES (Allow all for anon)
-- ============================================
CREATE POLICY "anon_all" ON users FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON brands FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON contacts FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON messages FOR ALL TO anon USING (true) WITH CHECK (true);

-- ============================================
-- 8. INSERT SAMPLE DATA (if tables are empty)
-- ============================================

-- Sample Brands
INSERT INTO brands (name, phone_number_id, display_phone_number, whatsapp_token) 
VALUES 
  ('4 Pixels', '123456789', '+201234567890', 'your_token_here'),
  ('Lamsa', '987654321', '+201098765432', 'your_token_here')
ON CONFLICT (phone_number_id) DO NOTHING;

-- Sample Contacts for 4 Pixels
INSERT INTO contacts (brand_id, wa_id, name, last_message_at) 
SELECT 
  (SELECT id FROM brands WHERE name = '4 Pixels' LIMIT 1),
  '201111111111',
  'Ahmed Mohamed',
  NOW() - INTERVAL '5 minutes'
WHERE EXISTS (SELECT 1 FROM brands WHERE name = '4 Pixels')
ON CONFLICT (brand_id, wa_id) DO NOTHING;

INSERT INTO contacts (brand_id, wa_id, name, last_message_at) 
SELECT 
  (SELECT id FROM brands WHERE name = '4 Pixels' LIMIT 1),
  '201222222222',
  'Sara Ali',
  NOW() - INTERVAL '1 hour'
WHERE EXISTS (SELECT 1 FROM brands WHERE name = '4 Pixels')
ON CONFLICT (brand_id, wa_id) DO NOTHING;

INSERT INTO contacts (brand_id, wa_id, name, last_message_at) 
SELECT 
  (SELECT id FROM brands WHERE name = '4 Pixels' LIMIT 1),
  '201333333333',
  'Mohamed Hassan',
  NOW() - INTERVAL '2 hours'
WHERE EXISTS (SELECT 1 FROM brands WHERE name = '4 Pixels')
ON CONFLICT (brand_id, wa_id) DO NOTHING;

-- Sample Messages
INSERT INTO messages (contact_id, brand_id, direction, message_type, body, status)
SELECT 
  c.id,
  c.brand_id,
  'inbound',
  'text',
  'Hello! I need help with my order.',
  'read'
FROM contacts c
WHERE c.wa_id = '201111111111'
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================
-- 9. SHOW RESULTS
-- ============================================
SELECT 'Setup Complete!' as status;

SELECT 'Tables Created:' as info
UNION ALL
SELECT '✅ users' 
UNION ALL
SELECT '✅ brands'
UNION ALL
SELECT '✅ contacts'
UNION ALL
SELECT '✅ messages';

SELECT 'Data Count:' as info, '' as count
UNION ALL
SELECT 'Users:', COUNT(*)::text FROM users
UNION ALL
SELECT 'Brands:', COUNT(*)::text FROM brands
UNION ALL
SELECT 'Contacts:', COUNT(*)::text FROM contacts
UNION ALL
SELECT 'Messages:', COUNT(*)::text FROM messages;
