import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useBrand } from '../context/BrandContext';

export default function MessageTemplates() {
  const { selectedBrand, currentBrand } = useBrand();
  const brand = selectedBrand || currentBrand;
  
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    template_name: '',
    template_type: 'new_customer',
    body_text: '',
    language_code: 'ar',
    meta_template_status: 'pending'
  });

  useEffect(() => {
    if (brand) {
      fetchTemplates();
    } else {
      setLoading(false);
    }
  }, [brand]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('brand_id', brand.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('message_templates')
        .insert({
          ...formData,
          brand_id: brand.id
        });

      if (error) throw error;

      alert('✅ Template created successfully!');
      setShowForm(false);
      setFormData({
        template_name: '',
        template_type: 'new_customer',
        body_text: '',
        language_code: 'ar',
        meta_template_status: 'pending'
      });
      fetchTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      alert('❌ Error: ' + error.message);
    }
  };

  const toggleActive = async (templateId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('message_templates')
        .update({ is_active: !currentStatus })
        .eq('id', templateId);

      if (error) throw error;
      fetchTemplates();
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  const deleteTemplate = async (templateId) => {
    if (!confirm('هل أنت متأكد من حذف هذا الـ Template؟')) return;

    try {
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  if (loading) {
    return <div className="p-6">جاري التحميل...</div>;
  }

  if (!brand) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 mb-4">الرجاء اختيار براند من القائمة أعلاه</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📋 Message Templates</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showForm ? 'إلغاء' : '+ إضافة Template'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">إضافة Template جديد</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2">اسم الـ Template (في Meta)</label>
              <input
                type="text"
                value={formData.template_name}
                onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                className="w-full border p-2 rounded"
                placeholder="مثال: moon2"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                ⚠️ لازم يكون نفس الاسم المسجل في Meta Business Suite
              </p>
            </div>

            <div>
              <label className="block mb-2">نوع الـ Template</label>
              <select
                value={formData.template_type}
                onChange={(e) => setFormData({ ...formData, template_type: e.target.value })}
                className="w-full border p-2 rounded"
              >
                <option value="new_customer">عميل جديد (New Customer)</option>
                <option value="existing_customer">عميل حالي (Existing Customer)</option>
                <option value="order_confirmation">تأكيد طلب</option>
                <option value="abandoned_cart">سلة متروكة</option>
                <option value="custom">مخصص</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">نص الرسالة</label>
              <textarea
                value={formData.body_text}
                onChange={(e) => setFormData({ ...formData, body_text: e.target.value })}
                className="w-full border p-2 rounded h-40"
                placeholder="استخدم {{1}}, {{2}}, {{3}} للمتغيرات"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                💡 المتغيرات: {`{{1}}`} = رقم الطلب، {`{{2}}`} = المنتجات، {`{{3}}`} = المجموع، إلخ
              </p>
            </div>

            <div>
              <label className="block mb-2">حالة الـ Template في Meta</label>
              <select
                value={formData.meta_template_status}
                onChange={(e) => setFormData({ ...formData, meta_template_status: e.target.value })}
                className="w-full border p-2 rounded"
              >
                <option value="pending">Pending (في الانتظار)</option>
                <option value="approved">Approved (موافق عليه)</option>
                <option value="rejected">Rejected (مرفوض)</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
            >
              حفظ Template
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {templates.length === 0 ? (
          <div className="bg-gray-100 p-6 rounded text-center">
            <p>لا توجد Templates بعد</p>
            <p className="text-sm text-gray-500 mt-2">اضغط "+ إضافة Template" للبدء</p>
          </div>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className="bg-white p-6 rounded-lg shadow-md border-l-4"
              style={{
                borderLeftColor: template.is_active ? '#10b981' : '#6b7280'
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold">{template.template_name}</h3>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {template.template_type}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        template.meta_template_status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : template.meta_template_status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {template.meta_template_status}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        template.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {template.is_active ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(template.id, template.is_active)}
                    className={`px-3 py-1 rounded text-sm ${
                      template.is_active
                        ? 'bg-gray-200 hover:bg-gray-300'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {template.is_active ? 'تعطيل' : 'تفعيل'}
                  </button>
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    حذف
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <pre className="whitespace-pre-wrap text-sm">{template.body_text}</pre>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                تم الإنشاء: {new Date(template.created_at).toLocaleString('ar-EG')}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 bg-blue-50 p-6 rounded-lg">
        <h3 className="font-bold mb-2">📌 ملاحظات مهمة:</h3>
        <ul className="text-sm space-y-2">
          <li>• لازم تسجل الـ Template في Meta Business Suite الأول</li>
          <li>• اسم الـ Template هنا لازم يكون نفس الاسم في Meta</li>
          <li>• Templates للعملاء الجدد بتوفر تكلفة الـ conversation</li>
          <li>• Templates للعملاء الحاليين بتستخدم الـ conversation الموجود</li>
          <li>• لازم الـ Template يكون Approved في Meta عشان يشتغل</li>
        </ul>
      </div>
    </div>
  );
}
