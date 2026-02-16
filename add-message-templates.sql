-- Add message template columns to brands table

-- Reminder message (sent after 1 hour if no response)
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS reminder_message TEXT DEFAULT 'مرحباً {customer_name} 👋

لسه مستنيين ردك على طلب رقم #{order_number} 🛍️

عشان نبدأ نجهز طلبك، محتاجين تأكيدك.

📥 *هل نعتمد الطلب ونبدأ التجهيز؟*';

-- Confirmation message (sent when customer confirms)
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS order_confirmation_message TEXT DEFAULT '✅ تم تأكيد طلبك بنجاح!

رقم الطلب: #{order_number}

شكراً لتأكيدك! 🎉
نحن الآن نجهز طلبك بعناية، وسيتم التواصل معك قريباً لترتيب موعد التوصيل 🚚

شكراً لثقتك في {brand_name} 💙';

-- Cancellation message (sent when customer cancels)
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS order_cancellation_message TEXT DEFAULT '❌ تم إلغاء طلبك

رقم الطلب: #{order_number}

تم إلغاء الطلب بنجاح.
نأسف لعدم إتمام الطلب. يمكنك الطلب مرة أخرى في أي وقت.

نتمنى خدمتك قريباً 💙';

-- Comments
COMMENT ON COLUMN brands.reminder_message IS 'Message sent after 1 hour if customer does not respond. Variables: {customer_name}, {order_number}, {brand_name}';
COMMENT ON COLUMN brands.order_confirmation_message IS 'Message sent when customer confirms order. Variables: {customer_name}, {order_number}, {brand_name}';
COMMENT ON COLUMN brands.order_cancellation_message IS 'Message sent when customer cancels order. Variables: {customer_name}, {order_number}, {brand_name}';
