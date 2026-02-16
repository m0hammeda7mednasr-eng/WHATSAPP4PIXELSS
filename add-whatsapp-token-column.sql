-- ============================================
-- Add whatsapp_token column to brands table
-- ============================================

-- Add whatsapp_token column if it doesn't exist
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS whatsapp_token TEXT;

-- Update existing brands with placeholder token
UPDATE brands 
SET whatsapp_token = 'your_token_here' 
WHERE whatsapp_token IS NULL;

-- Show updated brands
SELECT id, name, phone_number_id, whatsapp_token 
FROM brands;
