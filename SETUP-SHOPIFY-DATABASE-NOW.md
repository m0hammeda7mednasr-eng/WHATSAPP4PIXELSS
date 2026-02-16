# 🚀 إعداد قاعدة بيانات Shopify - خطوة واحدة فقط!

## المشكلة الحالية:
- الجداول غير موجودة في Supabase ❌
- لذلك النظام يظهر "Not Connected" دائماً
- يجب إنشاء الجداول أولاً

## ✅ الحل (خطوة واحدة):

### 1. افتح Supabase SQL Editor:
```
https://supabase.com/dashboard/project/rmpgofswkpjxionzythf/sql/new
```

### 2. انسخ والصق الكود التالي بالكامل:

```sql
-- ============================================
-- Shopify Integration - Complete Setup
-- ============================================

-- 1. Add Shopify columns to brands table
ALTER TABLE brands ADD COLUMN IF NOT EXISTS shopify_store_url TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS shopify_connected BOOLEAN DEFAULT false;

-- 2. Create shopify_connections table
CREATE TABLE IF NOT EXISTS shopify_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  shop_url TEXT NOT NULL,
  access_token TEXT NOT NULL,
  scope TEXT,
  is_active BOOLEAN DEFAULT true,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id)
);

-- 3. Create shopify_orders table
CREATE TABLE IF NOT EXISTS shopify_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  shopify_order_id TEXT NOT NULL,
  shopify_order_number TEXT,
  order_status TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  total_price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  whatsapp_message_id UUID REFERENCES messages(id),
  confirmation_status TEXT,
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create shopify_webhook_logs table
CREATE TABLE IF NOT EXISTS shopify_webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  webhook_type TEXT,
  payload JSONB,
  processed BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_shopify_connections_brand ON shopify_connections(brand_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_brand ON shopify_orders(brand_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_contact ON shopify_orders(contact_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_shopify_id ON shopify_orders(shopify_order_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_status ON shopify_orders(confirmation_status);

-- 6. Enable RLS
ALTER TABLE shopify_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_webhook_logs ENABLE ROW LEVEL SECURITY;

-- 7. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own brand shopify connections" ON shopify_connections;
DROP POLICY IF EXISTS "Users can insert own brand shopify connections" ON shopify_connections;
DROP POLICY IF EXISTS "Users can update own brand shopify connections" ON shopify_connections;
DROP POLICY IF EXISTS "Users can view own brand shopify orders" ON shopify_orders;
DROP POLICY IF EXISTS "Users can view own brand webhook logs" ON shopify_webhook_logs;

-- 8. Create RLS policies
CREATE POLICY "Users can view own brand shopify connections"
  ON shopify_connections FOR SELECT
  USING (brand_id IN (
    SELECT id FROM brands WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own brand shopify connections"
  ON shopify_connections FOR INSERT
  WITH CHECK (brand_id IN (
    SELECT id FROM brands WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own brand shopify connections"
  ON shopify_connections FOR UPDATE
  USING (brand_id IN (
    SELECT id FROM brands WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can view own brand shopify orders"
  ON shopify_orders FOR SELECT
  USING (brand_id IN (
    SELECT id FROM brands WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can view own brand webhook logs"
  ON shopify_webhook_logs FOR SELECT
  USING (brand_id IN (
    SELECT id FROM brands WHERE user_id = auth.uid()
  ));

-- 9. Create trigger function
CREATE OR REPLACE FUNCTION update_shopify_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_shopify_connections_updated_at ON shopify_connections;
DROP TRIGGER IF EXISTS update_shopify_orders_updated_at ON shopify_orders;

-- 11. Create triggers
CREATE TRIGGER update_shopify_connections_updated_at
  BEFORE UPDATE ON shopify_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_shopify_updated_at();

CREATE TRIGGER update_shopify_orders_updated_at
  BEFORE UPDATE ON shopify_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_shopify_updated_at();

-- ✅ Done! All tables created successfully
```

### 3. اضغط "Run" أو Ctrl+Enter

### 4. تحقق من النجاح:
```bash
node check-tables.js
```

يجب أن ترى ✅ بجانب كل جدول!

## 🎯 بعد ذلك:

1. افتح الموقع: https://wahtsapp2.vercel.app
2. اذهب إلى Settings → Shopify Integration
3. املأ البيانات:
   - Shop Subdomain: اسم متجرك (مثال: my-store)
   - Client ID: من Shopify App
   - Client Secret: من Shopify App
4. اضغط "Connect with OAuth"

## 📝 ملاحظات:
- الكود آمن ويستخدم `IF NOT EXISTS` لتجنب الأخطاء
- يمكنك تشغيله أكثر من مرة بدون مشاكل
- جميع الجداول محمية بـ RLS (Row Level Security)
- كل brand له بياناته الخاصة منفصلة

## ❓ إذا واجهت مشكلة:
```bash
node check-tables.js
```
سيخبرك بالضبط ما المشكلة!
