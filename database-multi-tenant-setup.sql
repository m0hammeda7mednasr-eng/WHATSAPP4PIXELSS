-- ============================================
-- Multi-Tenant WhatsApp CRM Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. BRANDS TABLE (WhatsApp Numbers/Accounts)
-- ============================================
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone_number_id TEXT NOT NULL UNIQUE, -- Meta Phone ID
  display_phone_number TEXT NOT NULL,   -- e.g., "+201234567890"
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. CONTACTS TABLE (Customers per Brand)
-- ============================================
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  wa_id TEXT NOT NULL,                  -- Customer's WhatsApp ID
  name TEXT NOT NULL,
  profile_pic_url TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(brand_id, wa_id)               -- One customer per brand
);

-- ============================================
-- 3. MESSAGES TABLE (Chat History)
-- ============================================
CREATE TABLE messages (
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
  wa_message_id TEXT,                   -- WhatsApp Message ID for tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX idx_contacts_brand_id ON contacts(brand_id);
CREATE INDEX idx_contacts_last_message ON contacts(brand_id, last_message_at DESC);
CREATE INDEX idx_messages_contact_id ON messages(contact_id);
CREATE INDEX idx_messages_brand_id ON messages(brand_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_status ON messages(status);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Brands: Authenticated users can read all brands
CREATE POLICY "Allow authenticated users to read brands"
  ON brands FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update brands"
  ON brands FOR UPDATE
  TO authenticated
  USING (true);

-- Contacts: Authenticated users can read/write all contacts
CREATE POLICY "Allow authenticated users to read contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (true);

-- Messages: Authenticated users can read/write all messages
CREATE POLICY "Allow authenticated users to read messages"
  ON messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (true);

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert Sample Brands
INSERT INTO brands (name, phone_number_id, display_phone_number) VALUES
  ('4 Pixels', '123456789', '+201234567890'),
  ('Lamsa', '987654321', '+201098765432');

-- Insert Sample Contacts for 4 Pixels
INSERT INTO contacts (brand_id, wa_id, name, last_message_at) VALUES
  ((SELECT id FROM brands WHERE name = '4 Pixels'), '201111111111', 'Ahmed Mohamed', NOW() - INTERVAL '5 minutes'),
  ((SELECT id FROM brands WHERE name = '4 Pixels'), '201222222222', 'Sara Ali', NOW() - INTERVAL '1 hour'),
  ((SELECT id FROM brands WHERE name = '4 Pixels'), '201333333333', 'Mohamed Hassan', NOW() - INTERVAL '2 hours');

-- Insert Sample Contacts for Lamsa
INSERT INTO contacts (brand_id, wa_id, name, last_message_at) VALUES
  ((SELECT id FROM brands WHERE name = 'Lamsa'), '201444444444', 'Fatma Ibrahim', NOW() - INTERVAL '10 minutes'),
  ((SELECT id FROM brands WHERE name = 'Lamsa'), '201555555555', 'Omar Khaled', NOW() - INTERVAL '30 minutes');

-- Insert Sample Messages for 4 Pixels
INSERT INTO messages (contact_id, brand_id, direction, message_type, body, status) VALUES
  (
    (SELECT id FROM contacts WHERE wa_id = '201111111111'),
    (SELECT id FROM brands WHERE name = '4 Pixels'),
    'inbound',
    'text',
    'Hello! I need help with my order.',
    'read'
  ),
  (
    (SELECT id FROM contacts WHERE wa_id = '201111111111'),
    (SELECT id FROM brands WHERE name = '4 Pixels'),
    'outbound',
    'text',
    'Hi Ahmed! I''d be happy to help. What''s your order number?',
    'delivered'
  );

-- Insert Sample Messages for Lamsa
INSERT INTO messages (contact_id, brand_id, direction, message_type, body, status) VALUES
  (
    (SELECT id FROM contacts WHERE wa_id = '201444444444'),
    (SELECT id FROM brands WHERE name = 'Lamsa'),
    'inbound',
    'text',
    'Is this product still available?',
    'read'
  ),
  (
    (SELECT id FROM contacts WHERE wa_id = '201444444444'),
    (SELECT id FROM brands WHERE name = 'Lamsa'),
    'outbound',
    'text',
    'Yes! It''s available. Would you like to place an order?',
    'delivered'
  );

-- ============================================
-- FUNCTION: Update last_message_at on new message
-- ============================================
CREATE OR REPLACE FUNCTION update_contact_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE contacts
  SET last_message_at = NEW.created_at
  WHERE id = NEW.contact_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_contact_last_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_contact_last_message();

-- ============================================
-- WEBHOOK SETUP (For n8n Integration)
-- ============================================
-- Note: You'll need to set up a Supabase Webhook in the Dashboard
-- that triggers on INSERT to the 'messages' table where direction = 'outbound'
-- The webhook should call your n8n endpoint with the message data
