-- ============================================
-- Users Table for Simple Authentication
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster username lookup
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read users (for login)
CREATE POLICY "Allow anyone to read users"
  ON users FOR SELECT
  USING (true);

-- Allow anyone to insert users (for signup)
CREATE POLICY "Allow anyone to insert users"
  ON users FOR INSERT
  WITH CHECK (true);

-- Sample admin user (password: admin123)
INSERT INTO users (username, password, email, full_name) 
VALUES ('admin', 'admin123', 'admin@example.com', 'Administrator')
ON CONFLICT (username) DO NOTHING;
