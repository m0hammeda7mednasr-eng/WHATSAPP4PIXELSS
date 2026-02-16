-- Shopify Integration Schema
-- Add Shopify connection table for multi-tenant support

-- 1. Shopify Connections Table
CREATE TABLE IF NOT EXISTS shopify_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  shop_url TEXT NOT NULL, -- e.g., "mystore.myshopify.com"
  access_token TEXT NOT NULL, -- Encrypted OAuth token
  scope TEXT, -- Permissions granted
  is_active BOOLEAN DEFAULT true,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id) -- One Shopify store per brand
);

-- 2. Order Tracking Table (to link WhatsApp messages with Shopify orders)
CREATE TABLE IF NOT EXISTS shopify_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  shopify_order_id TEXT NOT NULL, -- Shopify order ID
  shopify_order_number TEXT, -- Human-readable order number
  order_status TEXT, -- open, confirmed, cancelled, etc.
  customer_phone TEXT,
  customer_email TEXT,
  total_price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  whatsapp_message_id UUID REFERENCES messages(id),
  confirmation_status TEXT, -- pending, confirmed, cancelled
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Webhook Logs (for debugging)
CREATE TABLE IF NOT EXISTS shopify_webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  webhook_type TEXT, -- orders/create, orders/updated, etc.
  payload JSONB,
  processed BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_shopify_connections_brand ON shopify_connections(brand_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_brand ON shopify_orders(brand_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_contact ON shopify_orders(contact_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_shopify_id ON shopify_orders(shopify_order_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_status ON shopify_orders(confirmation_status);

-- 5. RLS Policies (Row Level Security)
ALTER TABLE shopify_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own brand's Shopify data
CREATE POLICY "Users can view own brand shopify connections"
  ON shopify_connections FOR SELECT
  USING (brand_id IN (
    SELECT id FROM brands WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own brand shopify connections"
  ON shopify_connections FOR INSERT
  WITH CHECK (brand_id IN (
    SELECT id FROM brands WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own brand shopify connections"
  ON shopify_connections FOR UPDATE
  USING (brand_id IN (
    SELECT id FROM brands WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can view own brand shopify orders"
  ON shopify_orders FOR SELECT
  USING (brand_id IN (
    SELECT id FROM brands WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can view own brand webhook logs"
  ON shopify_webhook_logs FOR SELECT
  USING (brand_id IN (
    SELECT id FROM brands WHERE user_id = auth.uid()
  ));

-- 6. Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_shopify_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shopify_connections_updated_at
  BEFORE UPDATE ON shopify_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_shopify_updated_at();

CREATE TRIGGER update_shopify_orders_updated_at
  BEFORE UPDATE ON shopify_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_shopify_updated_at();

-- 7. Add shopify_store_url to brands table (optional, for quick reference)
ALTER TABLE brands ADD COLUMN IF NOT EXISTS shopify_store_url TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS shopify_connected BOOLEAN DEFAULT false;

COMMENT ON TABLE shopify_connections IS 'Stores OAuth tokens and connection info for Shopify stores';
COMMENT ON TABLE shopify_orders IS 'Tracks orders sent via WhatsApp and their confirmation status';
COMMENT ON TABLE shopify_webhook_logs IS 'Logs all incoming webhooks from Shopify for debugging';
