-- Create user_settings table to store webhook URL per user
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  webhook_url TEXT,
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own settings
CREATE POLICY "Users can view own settings"
ON user_settings FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own settings
CREATE POLICY "Users can insert own settings"
ON user_settings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own settings
CREATE POLICY "Users can update own settings"
ON user_settings FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
