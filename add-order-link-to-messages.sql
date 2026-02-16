-- Add order_id to messages table to link messages with orders

ALTER TABLE messages ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES shopify_orders(id);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_order_id ON messages(order_id);

-- ✅ Done! Now messages can be linked to orders
