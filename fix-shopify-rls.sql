-- Fix RLS for Shopify tables
ALTER TABLE shopify_connections DISABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_webhook_logs DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON shopify_connections TO anon, authenticated;
GRANT ALL ON shopify_orders TO anon, authenticated;
GRANT ALL ON shopify_webhook_logs TO anon, authenticated;

-- Verify tables exist
SELECT 'shopify_connections' as table_name, COUNT(*) as records FROM shopify_connections
UNION ALL
SELECT 'shopify_orders', COUNT(*) FROM shopify_orders
UNION ALL
SELECT 'shopify_webhook_logs', COUNT(*) FROM shopify_webhook_logs;
