-- إصلاح RLS Policies للسماح للـ webhook server بالوصول

-- Brands table policies
CREATE POLICY "Allow anon to read brands"
  ON brands FOR SELECT
  TO anon
  USING (true);

-- Contacts table policies
CREATE POLICY "Allow anon to read contacts"
  ON contacts FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon to insert contacts"
  ON contacts FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon to update contacts"
  ON contacts FOR UPDATE
  TO anon
  USING (true);

-- Messages table policies
CREATE POLICY "Allow anon to read messages"
  ON messages FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon to insert messages"
  ON messages FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon to update messages"
  ON messages FOR UPDATE
  TO anon
  USING (true);
