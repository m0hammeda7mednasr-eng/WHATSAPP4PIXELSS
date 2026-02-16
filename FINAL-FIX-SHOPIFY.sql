-- ============================================
-- FINAL FIX: Shopify Integration
-- ============================================

-- 1. Disable RLS on all tables
ALTER TABLE shopify_connections DISABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_webhook_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE brands DISABLE ROW LEVEL SECURITY;

-- 2. Grant permissions
GRANT ALL ON shopify_connections TO anon, authenticated;
GRANT ALL ON shopify_orders TO anon, authenticated;
GRANT ALL ON shopify_webhook_logs TO anon, authenticated;
GRANT ALL ON contacts TO anon, authenticated;
GRANT ALL ON messages TO anon, authenticated;
GRANT ALL ON brands TO anon, authenticated;

-- 3. Ensure contact_id column exists in shopify_orders
ALTER TABLE shopify_orders 
ADD COLUMN IF NOT EXISTS contact_id UUID;

-- 4. Add Foreign Key constraint (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'shopify_orders_contact_id_fkey'
    ) THEN
        ALTER TABLE shopify_orders
        ADD CONSTRAINT shopify_orders_contact_id_fkey
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 5. Add order_id column to messages if not exists
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS order_id UUID;

-- 6. Add Foreign Key for messages.order_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'messages_order_id_fkey'
    ) THEN
        ALTER TABLE messages
        ADD CONSTRAINT messages_order_id_fkey
        FOREIGN KEY (order_id) REFERENCES shopify_orders(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 7. Verify tables and relationships
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

-- 8. Show current data
SELECT 'shopify_connections' as table_name, COUNT(*) as records FROM shopify_connections
UNION ALL
SELECT 'shopify_orders', COUNT(*) FROM shopify_orders
UNION ALL
SELECT 'contacts', COUNT(*) FROM contacts
UNION ALL
SELECT 'messages', COUNT(*) FROM messages;
