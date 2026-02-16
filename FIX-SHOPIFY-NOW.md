# ❌ مشكلة: Shopify Not Connected

## 🔍 المشكلة:
الـ Shopify tables مش موجودة في قاعدة البيانات!

## ✅ الحل (3 خطوات):

### الخطوة 1: افتح Supabase SQL Editor
```
1. روح على: https://supabase.com/dashboard
2. اختار المشروع بتاعك
3. اضغط "SQL Editor" من القائمة الجانبية
4. اضغط "New Query"
```

### الخطوة 2: شغّل SQL الأول (Shopify Tables)
```sql
-- انسخ كل المحتوى من ملف: database-shopify-integration.sql
-- والصقه في SQL Editor
-- اضغط "Run"
```

**أو انسخ ده:**
```sql
-- 1. Shopify Connections Table
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

-- 2. Order Tracking Table
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

-- 3. Webhook Logs
CREATE TABLE IF NOT EXISTS shopify_webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  webhook_type TEXT,
  payload JSONB,
  processed BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_shopify_connections_brand ON shopify_connections(brand_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_brand ON shopify_orders(brand_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_contact ON shopify_orders(contact_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_shopify_id ON shopify_orders(shopify_order_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_status ON shopify_orders(confirmation_status);

-- 5. RLS Policies
ALTER TABLE shopify_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_webhook_logs ENABLE ROW LEVEL SECURITY;

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
```

### الخطوة 3: شغّل SQL التاني (Brands Columns)
```sql
-- Add Shopify columns to brands table
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS shopify_store_url TEXT,
ADD COLUMN IF NOT EXISTS shopify_connected BOOLEAN DEFAULT false;

-- Create index
CREATE INDEX IF NOT EXISTS idx_brands_shopify_connected ON brands(shopify_connected);
```

### الخطوة 4: تحقق من النتيجة
```bash
node check-tables.js
```

**المفروض تشوف:**
```
✅ Table exists!
✅ Shopify columns exist!
```

---

## 🚀 بعد كده:

### 1. ارجع للـ CRM:
```
http://localhost:5174
```

### 2. افتح Settings → Shopify Integration

### 3. املأ البيانات وجرب تاني:
```
Shop Subdomain: my-store
Client ID: من Shopify
Client Secret: من Shopify
```

### 4. اضغط "Connect with OAuth"

---

## ✅ لو نجح:
- هتشوف "✅ Connected" في الأعلى
- الـ subdomain هيفضل موجود بعد refresh
- Profile tab هيعرض "Shopify Connected"

---

## 🐛 لو لسه مش شغال:

### تحقق من الـ Backend:
```bash
# شوف الـ logs
node check-shopify-connection.js
```

### تحقق من Shopify App:
1. Shopify Admin → Apps → Develop apps
2. اختار الـ App بتاعك
3. تأكد من:
   - ✅ Redirect URL صحيح
   - ✅ Scopes: read_orders, write_orders
   - ✅ Client ID و Secret صحيحين

---

**شغّل الـ SQL دلوقتي وجرب تاني! 🚀**
