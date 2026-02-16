-- WhatsApp CRM Database Setup
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Contacts Table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages Table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  direction VARCHAR(10) CHECK (direction IN ('inbound', 'outbound')),
  body TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_messages_contact_id ON messages(contact_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_contacts_last_message ON contacts(last_message_at DESC);

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow authenticated users to read/write)
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

CREATE POLICY "Allow authenticated users to read messages"
  ON messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Sample Data (Optional)
INSERT INTO contacts (phone_number, name, last_message_at) VALUES
  ('+1234567890', 'John Doe', NOW() - INTERVAL '5 minutes'),
  ('+0987654321', 'Jane Smith', NOW() - INTERVAL '1 hour'),
  ('+1122334455', 'Bob Johnson', NOW() - INTERVAL '2 hours');

INSERT INTO messages (contact_id, direction, body, type) VALUES
  ((SELECT id FROM contacts WHERE phone_number = '+1234567890'), 'inbound', 'Hello! I need help with my order.', 'text'),
  ((SELECT id FROM contacts WHERE phone_number = '+1234567890'), 'outbound', 'Hi John! I''d be happy to help. What''s your order number?', 'text'),
  ((SELECT id FROM contacts WHERE phone_number = '+0987654321'), 'inbound', 'Is this still available?', 'text'),
  ((SELECT id FROM contacts WHERE phone_number = '+1122334455'), 'outbound', 'Thanks for your interest!', 'text');
