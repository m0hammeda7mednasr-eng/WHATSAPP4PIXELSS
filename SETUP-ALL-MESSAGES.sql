-- Setup All Message Columns
-- Run this in Supabase SQL Editor

-- Add all message columns to brands table
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS brand_emoji TEXT DEFAULT '🏢',
ADD COLUMN IF NOT EXISTS existing_customer_message TEXT,
ADD COLUMN IF NOT EXISTS confirmation_message TEXT,
ADD COLUMN IF NOT EXISTS cancellation_message TEXT,
ADD COLUMN IF NOT EXISTS reminder_message TEXT;

-- Set default emoji
UPDATE brands 
SET brand_emoji = '🏢' 
WHERE brand_emoji IS NULL;

-- Add comments
COMMENT ON COLUMN brands.brand_emoji IS 'Brand emoji icon';
COMMENT ON COLUMN brands.existing_customer_message IS 'Message for existing customers with variables';
COMMENT ON COLUMN brands.confirmation_message IS 'Message sent when order is confirmed';
COMMENT ON COLUMN brands.cancellation_message IS 'Message sent when order is cancelled';
COMMENT ON COLUMN brands.reminder_message IS 'Reminder message sent after 1 hour if no response';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ All message columns added successfully!';
  RAISE NOTICE '📋 Next: Configure messages in Template Settings';
END $$;
