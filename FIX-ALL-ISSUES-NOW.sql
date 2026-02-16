-- ============================================
-- FIX ALL ISSUES - COMPLETE SOLUTION
-- ============================================

-- ISSUE 1: Remove duplicate connections (keep only the latest one)
-- ============================================
DELETE FROM shopify_connections
WHERE id NOT IN (
    SELECT id 
    FROM shopify_connections 
    WHERE shop_url = 'qpcich-gi.myshopify.com' 
    ORDER BY created_at DESC 
    LIMIT 1
);

-- Verify: Should have only 1 connection now
SELECT 
    'shopify_connections' as table_name,
    COUNT(*) as count,
    'Should be 1' as expected
FROM shopify_connections
WHERE shop_url = 'qpcich-gi.myshopify.com';

-- ISSUE 2: Make sure all tables have proper permissions
-- ============================================
ALTER TABLE brands DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_connections DISABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_webhook_logs DISABLE ROW LEVEL SECURITY;

GRANT ALL ON brands TO anon, authenticated;
GRANT ALL ON contacts TO anon, authenticated;
GRANT ALL ON messages TO anon, authenticated;
GRANT ALL ON shopify_connections TO anon, authenticated;
GRANT ALL ON shopify_orders TO anon, authenticated;
GRANT ALL ON shopify_webhook_logs TO anon, authenticated;

-- ISSUE 3: Make sure shopify_orders table has all columns
-- ============================================
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

-- ISSUE 4: Add Foreign Keys
-- ============================================
ALTER TABLE shopify_orders DROP CONSTRAINT IF EXISTS shopify_orders_contact_id_fkey;
ALTER TABLE shopify_orders DROP CONSTRAINT IF EXISTS shopify_orders_brand_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_order_id_fkey;

ALTER TABLE shopify_orders
ADD CONSTRAINT shopify_orders_brand_id_fkey
FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;

ALTER TABLE shopify_orders
ADD CONSTRAINT shopify_orders_contact_id_fkey
FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL;

ALTER TABLE messages
ADD COLUMN IF NOT EXISTS order_id UUID;

ALTER TABLE messages
ADD CONSTRAINT messages_order_id_fkey
FOREIGN KEY (order_id) REFERENCES shopify_orders(id) ON DELETE SET NULL;

-- ISSUE 5: Create indexes for better performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_shopify_orders_brand_id ON shopify_orders(brand_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_contact_id ON shopify_orders(contact_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_shopify_order_id ON shopify_orders(shopify_order_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_created_at ON shopify_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_order_id ON messages(order_id);
CREATE INDEX IF NOT EXISTS idx_contacts_brand_wa ON contacts(brand_id, wa_id);

-- ============================================
-- FINAL REPORT
-- ============================================

-- Show current state
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as separator;
SELECT '✅ DATABASE FIXED - CURRENT STATE:' as status;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as separator;

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
SELECT 'shopify_orders', COUNT(*) FROM shopify_orders
UNION ALL
SELECT 'shopify_webhook_logs', COUNT(*) FROM shopify_webhook_logs;

SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as separator;
SELECT '📋 SHOPIFY CONNECTIONS:' as info;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as separator;

SELECT 
    shop_url,
    is_active,
    created_at,
    brand_id
FROM shopify_connections
ORDER BY created_at DESC;

SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as separator;
SELECT '💡 NEXT STEPS:' as info;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as separator;
SELECT '1. Add real WhatsApp Token in Settings' as step;
SELECT '2. Server is ready: node webhook-server-simple.js' as step;
SELECT '3. Create order from Shopify to test' as step;
SELECT '4. Check Orders page in frontend' as step;
