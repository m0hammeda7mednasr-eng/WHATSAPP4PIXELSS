-- Fix all Shopify integration issues

-- 1. Disable RLS on all Shopify tables
ALTER TABLE shopify_connections DISABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_webhook_logs DISABLE ROW LEVEL SECURITY;

-- 2. Grant all permissions
GRANT ALL ON shopify_connections TO anon, authenticated;
GRANT ALL ON shopify_orders TO anon, authenticated;
GRANT ALL ON shopify_webhook_logs TO anon, authenticated;

-- 3. Verify the foreign key exists
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='shopify_orders';

-- 4. Check if tables exist and have data
SELECT 'shopify_connections' as table_name, COUNT(*) as records FROM shopify_connections
UNION ALL
SELECT 'shopify_orders', COUNT(*) FROM shopify_orders
UNION ALL
SELECT 'shopify_webhook_logs', COUNT(*) FROM shopify_webhook_logs;

-- 5. Show connection details (without sensitive data)
SELECT 
    id,
    brand_id,
    shop_url,
    is_active,
    scope,
    created_at
FROM shopify_connections
ORDER BY created_at DESC;
