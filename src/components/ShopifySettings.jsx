import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Store, CheckCircle, XCircle, RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';

export default function ShopifySettings({ brandId }) {
  const [loading, setLoading] = useState(true);
  const [connection, setConnection] = useState(null);
  const [shopUrl, setShopUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    loadConnection();
  }, [brandId]);

  const loadConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('shopify_connections')
        .select('*')
        .eq('brand_id', brandId)
        .single();

      if (!error && data) {
        setConnection(data);
        setShopUrl(data.shop_url);
      }
    } catch (err) {
      console.log('No connection found');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    setConnecting(true);
    setTestResult(null);

    try {
      // Validate shop URL
      if (!shopUrl.includes('.myshopify.com')) {
        throw new Error('Shop URL must be in format: your-store.myshopify.com');
      }

      if (!accessToken.startsWith('shpat_')) {
        throw new Error('Access token must start with shpat_');
      }

      // Test connection first
      const testResponse = await fetch(`https://${shopUrl}/admin/api/2024-01/shop.json`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      });

      if (!testResponse.ok) {
        throw new Error('Invalid credentials or shop URL');
      }

      const shopData = await testResponse.json();

      // Save connection
      const { data, error } = await supabase
        .from('shopify_connections')
        .upsert({
          brand_id: brandId,
          shop_url: shopUrl,
          access_token: accessToken,
          is_active: true,
          scope: 'read_orders,write_orders'
        }, {
          onConflict: 'brand_id'
        })
        .select()
        .single();

      if (error) throw error;

      // Update brand
      await supabase
        .from('brands')
        .update({
          shopify_store_url: shopUrl,
          shopify_connected: true
        })
        .eq('id', brandId);

      setConnection(data);
      setTestResult({
        success: true,
        message: `✅ متصل بنجاح مع: ${shopData.shop.name}`
      });

    } catch (error) {
      setTestResult({
        success: false,
        message: `❌ فشل الاتصال: ${error.message}`
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('هل أنت متأكد من فصل Shopify؟')) return;

    try {
      await supabase
        .from('shopify_connections')
        .update({ is_active: false })
        .eq('brand_id', brandId);

      await supabase
        .from('brands')
        .update({ shopify_connected: false })
        .eq('id', brandId);

      setConnection(null);
      setShopUrl('');
      setAccessToken('');
      setTestResult({ success: true, message: '✅ تم فصل Shopify' });
    } catch (error) {
      setTestResult({ success: false, message: `❌ خطأ: ${error.message}` });
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(`https://${connection.shop_url}/admin/api/2024-01/shop.json`, {
        headers: {
          'X-Shopify-Access-Token': connection.access_token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('فشل الاتصال - تحقق من الـ Token');
      }

      const data = await response.json();
      setTestResult({
        success: true,
        message: `✅ الاتصال يعمل! المتجر: ${data.shop.name}`
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `❌ فشل الاختبار: ${error.message}`
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <Store className="w-8 h-8 text-green-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">ربط Shopify</h2>
              <p className="text-sm text-gray-600 mt-1">
                اربط متجر Shopify لإرسال تأكيدات الطلبات عبر WhatsApp
              </p>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        {connection && connection.is_active ? (
          <div className="p-6 space-y-6">
            {/* Connected Status */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900">متصل بنجاح</h3>
                  <p className="text-sm text-green-700 mt-1">
                    المتجر: <span className="font-mono">{connection.shop_url}</span>
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    تم الاتصال: {new Date(connection.created_at).toLocaleDateString('ar-EG')}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
                اختبار الاتصال
              </button>

              <a
                href={`https://${connection.shop_url}/admin`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <ExternalLink className="w-4 h-4" />
                فتح Shopify
              </a>

              <button
                onClick={handleDisconnect}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 mr-auto"
              >
                <XCircle className="w-4 h-4" />
                فصل الاتصال
              </button>
            </div>

            {/* Test Result */}
            {testResult && (
              <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {testResult.message}
              </div>
            )}

            {/* How to Use */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <h4 className="font-semibold mb-2">كيفية الاستخدام:</h4>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>اربط n8n بـ Shopify لاستقبال الطلبات الجديدة</li>
                    <li>عند إنشاء طلب جديد، أرسل طلب POST إلى API</li>
                    <li>سيتم إرسال رسالة WhatsApp مع أزرار التأكيد/الإلغاء</li>
                    <li>عند الضغط على الزرار، سيتم تحديث Shopify تلقائياً</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Connection Form */
          <form onSubmit={handleConnect} className="p-6 space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-900">
                  <h4 className="font-semibold mb-2">قبل البدء:</h4>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>افتح Shopify Admin Panel</li>
                    <li>اذهب إلى: Settings → Apps and sales channels → Develop apps</li>
                    <li>أنشئ Custom App جديد</li>
                    <li>اطلب الصلاحيات: read_orders, write_orders</li>
                    <li>انسخ Admin API access token</li>
                  </ol>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shop URL
              </label>
              <input
                type="text"
                value={shopUrl}
                onChange={(e) => setShopUrl(e.target.value)}
                placeholder="your-store.myshopify.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                مثال: my-store.myshopify.com
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin API Access Token
              </label>
              <input
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="shpat_xxxxxxxxxxxxx"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                يبدأ بـ: shpat_
              </p>
            </div>

            {testResult && (
              <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {testResult.message}
              </div>
            )}

            <button
              type="submit"
              disabled={connecting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              {connecting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  جاري الاتصال...
                </>
              ) : (
                <>
                  <Store className="w-5 h-5" />
                  ربط Shopify
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
