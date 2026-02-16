import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useBrand } from '../context/BrandContext';

export default function TemplateSettings() {
  const { selectedBrand, currentBrand, refreshBrands } = useBrand();
  const brand = selectedBrand || currentBrand;
  
  const [brandEmoji, setBrandEmoji] = useState('🌙');
  const [existingCustomerMessage, setExistingCustomerMessage] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [cancellationMessage, setCancellationMessage] = useState('');
  const [reminderMessage, setReminderMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (brand) {
      setBrandEmoji(brand.brand_emoji || '🌙');
      setExistingCustomerMessage(brand.existing_customer_message || getDefaultExistingMessage());
      setConfirmationMessage(brand.confirmation_message || getDefaultConfirmationMessage());
      setCancellationMessage(brand.cancellation_message || getDefaultCancellationMessage());
      setReminderMessage(brand.reminder_message || getDefaultReminderMessage());
    }
  }, [brand]);

  const getDefaultExistingMessage = () => {
    return `🌙 *طلب جديد* ✨

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

نتمنى لكِ تجربة مميزة مع {brand_name} 🌙`;
  };

  const getDefaultConfirmationMessage = () => {
    return `✅ *تم تأكيد طلبك بنجاح!*

شكراً {customer_name}! 🎉

🧾 رقم الطلب: #{order_number}

نحن الآن نجهز طلبك بعناية، وسيتم التواصل معك قريباً لترتيب موعد التوصيل 🚚

شكراً لثقتك في {brand_name} 💙`;
  };

  const getDefaultCancellationMessage = () => {
    return `❌ *تم إلغاء طلبك*

{customer_name}، تم إلغاء طلب رقم #{order_number} بنجاح.

نأسف لعدم إتمام الطلب. يمكنك الطلب مرة أخرى في أي وقت.

نتمنى خدمتك قريباً 💙`;
  };

  const getDefaultReminderMessage = () => {
    return `👋 مرحباً {customer_name}

لسه مستنيين ردك على طلب رقم #{order_number} 🛍️

عشان نبدأ نجهز طلبك، محتاجين تأكيدك.

📥 *هل نعتمد الطلب ونبدأ التجهيز؟*

رد بـ "تأكيد" أو "إلغاء"`;
  };

  const handleSave = async () => {
    if (!brand) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('brands')
        .update({
          brand_emoji: brandEmoji,
          existing_customer_message: existingCustomerMessage,
          confirmation_message: confirmationMessage,
          cancellation_message: cancellationMessage,
          reminder_message: reminderMessage,
          updated_at: new Date().toISOString()
        })
        .eq('id', brand.id);

      if (error) throw error;

      alert('✅ تم الحفظ بنجاح!');
      refreshBrands();
    } catch (error) {
      console.error('Error saving:', error);
      alert('❌ خطأ: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!brand) {
    return (
      <div className="p-6 text-center text-gray-500">
        جاري التحميل...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">⚙️ إعدادات الرسائل</h2>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-8">
        
        {/* Brand Emoji */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            رمز البراند (Emoji)
          </label>
          <input
            type="text"
            value={brandEmoji}
            onChange={(e) => setBrandEmoji(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="🌙"
            maxLength={2}
          />
        </div>

        <hr />

        {/* Existing Customer Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📬 رسالة العملاء الموجودين
          </label>
          <p className="text-xs text-gray-500 mb-2">
            تُرسل للعملاء الموجودين في الـ database (رسالة عادية، مش من Meta)
          </p>
          <textarea
            value={existingCustomerMessage}
            onChange={(e) => setExistingCustomerMessage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
            rows={15}
          />
        </div>

        <hr />

        {/* Confirmation Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ✅ رسالة التأكيد
          </label>
          <p className="text-xs text-gray-500 mb-2">
            تُرسل عندما يضغط العميل "تأكيد" أو يرد بـ "تأكيد"
          </p>
          <textarea
            value={confirmationMessage}
            onChange={(e) => setConfirmationMessage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
            rows={8}
          />
        </div>

        <hr />

        {/* Cancellation Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ❌ رسالة الإلغاء
          </label>
          <p className="text-xs text-gray-500 mb-2">
            تُرسل عندما يضغط العميل "إلغاء" أو يرد بـ "إلغاء"
          </p>
          <textarea
            value={cancellationMessage}
            onChange={(e) => setCancellationMessage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
            rows={8}
          />
        </div>

        <hr />

        {/* Reminder Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ⏰ رسالة التذكير
          </label>
          <p className="text-xs text-gray-500 mb-2">
            تُرسل تلقائياً بعد ساعة إذا لم يرد العميل
          </p>
          <textarea
            value={reminderMessage}
            onChange={(e) => setReminderMessage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
            rows={8}
          />
        </div>

        {/* Variables Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="font-bold text-blue-900 mb-2">💡 المتغيرات المتاحة:</p>
          <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
            <div><code className="bg-white px-2 py-1 rounded">{'{customer_name}'}</code> - اسم العميل</div>
            <div><code className="bg-white px-2 py-1 rounded">{'{order_number}'}</code> - رقم الطلب</div>
            <div><code className="bg-white px-2 py-1 rounded">{'{products}'}</code> - قائمة المنتجات</div>
            <div><code className="bg-white px-2 py-1 rounded">{'{subtotal}'}</code> - المجموع الفرعي</div>
            <div><code className="bg-white px-2 py-1 rounded">{'{shipping}'}</code> - مصاريف الشحن</div>
            <div><code className="bg-white px-2 py-1 rounded">{'{total}'}</code> - الإجمالي</div>
            <div><code className="bg-white px-2 py-1 rounded">{'{address}'}</code> - عنوان التوصيل</div>
            <div><code className="bg-white px-2 py-1 rounded">{'{brand_name}'}</code> - اسم البراند</div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </div>
      </div>

      {/* Info Boxes */}
      <div className="mt-6 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-900 mb-2">📋 كيف يعمل النظام:</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>✅ <strong>عميل جديد:</strong> Template من Meta (moon2) - بأزرار تأكيد/إلغاء</li>
            <li>✅ <strong>عميل موجود:</strong> الرسالة اللي فوق - بدون أزرار</li>
            <li>✅ <strong>لو أكد/ألغى:</strong> يبعتله الرسالة المناسبة</li>
            <li>✅ <strong>لو ماردش:</strong> بعد ساعة يبعتله رسالة تذكير</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-bold text-yellow-900 mb-2">⚠️ ملاحظات مهمة:</h3>
          <ul className="text-sm text-yellow-800 space-y-2">
            <li>• <strong>هذه الصفحة:</strong> رسائل عادية بمتغيرات (مش من Meta)</li>
            <li>• <strong>Message Templates:</strong> Templates من Meta للعملاء الجدد فقط</li>
            <li>• المتغيرات بتتملى تلقائياً من بيانات الطلب</li>
            <li>• كل الرسائل دي مجانية لو في conversation مفتوح</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
