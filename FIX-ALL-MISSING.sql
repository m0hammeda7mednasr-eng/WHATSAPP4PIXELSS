-- Fix All Missing Components - SIMPLE VERSION
-- Run this in Supabase SQL Editor

-- Add only essential columns to brands table
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS brand_emoji TEXT DEFAULT '🏢',
ADD COLUMN IF NOT EXISTS existing_customer_message TEXT DEFAULT '� *طلب جديد* ✨

شكراً لثقتك فينا! طلبك الجديد وصلنا 🎉

🧾 *رقم الطلب:* #{order_number}

🧣 *القطع المختارة:*
{products}

ــــــــــــــــــــــــــــــــــــــــ
💰 *تفاصيل الفاتورة:*
🔸 المجموع الفرعي: {subtotal} EGP
🚚 مصاريف الشحن: {shipping} EGP
ــــــــــــــــــــــــــــــــــــــــ
💵 *الإجمالي النهائي: {total} EGP*
ــــــــــــــــــــــــــــــــــــــــ

📍 *بيانات التوصيل:*
👤 المستلم: {customer_name}
🏠 العنوان: {address}

📥 *هل نعتمد الطلب ونبدأ التجهيز؟*

نتمنى لكِ تجربة مميزة مع {brand_name} 🌙';

UPDATE brands 
SET brand_emoji = '🏢' 
WHERE brand_emoji IS NULL;

UPDATE brands 
SET existing_customer_message = '🌙 *طلب جديد* ✨

شكراً لثقتك فينا! طلبك الجديد وصلنا 🎉

🧾 *رقم الطلب:* #{order_number}

🧣 *القطع المختارة:*
{products}

ــــــــــــــــــــــــــــــــــــــــ
💰 *تفاصيل الفاتورة:*
🔸 المجموع الفرعي: {subtotal} EGP
🚚 مصاريف الشحن: {shipping} EGP
ــــــــــــــــــــــــــــــــــــــــ
💵 *الإجمالي النهائي: {total} EGP*
ــــــــــــــــــــــــــــــــــــــــ

📍 *بيانات التوصيل:*
👤 المستلم: {customer_name}
🏠 العنوان: {address}

📥 *هل نعتمد الطلب ونبدأ التجهيز؟*

نتمنى لكِ تجربة مميزة مع {brand_name} 🌙'
WHERE existing_customer_message IS NULL;

COMMENT ON COLUMN brands.brand_emoji IS 'Brand emoji icon';
COMMENT ON COLUMN brands.existing_customer_message IS 'Message template for existing customers with variables: {customer_name}, {order_number}, {products}, {subtotal}, {shipping}, {total}, {address}, {brand_name}';

-- 2. Create message_templates table
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

-- Indexes
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

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ All fixes applied successfully!';
  RAISE NOTICE '📋 Next: Add your templates in the app';
END $$;
