-- Add missing brand_emoji column to brands table

ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS brand_emoji TEXT DEFAULT '🏢';

-- Update existing brands with default emoji
UPDATE brands 
SET brand_emoji = '🏢' 
WHERE brand_emoji IS NULL;

COMMENT ON COLUMN brands.brand_emoji IS 'Emoji icon for the brand';
