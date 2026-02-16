-- ⚠️ مهم جداً: شغل الكود ده في Supabase الأول!

-- 1. إضافة order_id في messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES shopify_orders(id);
CREATE INDEX IF NOT EXISTS idx_messages_order_id ON messages(order_id);

-- 2. إضافة Template Settings في brands
ALTER TABLE brands ADD COLUMN IF NOT EXISTS template_name TEXT DEFAULT 'moon_order_confirmation';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS template_language TEXT DEFAULT 'ar';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS template_header TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS template_body TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS template_footer TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS use_template BOOLEAN DEFAULT true;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS brand_emoji TEXT DEFAULT '🌙';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS welcome_message TEXT DEFAULT 'أهلاً بك في {{brand_name}}';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS confirmation_message TEXT DEFAULT 'تم تأكيد طلبك بنجاح!';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS cancellation_message TEXT DEFAULT 'تم إلغاء طلبك.';

-- ✅ تم! دلوقتي كل حاجة جاهزة
