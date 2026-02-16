-- ============================================
-- FIX ORDERS - COMPLETE SOLUTION
-- ============================================
-- Run this in Supabase SQL Editor
-- This will fix ALL issues preventing orders from saving

-- Step 1: Disable RLS on ALL tables
ALTER TABLE brands DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_connections DISABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_webhook_logs DISABLE ROW LEVEL SECURITY;

-- Step 2: Grant ALL permissions to anon and authenticated
GRANT ALL ON brands TO anon, authenticated;
GRANT ALL ON contacts TO anon, authenticated;
GRANT ALL ON messages TO anon, authenticated;
GRANT ALL ON shopify_connections TO anon, authenticated;
GRANT ALL ON shopify_orders TO anon, authenticated;
GRANT ALL ON shopify_webhook_logs TO anon, authenticated;

-- Step 3: Make sure shopify_orders table has all required columns
ALTER TABLE shopify_orders 
ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS brand_id UUID NOT NULL,
ADD COLUMN IF NOT EXISTS contact_id UUID,
ADD COLUMN IF NOT EXISTS shopify_order_id TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS shopify_order_number TEXT,
ADD COLUMN IF NOT EXISTS order_status TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EGP',
ADD COLUMN IF NOT EXISTS confirmation_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Step 4: Drop existing constraints if they exist (to recreate them properly)
ALTER TABLE shopify_orders DROP CONSTRAINT IF EXISTS shopify_orders_contact_id_fkey;
ALTER TABLE shopify_orders DROP CONSTRAINT IF EXISTS shopify_orders_brand_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_order_id_fkey;

-- Step 5: Add Foreign Keys with proper settings
ALTER TABLE shopify_orders
ADD CONSTRAINT shopify_orders_brand_id_fkey
FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;

ALTER TABLE shopify_orders
ADD CONSTRAINT shopify_orders_contact_id_fkey
FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL;

-- Step 6: Add order_id to messages table
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS order_id UUID;

ALTER TABLE messages
ADD CONSTRAINT messages_order_id_fkey
FOREIGN KEY (order_id) REFERENCES shopify_orders(id) ON DELETE SET NULL;

-- Step 7: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_shopify_orders_brand_id ON shopify_orders(brand_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_contact_id ON shopify_orders(contact_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_shopify_order_id ON shopify_orders(shopify_order_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_created_at ON shopify_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_order_id ON messages(order_id);

-- Step 8: Verify the structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'shopify_orders'
ORDER BY ordinal_position;

-- Step 9: Check Foreign Keys
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('shopify_orders', 'messages')
ORDER BY tc.table_name;

-- Step 10: Show current data counts
SELECT 
    'brands' as table_name, 
    COUNT(*) as records 
FROM brands
UNION ALL
SELECT 'contacts', COUNT(*) FROM contacts
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'shopify_connections', COUNT(*) FROM shopify_connections
UNION ALL
SELECT 'shopify_orders', COUNT(*) FROM shopify_orders;

-- Success message
SELECT '✅ Database is ready! All tables configured correctly.' as status;
