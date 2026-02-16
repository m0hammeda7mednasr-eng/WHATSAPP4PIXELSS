-- Add Shopify columns to brands table
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS shopify_store_url TEXT,
ADD COLUMN IF NOT EXISTS shopify_connected BOOLEAN DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_brands_shopify_connected ON brands(shopify_connected);

-- Show result
SELECT id, name, shopify_connected, shopify_store_url FROM brands;
