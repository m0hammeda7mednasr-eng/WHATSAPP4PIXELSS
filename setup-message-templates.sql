-- Message Templates Table
-- Store WhatsApp message templates for each brand

CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('new_customer', 'existing_customer', 'order_confirmation', 'abandoned_cart', 'custom')),
  language_code TEXT DEFAULT 'ar',
  
  -- Template components
  header_type TEXT CHECK (header_type IN ('text', 'image', 'video', 'document', 'none')),
  header_text TEXT,
  header_media_url TEXT,
  
  body_text TEXT NOT NULL,
  footer_text TEXT,
  
  -- Buttons (JSON array)
  buttons JSONB,
  
  -- Variables in template (for replacement)
  variables JSONB,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  meta_template_status TEXT DEFAULT 'pending',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_templates_brand ON message_templates(brand_id);
CREATE INDEX IF NOT EXISTS idx_templates_type ON message_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_templates_active ON message_templates(is_active);

-- RLS Policies
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read templates" ON message_templates;
CREATE POLICY "Allow anon read templates" ON message_templates
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon insert templates" ON message_templates;
CREATE POLICY "Allow anon insert templates" ON message_templates
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update templates" ON message_templates;
CREATE POLICY "Allow anon update templates" ON message_templates
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow anon delete templates" ON message_templates;
CREATE POLICY "Allow anon delete templates" ON message_templates
  FOR DELETE USING (true);

-- Insert default templates for moon2
-- You'll need to update the brand_id after running this

-- Template for NEW customers (moon2)
INSERT INTO message_templates (
  brand_id,
  template_name,
  template_type,
  language_code,
  body_text,
  buttons,
  variables,
  is_active,
  meta_template_status
) VALUES (
  'b4b61ff6-121a-4452-9b16-974af203d3bd', -- Replace with your brand_id
  'moon2',
  'new_customer',
  'ar',
  '🧾 رقم الطلب: #{{1}}
🧣 القطع: {{2}}
💰 المجموع: {{3}} EGP
🚚 الشحن: {{4}} EGP
💵 الإجمالي: {{5}} EGP
👤 المستلم: {{6}}
🏠 العنوان: {{7}}

📩 هل نعتمد الطلب؟',
  '[
    {"type": "quick_reply", "text": "تأكيد الطلب"},
    {"type": "quick_reply", "text": "إلغاء الطلب"}
  ]'::jsonb,
  '["order_number", "products", "subtotal", "shipping", "total", "customer_name", "address"]'::jsonb,
  true,
  'approved'
);

-- Template for EXISTING customers (to save costs)
INSERT INTO message_templates (
  brand_id,
  template_name,
  template_type,
  language_code,
  body_text,
  buttons,
  variables,
  is_active,
  meta_template_status
) VALUES (
  'b4b61ff6-121a-4452-9b16-974af203d3bd', -- Replace with your brand_id
  'order_update_existing',
  'existing_customer',
  'ar',
  '🌙 *طلب جديد* ✨

🧾 رقم الطلب: #{{1}}
🧣 القطع: {{2}}
💰 المجموع: {{3}} EGP
🚚 الشحن: {{4}} EGP
💵 الإجمالي: {{5}} EGP

📩 هل نعتمد الطلب؟',
  '[
    {"type": "quick_reply", "text": "تأكيد"},
    {"type": "quick_reply", "text": "إلغاء"}
  ]'::jsonb,
  '["order_number", "products", "subtotal", "shipping", "total"]'::jsonb,
  true,
  'approved'
);

COMMENT ON TABLE message_templates IS 'Store WhatsApp message templates for brands';
COMMENT ON COLUMN message_templates.template_type IS 'Type of template: new_customer, existing_customer, order_confirmation, etc.';
COMMENT ON COLUMN message_templates.variables IS 'Array of variable names used in template for replacement';
COMMENT ON COLUMN message_templates.buttons IS 'JSON array of button objects';
