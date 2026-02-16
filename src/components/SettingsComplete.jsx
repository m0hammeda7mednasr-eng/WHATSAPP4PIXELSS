import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { X, User, Smartphone, Store, Package, Settings as SettingsIcon, ArrowLeft, Edit2, Check, AlertCircle, MessageSquare } from 'lucide-react';
import { useBrand } from '../context/BrandContext';
import ShopifyOAuth from './ShopifyOAuth';
import ShopifyOrders from './ShopifyOrders';
import TemplateSettings from './TemplateSettings';
import MessageTemplates from './MessageTemplates';

export default function SettingsComplete({ session, onClose }) {
  const { currentBrand, brands, refreshBrands } = useBrand();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile & WhatsApp', icon: User },
    { id: 'shopify', label: 'Shopify Integration', icon: Store },
    { id: 'orders', label: 'Shopify Orders', icon: Package },
    { id: 'messages', label: 'Message Templates', icon: MessageSquare },
    { id: 'templates', label: 'Template Settings', icon: SettingsIcon }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors lg:hidden"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <SettingsIcon className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Settings</h2>
                <p className="text-sm text-green-100">Manage your account and integrations</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors hidden lg:block"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50 px-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-all border-b-2 ${
                    activeTab === tab.id
                      ? 'text-green-600 border-green-600 bg-white'
                      : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'profile' && (
            <ProfileWhatsAppTab 
              session={session} 
              currentBrand={currentBrand}
              brands={brands}
              refreshBrands={refreshBrands}
            />
          )}
          {activeTab === 'shopify' && currentBrand && (
            <ShopifyOAuth brandId={currentBrand.id} />
          )}
          {activeTab === 'orders' && currentBrand && (
            <ShopifyOrders brandId={currentBrand.id} />
          )}
          {activeTab === 'messages' && currentBrand && (
            <MessageTemplates />
          )}
          {activeTab === 'templates' && currentBrand && (
            <TemplateSettings />
          )}
          {!currentBrand && activeTab !== 'profile' && (
            <div className="flex items-center justify-center h-full p-12">
              <div className="text-center text-gray-500">
                <Store className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No brand selected</p>
                <p className="text-sm mt-1">Please select a brand from the top menu</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileWhatsAppTab({ session, currentBrand, brands, refreshBrands }) {
  const [editingBrand, setEditingBrand] = useState(null);
  const [addingNewBrand, setAddingNewBrand] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [brandPhone, setBrandPhone] = useState('');
  const [brandToken, setBrandToken] = useState('');
  const [brandPhoneId, setBrandPhoneId] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [shopifyStatus, setShopifyStatus] = useState(null);

  useEffect(() => {
    if (currentBrand) {
      checkShopifyConnection();
    }
  }, [currentBrand]);

  const checkShopifyConnection = async () => {
    if (!currentBrand) return;
    
    try {
      const { data, error } = await supabase
        .from('shopify_connections')
        .select('shop_url, is_active')
        .eq('brand_id', currentBrand.id)
        .single();
      
      if (error) {
        // Check if table doesn't exist
        if (error.message.includes('does not exist') || error.message.includes('schema cache')) {
          setShopifyStatus({ error: 'tables_not_created' });
        } else {
          setShopifyStatus(null);
        }
      } else {
        setShopifyStatus(data);
      }
    } catch (err) {
      setShopifyStatus(null);
    }
  };

  const handleEditBrand = (brand) => {
    setEditingBrand(brand.id);
    setBrandName(brand.name || '');
    setBrandPhone(brand.display_phone_number || '');
    setBrandToken(brand.whatsapp_token || '');
    setBrandPhoneId(brand.phone_number_id || '');
    setMessage({ type: '', text: '' });
  };

  const handleSaveBrand = async (brandId) => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    if (!brandName || !brandPhone) {
      setMessage({ type: 'error', text: 'Please fill in Brand Name and Phone Number' });
      setSaving(false);
      return;
    }

    if (!brandToken || !brandPhoneId) {
      setMessage({ type: 'error', text: 'Please fill in both Token and Phone Number ID' });
      setSaving(false);
      return;
    }

    if (!brandToken.startsWith('EAA')) {
      setMessage({ type: 'error', text: 'Invalid token format. Token should start with "EAA"' });
      setSaving(false);
      return;
    }

    if (brandPhoneId.length < 10) {
      setMessage({ type: 'error', text: 'Phone Number ID seems too short' });
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('brands')
      .update({
        name: brandName,
        display_phone_number: brandPhone,
        whatsapp_token: brandToken,
        phone_number_id: brandPhoneId,
        updated_at: new Date().toISOString()
      })
      .eq('id', brandId);

    if (error) {
      setMessage({ type: 'error', text: 'Failed to update: ' + error.message });
    } else {
      setMessage({ type: 'success', text: '✅ Brand updated successfully!' });
      setEditingBrand(null);
      refreshBrands();
    }
    setSaving(false);
  };

  const handleCancelEdit = () => {
    setEditingBrand(null);
    setAddingNewBrand(false);
    setBrandName('');
    setBrandPhone('');
    setBrandToken('');
    setBrandPhoneId('');
    setMessage({ type: '', text: '' });
  };

  const handleAddNewBrand = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    if (!brandName || !brandPhone) {
      setMessage({ type: 'error', text: 'الرجاء إدخال اسم البراند ورقم الهاتف' });
      setSaving(false);
      return;
    }

    if (!brandToken || !brandPhoneId) {
      setMessage({ type: 'error', text: 'الرجاء إدخال Token و Phone Number ID' });
      setSaving(false);
      return;
    }

    if (!brandToken.startsWith('EAA')) {
      setMessage({ type: 'error', text: 'Token غير صحيح. يجب أن يبدأ بـ "EAA"' });
      setSaving(false);
      return;
    }

    if (brandPhoneId.length < 10) {
      setMessage({ type: 'error', text: 'Phone Number ID قصير جداً' });
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('brands')
      .insert([{
        name: brandName,
        display_phone_number: brandPhone,
        whatsapp_token: brandToken,
        phone_number_id: brandPhoneId,
        is_active: true
      }]);

    if (error) {
      setMessage({ type: 'error', text: 'فشل الإضافة: ' + error.message });
    } else {
      setMessage({ type: 'success', text: '✅ تم إضافة البراند بنجاح!' });
      setAddingNewBrand(false);
      setBrandName('');
      setBrandPhone('');
      setBrandToken('');
      setBrandPhoneId('');
      refreshBrands();
    }
    setSaving(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* User Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
            <p className="text-sm text-gray-600">Your account details</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <p className="text-gray-900 mt-1">{session?.user?.email}</p>
          </div>
        </div>
      </div>

      {/* WhatsApp Brands */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">WhatsApp Brands</h3>
            <p className="text-sm text-gray-600">Configure your WhatsApp Business accounts</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Add New Brand Button */}
          {!addingNewBrand && (
            <button
              onClick={() => setAddingNewBrand(true)}
              className="w-full py-3 border-2 border-dashed border-gray-300 hover:border-green-500 rounded-lg text-gray-600 hover:text-green-600 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-xl">+</span>
              إضافة براند جديد
            </button>
          )}

          {/* Add New Brand Form */}
          {addingNewBrand && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-4">إضافة براند جديد</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم البراند <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="مثال: 4 Pixels"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رقم الهاتف <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={brandPhone}
                    onChange={(e) => setBrandPhone(e.target.value)}
                    placeholder="+201234567890"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp Access Token <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={brandToken}
                    onChange={(e) => setBrandToken(e.target.value)}
                    placeholder="EAAxxxxxxxxxxxxxxxxxxxxxxxxx"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none font-mono text-sm"
                  />
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      brandToken.startsWith('EAA') 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {brandToken.startsWith('EAA') ? '✓ صيغة صحيحة' : '✗ يجب أن يبدأ بـ EAA'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    📍 احصل عليه من: Meta Developer Console → WhatsApp → API Setup → Temporary access token
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={brandPhoneId}
                    onChange={(e) => setBrandPhoneId(e.target.value)}
                    placeholder="106540529340398"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none font-mono text-sm"
                  />
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      brandPhoneId.length >= 10 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {brandPhoneId.length >= 10 ? '✓ طول صحيح' : '✗ قصير جداً'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    📍 احصل عليه من: Meta Developer Console → WhatsApp → API Setup → Phone number ID
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleAddNewBrand}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    {saving ? 'جاري الإضافة...' : 'إضافة البراند'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}

          {brands && brands.length > 0 ? (
            brands.map((brand) => (
              <div key={brand.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">{brand.name}</h4>
                    <p className="text-sm text-gray-500">{brand.display_phone_number || 'No phone set'}</p>
                  </div>
                  {editingBrand !== brand.id && (
                    <button
                      onClick={() => handleEditBrand(brand)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                </div>

                {editingBrand === brand.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Brand Name
                      </label>
                      <input
                        type="text"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="4 Pixels"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Display Phone Number
                      </label>
                      <input
                        type="text"
                        value={brandPhone}
                        onChange={(e) => setBrandPhone(e.target.value)}
                        placeholder="+201234567890"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        WhatsApp Access Token
                      </label>
                      <textarea
                        value={brandToken}
                        onChange={(e) => setBrandToken(e.target.value)}
                        placeholder="EAAxxxxxxxxxxxxxxxxxxxxxxxxx"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none font-mono text-sm"
                      />
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          brandToken.startsWith('EAA') 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {brandToken.startsWith('EAA') ? '✓ Valid format' : '✗ Should start with EAA'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        📍 Get from: Meta Developer Console → WhatsApp → API Setup → Temporary access token
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number ID
                      </label>
                      <input
                        type="text"
                        value={brandPhoneId}
                        onChange={(e) => setBrandPhoneId(e.target.value)}
                        placeholder="106540529340398"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none font-mono text-sm"
                      />
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          brandPhoneId.length >= 10 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {brandPhoneId.length >= 10 ? '✓ Valid length' : '✗ Too short'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        📍 Get from: Meta Developer Console → WhatsApp → API Setup → Phone number ID
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveBrand(brand.id)}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={saving}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500">Token:</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        brand.whatsapp_token && brand.whatsapp_token !== 'your_token_here'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {brand.whatsapp_token && brand.whatsapp_token !== 'your_token_here'
                          ? '✅ Configured'
                          : '⚠️ Not Configured'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500">Phone ID:</span>
                      <span className="text-xs text-gray-700 font-mono">
                        {brand.phone_number_id || 'Not set'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Smartphone className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No brands found</p>
            </div>
          )}
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">💡 How to get WhatsApp credentials:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Open <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer" className="underline">Meta Developer Console</a></li>
                <li>Select your App</li>
                <li>Go to: WhatsApp → API Setup</li>
                <li>Copy: Temporary Access Token & Phone Number ID</li>
                <li>Paste them here and click Save</li>
              </ol>
            </div>
          </div>
          
          {/* Shopify Status */}
          {shopifyStatus?.error === 'tables_not_created' ? (
            <div className="mt-3 pt-3 border-t border-blue-300">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-medium text-red-700 block mb-1">
                    ❌ Database tables not created!
                  </span>
                  <span className="text-red-600">
                    Please run SQL setup first. Check: SETUP-SHOPIFY-DATABASE-NOW.md
                  </span>
                </div>
              </div>
            </div>
          ) : shopifyStatus && shopifyStatus.is_active ? (
            <div className="mt-3 pt-3 border-t border-blue-300">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-700">
                  ✅ Shopify Connected: {shopifyStatus.shop_url}
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-3 pt-3 border-t border-blue-300">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-600">
                  ⚠️ Shopify not connected. Go to Shopify Integration tab.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
