-- Update Messages Table to support media
ALTER TABLE messages ADD COLUMN media_url TEXT;
ALTER TABLE messages ADD COLUMN media_type VARCHAR(50);
ALTER TABLE messages ADD COLUMN file_name VARCHAR(255);
ALTER TABLE messages ADD COLUMN file_size INTEGER;
