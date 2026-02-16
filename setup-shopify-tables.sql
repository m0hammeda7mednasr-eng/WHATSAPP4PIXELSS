-- Create Shopify Connections Table
CREATE TABLE IF NOT EXISTS shopify_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  shop_url TEXT NOT NULL,
  access_token TEXT NOT NULL,
  scope TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(brand_id)
);

-- Create Shopify Orders Table
CREATE TABLE IF NOT EXISTS shopify_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  shopify_order_id TEXT NOT NULL,
  shopify_order_number TEXT,
  order_status TEXT DEFAULT 'pending',
  customer_phone TEXT,
  customer_email TEXT,
  total_price DECIMAL(10, 2),
  currency TEXT DEFAULT 'EGP',
  whatsapp_message_id TEXT,
  confirmation_status TEXT DEFAULT 'pending',
  confirmed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(brand_id, shopify_order_id)
);

-- Create Shopify Webhook Logs Table
CREATE TABLE IF NOT EXISTS shopify_webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  webhook_type TEXT NOT NULL,
  payload JSONB,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Shopify columns to brands table if not exists
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS shopify_store_url TEXT,
ADD COLUMN IF NOT EXISTS shopify_connected BOOLEAN DEFAULT false;

-- Disable RLS for simplicity
ALTER TABLE shopify_connections DISABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_webhook_logs DISABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shopify_connections_brand ON shopify_connections(brand_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_brand ON shopify_orders(brand_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_contact ON shopify_orders(contact_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_shopify_id ON shopify_orders(shopify_order_id);
CREATE INDEX IF NOT EXISTS idx_shopify_webhook_logs_brand ON shopify_webhook_logs(brand_id);
