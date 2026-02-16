import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useBrand } from '../context/BrandContext';

export default function TemplateSettings() {
  const { selectedBrand, refreshBrands } = useBrand();
  const [brandEmoji, setBrandEmoji] = useState('🌙');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedBrand) {
      setBrandEmoji(selectedBrand.brand_emoji || '🌙');
    }
  }, [selectedBrand]);

  const handleSave = async () => {
    if (!selectedBrand) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('brands')
        .update({
          brand_emoji: brandEmoji,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedBrand.id);

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

  if (!selectedBrand) {
    return (
      <div className="p-6 text-center text-gray-500">
        الرجاء اختيار براند
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">⚙️ إعدادات البراند</h2>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        
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
          <p className="text-sm text-gray-500 mt-1">
            سيظهر في بداية الرسالة
          </p>
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

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-900 mb-2">📋 كيف يعمل النظام:</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>✅ <strong>عميل جديد</strong> (رقم مش موجود) → يبعتله Template من Meta (moon2)</li>
          <li>✅ <strong>عميل موجود</strong> (رقم موجود) → يبعتله رسالة عادية (مجاني لو في conversation)</li>
          <li>💰 <strong>توفير التكلفة:</strong> العملاء الموجودين مش بيتحسب عليهم conversation جديد</li>
        </ul>
      </div>

      {/* Template Info */}
      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-bold text-yellow-900 mb-2">⚠️ ملاحظات مهمة:</h3>
        <ul className="text-sm text-yellow-800 space-y-2">
          <li>• لازم تسجل Template "moon2" في Meta Business Suite</li>
          <li>• لازم يكون Approved من Meta</li>
          <li>• سجله في: Settings → Message Templates</li>
        </ul>
      </div>
    </div>
  );
}
