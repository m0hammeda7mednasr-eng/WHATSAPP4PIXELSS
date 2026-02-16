-- Add follow-up and reminder tracking columns to shopify_orders table

-- Add reminder_sent_at column (for pending orders)
ALTER TABLE shopify_orders 
ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;

-- Add followup_sent_at column (for confirmed orders - not used now)
ALTER TABLE shopify_orders 
ADD COLUMN IF NOT EXISTS followup_sent_at TIMESTAMPTZ;

-- Add index for faster queries (reminder)
CREATE INDEX IF NOT EXISTS idx_orders_reminder 
ON shopify_orders(confirmation_status, reminder_sent_at, created_at)
WHERE confirmation_status = 'pending' AND reminder_sent_at IS NULL;

-- Add index for faster queries (followup - not used now)
CREATE INDEX IF NOT EXISTS idx_orders_followup 
ON shopify_orders(confirmation_status, followup_sent_at, confirmed_at)
WHERE confirmation_status = 'confirmed' AND followup_sent_at IS NULL;

-- Comments
COMMENT ON COLUMN shopify_orders.reminder_sent_at IS 'Timestamp when reminder message was sent for pending order (no response after 1 hour)';
COMMENT ON COLUMN shopify_orders.followup_sent_at IS 'Timestamp when follow-up message was sent after confirmation (not used currently)';

