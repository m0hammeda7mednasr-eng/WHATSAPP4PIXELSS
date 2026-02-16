import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, Smartphone, Edit2, Check, X, Webhook, Copy, CheckCircle } from 'lucide-react';
import { useBrand } from '../context/BrandContext';

export default function ProfileSettings({ session }) {
  const { currentBrand, brands, refreshBrands } = useBrand();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [copied, setCopied] = useState('');
  
  // Form state
  const [brandName, setBrandName] = useState('');
  const [displayPhone, setDisplayPhone] = useState('');
  const [whatsappToken, setWhatsappToken] = useState('');
  const [phoneNumberId, setPhoneNumberId] = useState('');

  useEffect(() => {
    if (currentBrand) {
      setBrandName(currentBrand.name || '');
      setDisplayPhone(currentBrand.display_phone_number || '');
      setWhatsappToken(currentBrand.whatsapp_token || '');
      setPhoneNumberId(currentBrand.phone_number_id || '');
    }
  }, [currentBrand]);

  const handleSave = async () => {
    if (!currentBrand) return;
    
    setSaving(true);
    setMessage({ type: '', text: '' });

    // Validation
    if (!brandName || !displayPhone) {
      setMessage({ type: 'error', text: 'Brand Name and Phone Number are required' });
      setSaving(false);
      return;
    }

    if (whatsappToken && !whatsappToken.startsWith('EAA')) {
      setMessage({ type: 'error', text: 'WhatsApp Token must start with "EAA"' });
      setSaving(false);
      return;
    }

    if (phoneNumberId && phoneNumberId.length < 10) {
      setMessage({ type: 'error', text: 'Phone Number ID seems too short' });
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('brands')
      .update({
        name: brandName,
        display_phone_number: displayPhone,
        whatsapp_token: whatsappToken,
        phone_number_id: phoneNumberId,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentBrand.id);

    if (error) {
      setMessage({ type: 'error', text: 'Failed to update: ' + error.message });
    } else {
      setMessage({ type: 'success', text: '✅ Brand updated successfully!' });
      setEditing(false);
      refreshBrands();
    }
    setSaving(false);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const webhookUrl = `${window.location.origin}/webhook/whatsapp`;
  const verifyToken = 'whatsapp_crm_2024';

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
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
            <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
            <p className="text-sm text-gray-600">Your login details</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <p className="text-gray-900 mt-1">{session?.user?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">User ID</label>
            <p className="text-xs text-gray-500 font-mono mt-1">{session?.user?.id}</p>
          </div>
        </div>
      </div>

      {/* Brand Settings */}
      {currentBrand && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Brand Settings</h3>
                <p className="text-sm text-gray-600">WhatsApp Business configuration</p>
              </div>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="4 Pixels"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Phone Number *
                </label>
                <input
                  type="text"
                  value={displayPhone}
                  onChange={(e) => setDisplayPhone(e.target.value)}
                  placeholder="+201234567890"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Access Token
                </label>
                <input
                  type="text"
                  value={whatsappToken}
                  onChange={(e) => setWhatsappToken(e.target.value)}
                  placeholder="EAAxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    whatsappToken.startsWith('EAA') 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {whatsappToken.startsWith('EAA') ? '✓ Valid format' : '✗ Should start with EAA'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number ID
                </label>
                <input
                  type="text"
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                  placeholder="106540529340398"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    phoneNumberId.length >= 10 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {phoneNumberId.length >= 10 ? '✓ Valid length' : '✗ Too short'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setBrandName(currentBrand.name || '');
                    setDisplayPhone(currentBrand.display_phone_number || '');
                    setWhatsappToken(currentBrand.whatsapp_token || '');
                    setPhoneNumberId(currentBrand.phone_number_id || '');
                  }}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Brand Name</label>
                <p className="text-gray-900 mt-1">{currentBrand.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                <p className="text-gray-900 mt-1">{currentBrand.display_phone_number || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">WhatsApp Status</label>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    currentBrand.whatsapp_token && currentBrand.whatsapp_token !== 'your_token_here'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {currentBrand.whatsapp_token && currentBrand.whatsapp_token !== 'your_token_here'
                      ? '✅ Connected'
                      : '⚠️ Not Configured'}
                  </span>
                </div>
              </div>
              {currentBrand.phone_number_id && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone Number ID</label>
                  <p className="text-xs text-gray-600 font-mono mt-1">{currentBrand.phone_number_id}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Webhook Configuration */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Webhook className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Webhook Configuration</h3>
            <p className="text-sm text-gray-600">For receiving WhatsApp messages</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={webhookUrl}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-mono text-sm"
              />
              <button
                onClick={() => copyToClipboard(webhookUrl, 'webhook')}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
              >
                {copied === 'webhook' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                {copied === 'webhook' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verify Token
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={verifyToken}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-mono text-sm"
              />
              <button
                onClick={() => copyToClipboard(verifyToken, 'token')}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
              >
                {copied === 'token' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                {copied === 'token' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">📝 Setup Instructions:</h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Go to <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer" className="underline">Meta Developer Console</a></li>
              <li>Select your App → WhatsApp → Configuration</li>
              <li>In Webhook section, click "Edit"</li>
              <li>Paste the Webhook URL above</li>
              <li>Paste the Verify Token above</li>
              <li>Click "Verify and Save"</li>
              <li>Subscribe to "messages" webhook field</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
