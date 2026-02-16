-- ============================================
-- Migration: Single-Tenant → Multi-Tenant
-- ============================================

-- 1. Create brands table
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone_number_id TEXT NOT NULL UNIQUE,
  display_phone_number TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add brand_id to contacts (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contacts' AND column_name='brand_id') THEN
    ALTER TABLE contacts ADD COLUMN brand_id UUID REFERENCES brands(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contacts' AND column_name='wa_id') THEN
    ALTER TABLE contacts ADD COLUMN wa_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contacts' AND column_name='profile_pic_url') THEN
    ALTER TABLE contacts ADD COLUMN profile_pic_url TEXT;
  END IF;
END $$;

-- 3. Add brand_id to messages (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='brand_id') THEN
    ALTER TABLE messages ADD COLUMN brand_id UUID REFERENCES brands(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='message_type') THEN
    ALTER TABLE messages ADD COLUMN message_type TEXT DEFAULT 'text';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='status') THEN
    ALTER TABLE messages ADD COLUMN status TEXT DEFAULT 'sent';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='wa_message_id') THEN
    ALTER TABLE messages ADD COLUMN wa_message_id TEXT;
  END IF;
END $$;

-- 4. Insert sample brands
INSERT INTO brands (name, phone_number_id, display_phone_number) 
VALUES 
  ('4 Pixels', '123456789', '+201234567890'),
  ('Lamsa', '987654321', '+201098765432')
ON CONFLICT (phone_number_id) DO NOTHING;

-- 5. Update existing contacts with default brand
UPDATE contacts 
SET brand_id = (SELECT id FROM brands WHERE name = '4 Pixels' LIMIT 1)
WHERE brand_id IS NULL;

UPDATE contacts
SET wa_id = phone_number
WHERE wa_id IS NULL AND phone_number IS NOT NULL;

-- 6. Update existing messages with brand_id
UPDATE messages m
SET brand_id = c.brand_id
FROM contacts c
WHERE m.contact_id = c.id AND m.brand_id IS NULL;

UPDATE messages
SET message_type = type
WHERE message_type IS NULL AND type IS NOT NULL;

-- 7. Create indexes
CREATE INDEX IF NOT EXISTS idx_contacts_brand_id ON contacts(brand_id);
CREATE INDEX IF NOT EXISTS idx_messages_brand_id ON messages(brand_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);

-- 8. Enable RLS on brands
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for brands
DROP POLICY IF EXISTS "Allow authenticated users to read brands" ON brands;
CREATE POLICY "Allow authenticated users to read brands"
  ON brands FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to update brands" ON brands;
CREATE POLICY "Allow authenticated users to update brands"
  ON brands FOR UPDATE
  TO authenticated
  USING (true);

-- 10. Create trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_contact_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE contacts
  SET last_message_at = NEW.created_at
  WHERE id = NEW.contact_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Create trigger (drop if exists first)
DROP TRIGGER IF EXISTS trigger_update_contact_last_message ON messages;
CREATE TRIGGER trigger_update_contact_last_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_contact_last_message();

-- 12. Add unique constraint on contacts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'contacts_brand_wa_id_unique'
  ) THEN
    ALTER TABLE contacts ADD CONSTRAINT contacts_brand_wa_id_unique UNIQUE(brand_id, wa_id);
  END IF;
EXCEPTION
  WHEN others THEN NULL;
END $$;
