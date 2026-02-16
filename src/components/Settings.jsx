import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { X, User, Key, Bell, Webhook, Save, ArrowLeft, Smartphone, Edit2, Check, LogOut, Store, Package } from 'lucide-react'
import { useBrand } from '../context/BrandContext'
import ShopifySettings from './ShopifySettings'
import ShopifyOrders from './ShopifyOrders'

export default function Settings({ session, onClose }) {
  const { currentBrand, brands, refreshBrands } = useBrand()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile') // profile, whatsapp, shopify, orders
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [notifications, setNotifications] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  // WhatsApp Brand Settings
  const [editingBrand, setEditingBrand] = useState(null)
  const [brandName, setBrandName] = useState('')
  const [brandPhone, setBrandPhone] = useState('')
  const [brandToken, setBrandToken] = useState('')
  const [brandPhoneId, setBrandPhoneId] = useState('')

  useEffect(() => {
    loadUserData()
    loadUserSettings()
  }, [])

  const loadUserData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setEmail(user.email)
      setFullName(user.user_metadata?.full_name || '')
    }
    setLoading(false)
  }

  const loadUserSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (data) {
      setWebhookUrl(data.webhook_url || '')
      setNotifications(data.notifications_enabled)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName }
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    }
    setSaving(false)
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      setSaving(false)
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      setSaving(false)
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Password updated successfully!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
    setSaving(false)
  }

  const handleUpdateWebhook = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Check if settings exist
    const { data: existing } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', user.id)
      .single()

    let error
    if (existing) {
      // Update existing
      const result = await supabase
        .from('user_settings')
        .update({ 
          webhook_url: webhookUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
      error = result.error
    } else {
      // Insert new
      const result = await supabase
        .from('user_settings')
        .insert({ 
          user_id: user.id,
          webhook_url: webhookUrl
        })
      error = result.error
    }

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Webhook URL saved successfully!' })
    }
    setSaving(false)
  }

  const handleUpdateNotifications = async (newValue) => {
    setNotifications(newValue)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Check if settings exist
    const { data: existing } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      await supabase
        .from('user_settings')
        .update({ 
          notifications_enabled: newValue,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
    } else {
      await supabase
        .from('user_settings')
        .insert({ 
          user_id: user.id,
          notifications_enabled: newValue
        })
    }
  }

  const handleEditBrand = (brand) => {
    setEditingBrand(brand.id)
    setBrandName(brand.name || '')
    setBrandPhone(brand.display_phone_number || '')
    setBrandToken(brand.whatsapp_token || '')
    setBrandPhoneId(brand.phone_number_id || '')
  }

  const handleSaveBrand = async (brandId) => {
    setSaving(true)
    setMessage({ type: '', text: '' })

    // Validation
    if (!brandName || !brandPhone) {
      setMessage({ type: 'error', text: 'Please fill in Brand Name and Phone Number' })
      setSaving(false)
      return
    }

    if (!brandToken || !brandPhoneId) {
      setMessage({ type: 'error', text: 'Please fill in both Token and Phone Number ID' })
      setSaving(false)
      return
    }

    if (!brandToken.startsWith('EAA')) {
      setMessage({ type: 'error', text: 'Invalid token format. Token should start with "EAA"' })
      setSaving(false)
      return
    }

    if (brandPhoneId.length < 10) {
      setMessage({ type: 'error', text: 'Phone Number ID seems too short. Make sure you copied the correct ID (usually 15 digits)' })
      setSaving(false)
      return
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
      .eq('id', brandId)

    if (error) {
      setMessage({ type: 'error', text: 'Failed to update brand: ' + error.message })
    } else {
      setMessage({ type: 'success', text: 'Brand updated successfully! ✅ You can now send WhatsApp messages!' })
      setEditingBrand(null)
      refreshBrands()
    }
    setSaving(false)
  }

  const handleCancelEdit = () => {
    setEditingBrand(null)
    setBrandName('')
    setBrandPhone('')
    setBrandToken('')
    setBrandPhoneId('')
  }

  const handleLogout = async () => {
    const confirmed = window.confirm('هل أنت متأكد من تسجيل الخروج؟')
    if (!confirmed) return

    const { error } = await supabase.auth.signOut()
    if (error) {
      setMessage({ type: 'error', text: 'Failed to logout: ' + error.message })
    } else {
      window.location.reload()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors lg:hidden"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden lg:block"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <User className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                activeTab === 'whatsapp'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              WhatsApp
            </button>
            <button
              onClick={() => setActiveTab('shopify')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                activeTab === 'shopify'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Store className="w-4 h-4" />
              Shopify
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Package className="w-4 h-4" />
              Orders
            </button>
          </div>
        </div>

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

          {/* Shopify Tab */}
          {activeTab === 'shopify' && currentBrand && (
            <ShopifySettings brandId={currentBrand.id} />
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && currentBrand && (
            <ShopifyOrders brandId={currentBrand.id} />
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <>
              {/* Profile Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">Profile Information</h3>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>

          {/* Password Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">Change Password</h3>
            </div>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={saving || !newPassword}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* WhatsApp Brands Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">WhatsApp Brands</h3>
            </div>
            
            <div className="space-y-4">
              {brands && brands.length > 0 ? (
                brands.map((brand) => (
                  <div key={brand.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-800">{brand.name}</h4>
                        <p className="text-sm text-gray-500">{brand.display_phone_number}</p>
                      </div>
                      {editingBrand !== brand.id && (
                        <button
                          onClick={() => handleEditBrand(brand)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                      )}
                    </div>

                    {editingBrand === brand.id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Brand Name
                          </label>
                          <input
                            type="text"
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            placeholder="4 Pixels"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            WhatsApp Access Token
                          </label>
                          <input
                            type="text"
                            value={brandToken}
                            onChange={(e) => setBrandToken(e.target.value)}
                            placeholder="EAAxxxxxxxxxxxxxxxxxxxxxxxxx"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm font-mono"
                          />
                          <div className="flex items-start gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              brandToken.startsWith('EAA') 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {brandToken.startsWith('EAA') ? '✓ Valid format' : '✗ Should start with EAA'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            📍 Meta → WhatsApp → API Setup → "Temporary access token"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm font-mono"
                          />
                          <div className="flex items-start gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              brandPhoneId.length >= 10 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {brandPhoneId.length >= 10 ? '✓ Valid length' : '✗ Too short (should be ~15 digits)'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            📍 Meta → WhatsApp → API Setup → "Phone number ID" (الرقم الطويل جنب الموبايل)
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveBrand(brand.id)}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 text-sm"
                          >
                            <Check className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={saving}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors text-sm"
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
                              : '⚠️  Not Configured'}
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
              <p className="text-sm text-blue-800 font-medium mb-2">💡 كيفية الحصول على الـ Token:</p>
              <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                <li>افتح: <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer" className="underline">Meta Developer Console</a></li>
                <li>اختار الـ App بتاعك</li>
                <li>من القائمة: WhatsApp → API Setup</li>
                <li>انسخ: Temporary Access Token & Phone Number ID</li>
                <li>الصقهم هنا واضغط Save</li>
              </ol>
            </div>
          </div>

          {/* WhatsApp Configuration Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Webhook className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">Webhook Setup (لاستقبال الرسائل)</h3>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800 font-medium mb-2">⚠️ مهم:</p>
              <p className="text-xs text-yellow-700">
                عشان تستقبل رسائل من WhatsApp، لازم تسجل الـ webhook في Meta Developer Console
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  1️⃣ Webhook URL (للتسجيل في Meta)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value="http://localhost:3001/webhook/whatsapp"
                    disabled
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('http://localhost:3001/webhook/whatsapp');
                      setMessage({ type: 'success', text: 'Webhook URL copied!' });
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-red-600 mt-1 font-medium">
                  ⚠️ ده للـ local testing بس! للـ production محتاج ngrok أو domain حقيقي
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  2️⃣ Verify Token
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value="whatsapp_crm_2024"
                    disabled
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('whatsapp_crm_2024');
                      setMessage({ type: 'success', text: 'Token copied!' });
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium mb-2">📝 خطوات التفعيل:</p>
                <ol className="text-xs text-blue-700 space-y-2 list-decimal list-inside">
                  <li>
                    <strong>شغّل ngrok:</strong>
                    <code className="block bg-blue-100 px-2 py-1 rounded mt-1 ml-4">ngrok http 3001</code>
                  </li>
                  <li>
                    <strong>انسخ الـ ngrok URL</strong> (مثال: https://1234-abcd.ngrok-free.app)
                  </li>
                  <li>
                    <strong>روح Meta Developer Console:</strong>
                    <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                      Open Meta Console
                    </a>
                  </li>
                  <li>
                    <strong>WhatsApp → Configuration → Webhook</strong>
                  </li>
                  <li>
                    <strong>Callback URL:</strong> https://your-ngrok-url.ngrok-free.app/webhook/whatsapp
                  </li>
                  <li>
                    <strong>Verify Token:</strong> whatsapp_crm_2024
                  </li>
                  <li>
                    <strong>اضغط:</strong> Verify and Save
                  </li>
                  <li>
                    <strong>Subscribe to:</strong> messages ✅
                  </li>
                </ol>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 font-medium mb-2">✅ بعد التفعيل:</p>
                <ul className="text-xs text-green-700 space-y-1 list-disc list-inside">
                  <li>لما العميل يرد على WhatsApp، الرسالة هتظهر في الـ chat فوراً</li>
                  <li>Real-time updates بدون refresh</li>
                  <li>كل الرسائل الواردة هتتحفظ تلقائياً</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Enable Notifications</p>
                <p className="text-sm text-gray-500">Get notified about new messages</p>
              </div>
              <button
                onClick={() => handleUpdateNotifications(!notifications)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  notifications ? 'translate-x-6' : ''
                }`} />
              </button>
            </div>
          </div>

          {/* Logout Section */}
          <div className="bg-red-50 rounded-lg p-6 border border-red-200">
            <div className="flex items-center gap-2 mb-4">
              <LogOut className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-800">Logout</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              تسجيل الخروج من الحساب. سيتم إعادة توجيهك إلى صفحة تسجيل الدخول.
            </p>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
