-- ═══════════════════════════════════════════════════════════════
-- COMPLETE DATABASE SETUP - WhatsApp CRM
-- ═══════════════════════════════════════════════════════════════

-- 1. Add all message columns to brands table
-- ───────────────────────────────────────────────────────────────
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS brand_emoji TEXT DEFAULT '🏢',
ADD COLUMN IF NOT EXISTS existing_customer_message TEXT,
ADD COLUMN IF NOT EXISTS confirmation_message TEXT,
ADD COLUMN IF NOT EXISTS cancellation_message TEXT,
ADD COLUMN IF NOT EXISTS reminder_message TEXT;

-- Set default emoji for existing brands
UPDATE brands 
SET brand_emoji = '🏢' 
WHERE brand_emoji IS NULL;

-- 2. Add tracking columns to shopify_orders
-- ───────────────────────────────────────────────────────────────
ALTER TABLE shopify_orders
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS customer_response TEXT,
ADD COLUMN IF NOT EXISTS response_at TIMESTAMPTZ;

-- 3. Add indexes for better performance
-- ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_orders_reminder 
ON shopify_orders(confirmation_status, reminder_sent, created_at) 
WHERE confirmation_status = 'pending' AND reminder_sent = false;

CREATE INDEX IF NOT EXISTS idx_orders_contact 
ON shopify_orders(contact_id, created_at DESC);

-- 4. Add comments for documentation
-- ───────────────────────────────────────────────────────────────
COMMENT ON COLUMN brands.brand_emoji IS 'Brand emoji icon (e.g., 🌙)';
COMMENT ON COLUMN brands.existing_customer_message IS 'Message template for existing customers. Variables: {customer_name}, {order_number}, {products}, {subtotal}, {shipping}, {total}, {address}, {brand_name}';
COMMENT ON COLUMN brands.confirmation_message IS 'Message sent when customer confirms order. Variables: {customer_name}, {order_number}, {brand_name}';
COMMENT ON COLUMN brands.cancellation_message IS 'Message sent when customer cancels order. Variables: {customer_name}, {order_number}, {brand_name}';
COMMENT ON COLUMN brands.reminder_message IS 'Reminder message sent after 1 hour if no response. Variables: {customer_name}, {order_number}, {brand_name}';

COMMENT ON COLUMN shopify_orders.reminder_sent IS 'Whether reminder message has been sent';
COMMENT ON COLUMN shopify_orders.reminder_sent_at IS 'Timestamp when reminder was sent';
COMMENT ON COLUMN shopify_orders.customer_response IS 'Customer response: confirmed, cancelled, or null';
COMMENT ON COLUMN shopify_orders.response_at IS 'Timestamp when customer responded';

-- 5. Success message
-- ───────────────────────────────────────────────────────────────
DO $$
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ DATABASE SETUP COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Added columns:';
  RAISE NOTICE '   • brands: 5 message columns';
  RAISE NOTICE '   • shopify_orders: 4 tracking columns';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Added indexes for performance';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Next steps:';
  RAISE NOTICE '   1. Configure messages in: Settings → Template Settings';
  RAISE NOTICE '   2. Restart backend server';
  RAISE NOTICE '   3. Test with a new order';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
END $$;
