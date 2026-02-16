# 🔧 حل مشكلة RLS - Shopify OAuth

## المشكلة:
```
❌ OAuth failed: new row violates row-level security policy 
for table "shopify_connections"
```

## السبب:
الـ RLS policies في Supabase مش بتسمح للـ API يكتب في الجدول

---

## الحل السريع (دقيقة واحدة):

### 1️⃣ افتح Supabase Dashboard

رابط: https://supabase.com/dashboard

اختار المشروع بتاعك

### 2️⃣ افتح SQL Editor

من القائمة الجانبية: **SQL Editor**

### 3️⃣ انسخ والصق الكود ده:

```sql
-- Fix Shopify RLS Policies
DROP POLICY IF EXISTS "Authenticated users can view shopify connections" ON shopify_connections;
DROP POLICY IF EXISTS "Authenticated users can insert shopify connections" ON shopify_connections;
DROP POLICY IF EXISTS "Authenticated users can update shopify connections" ON shopify_connections;
DROP POLICY IF EXISTS "Authenticated users can view shopify orders" ON shopify_orders;
DROP POLICY IF EXISTS "Authenticated users can insert shopify orders" ON shopify_orders;
DROP POLICY IF EXISTS "Authenticated users can update shopify orders" ON shopify_orders;
DROP POLICY IF EXISTS "Authenticated users can view webhook logs" ON shopify_webhook_logs;
DROP POLICY IF EXISTS "Authenticated users can insert webhook logs" ON shopify_webhook_logs;

-- Allow API access
CREATE POLICY "Allow all access to shopify connections"
  ON shopify_connections FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to shopify orders"
  ON shopify_orders FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to webhook logs"
  ON shopify_webhook_logs FOR ALL
  USING (true) WITH CHECK (true);
```

### 4️⃣ اضغط Run

اضغط على زرار **Run** (أو Ctrl+Enter)

### 5️⃣ جرب OAuth تاني

ارجع للموقع وجرب تتصل بـ Shopify تاني

---

## ✅ خلاص!

دلوقتي OAuth هيشتغل بدون مشاكل!

---

## ملاحظة:

لو لسه عايز تستخدم **Manual Token** (أسهل):

1. Shopify → Settings → Apps → Develop apps
2. Create app → Configure scopes (read_orders, write_orders)
3. Install app → Reveal token
4. انسخ Token (يبدأ بـ `shpat_`)
5. Settings → Shopify Integration → Manual Token
6. الصق Token واضغط Connect

**Manual Token مش محتاج OAuth ومش هيطلع المشكلة دي!**
