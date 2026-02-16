-- Add Template Settings to brands table

-- Add columns for template configuration
ALTER TABLE brands ADD COLUMN IF NOT EXISTS template_name TEXT DEFAULT 'moon_order_confirmation';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS template_language TEXT DEFAULT 'ar';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS template_header TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS template_body TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS template_footer TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS use_template BOOLEAN DEFAULT true;

-- Add columns for message customization
ALTER TABLE brands ADD COLUMN IF NOT EXISTS brand_emoji TEXT DEFAULT '🌙';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS welcome_message TEXT DEFAULT 'أهلاً بك في {{brand_name}}';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS confirmation_message TEXT DEFAULT 'تم تأكيد طلبك بنجاح!';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS cancellation_message TEXT DEFAULT 'تم إلغاء طلبك.';

-- ✅ Done! Now brands can customize their templates
