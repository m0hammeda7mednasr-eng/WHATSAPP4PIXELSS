-- ============================================
-- Shopify Integration - Complete Database Setup
-- Copy and paste this entire file into Supabase SQL Editor
-- ============================================

-- 1. Add Shopify columns to brands table
ALTER TABLE brands ADD COLUMN IF NOT EXISTS shopify_store_url TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS shopify_connected BOOLEAN DEFAULT false;

-- 2. Create shopify_connections table
CREATE TABLE IF NOT EXISTS shopify_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  shop_url TEXT NOT NULL,
  access_token TEXT NOT NULL,
  scope TEXT,
  is_active BOOLEAN DEFAULT true,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id)
);

-- 3. Create shopify_orders table
CREATE TABLE IF NOT EXISTS shopify_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  shopify_order_id TEXT NOT NULL,
  shopify_order_number TEXT,
  order_status TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  total_price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  whatsapp_message_id UUID REFERENCES messages(id),
  confirmation_status TEXT,
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create shopify_webhook_logs table
CREATE TABLE IF NOT EXISTS shopify_webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  webhook_type TEXT,
  payload JSONB,
  processed BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shopify_connections_brand ON shopify_connections(brand_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_brand ON shopify_orders(brand_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_contact ON shopify_orders(contact_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_shopify_id ON shopify_orders(shopify_order_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_status ON shopify_orders(confirmation_status);

-- 6. Enable Row Level Security
ALTER TABLE shopify_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_webhook_logs ENABLE ROW LEVEL SECURITY;

-- 7. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own brand shopify connections" ON shopify_connections;
DROP POLICY IF EXISTS "Users can insert own brand shopify connections" ON shopify_connections;
DROP POLICY IF EXISTS "Users can update own brand shopify connections" ON shopify_connections;
DROP POLICY IF EXISTS "Users can view own brand shopify orders" ON shopify_orders;
DROP POLICY IF EXISTS "Users can view own brand webhook logs" ON shopify_webhook_logs;
DROP POLICY IF EXISTS "Authenticated users can view shopify connections" ON shopify_connections;
DROP POLICY IF EXISTS "Authenticated users can insert shopify connections" ON shopify_connections;
DROP POLICY IF EXISTS "Authenticated users can update shopify connections" ON shopify_connections;
DROP POLICY IF EXISTS "Authenticated users can view shopify orders" ON shopify_orders;
DROP POLICY IF EXISTS "Authenticated users can insert shopify orders" ON shopify_orders;
DROP POLICY IF EXISTS "Authenticated users can update shopify orders" ON shopify_orders;
DROP POLICY IF EXISTS "Authenticated users can view webhook logs" ON shopify_webhook_logs;
DROP POLICY IF EXISTS "Authenticated users can insert webhook logs" ON shopify_webhook_logs;

-- 8. Create RLS policies for multi-tenant security
-- Note: Allowing authenticated users to access all brands
-- Adjust these policies based on your authentication setup

CREATE POLICY "Authenticated users can view shopify connections"
  ON shopify_connections FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert shopify connections"
  ON shopify_connections FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update shopify connections"
  ON shopify_connections FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view shopify orders"
  ON shopify_orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert shopify orders"
  ON shopify_orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update shopify orders"
  ON shopify_orders FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view webhook logs"
  ON shopify_webhook_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert webhook logs"
  ON shopify_webhook_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 9. Create trigger function for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_shopify_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_shopify_connections_updated_at ON shopify_connections;
DROP TRIGGER IF EXISTS update_shopify_orders_updated_at ON shopify_orders;

-- 11. Create triggers for automatic timestamp updates
CREATE TRIGGER update_shopify_connections_updated_at
  BEFORE UPDATE ON shopify_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_shopify_updated_at();

CREATE TRIGGER update_shopify_orders_updated_at
  BEFORE UPDATE ON shopify_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_shopify_updated_at();

-- ============================================
-- ✅ Setup Complete!
-- ============================================
-- Run: node check-tables.js
-- to verify everything is working
