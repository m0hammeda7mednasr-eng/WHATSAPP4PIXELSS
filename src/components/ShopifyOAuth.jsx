import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Store, CheckCircle, XCircle, RefreshCw, ExternalLink, AlertCircle, Key } from 'lucide-react';

export default function ShopifyOAuth({ brandId }) {
  const [loading, setLoading] = useState(true);
  const [connection, setConnection] = useState(null);
  const [shopSubdomain, setShopSubdomain] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [useOAuth, setUseOAuth] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(`shopify_setup_${brandId}`);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setShopSubdomain(data.shopSubdomain || '');
        setClientId(data.clientId || '');
        setClientSecret(data.clientSecret || '');
        setUseOAuth(data.useOAuth !== false);
      } catch (err) {
        console.error('Failed to load saved data:', err);
      }
    }
  }, [brandId]);
  
  // Use ngrok URL for OAuth callback
  const redirectUri = `https://nonsaturated-dennis-noncosmically.ngrok-free.dev/api/shopify/oauth/callback`;

  useEffect(() => {
    loadConnection();
    
    // Check for OAuth callback
    const params = new URLSearchParams(window.location.search);
    if (params.get('shopify_connected') === 'true') {
      setTestResult({ success: true, message: '✅ Shopify connected successfully via OAuth!' });
      loadConnection();
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (params.get('shopify_error')) {
      setTestResult({ success: false, message: `❌ OAuth failed: ${params.get('shopify_error')}` });
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [brandId]);

  const loadConnection = async () => {
    try {
      // Use array query to avoid 406 errors
      const { data, error } = await supabase
        .from('shopify_connections')
        .select('*')
        .eq('brand_id', brandId)
        .limit(1);

      if (error) {
        // Check if table doesn't exist
        if (error.message.includes('does not exist') || error.message.includes('schema cache')) {
          setTestResult({
            success: false,
            message: '❌ Database tables not created! Please run the SQL setup first. Check SETUP-SHOPIFY-DATABASE-NOW.md'
          });
        }
        setConnection(null);
        console.log('ℹ️ No Shopify connection found:', error.message);
      } else if (data && data.length > 0) {
        setConnection(data[0]);
        const subdomain = data[0].shop_url.replace('.myshopify.com', '');
        setShopSubdomain(subdomain);
        console.log('✅ Shopify connection loaded:', subdomain);
      } else {
        setConnection(null);
        console.log('ℹ️ No Shopify connection found');
      }
    } catch (err) {
      console.log('ℹ️ Error loading connection:', err.message);
      setConnection(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    setConnecting(true);
    setTestResult(null);

    try {
      const shopUrl = `${shopSubdomain}.myshopify.com`;
      
      if (!shopSubdomain) {
        throw new Error('Please enter your shop subdomain');
      }

      // Save to localStorage for persistence
      localStorage.setItem(`shopify_setup_${brandId}`, JSON.stringify({
        shopSubdomain,
        clientId,
        clientSecret,
        useOAuth
      }));

      if (useOAuth) {
        // OAuth Flow
        if (!clientId || !clientSecret) {
          throw new Error('Please provide Client ID and Client Secret');
        }

        // Build state with credentials (base64 encoded)
        const stateData = {
          brandId,
          clientId,
          clientSecret
        };
        const state = btoa(JSON.stringify(stateData));

        // Build OAuth URL
        const scopes = 'read_orders,write_orders,read_products,read_customers,write_fulfillments';
        const authUrl = `https://${shopUrl}/admin/oauth/authorize?` +
          `client_id=${clientId}&` +
          `scope=${scopes}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `state=${state}`;

        console.log('🔐 OAuth URL generated');
        console.log('📋 URL:', authUrl);
        
        // Show URL instead of redirecting
        setTestResult({
          success: true,
          message: `✅ OAuth URL generated! Copy and open in new tab:`,
          url: authUrl
        });
        
        setConnecting(false);
        return;
      } else {
        // Manual Token
        const shopUrl = `${shopSubdomain}.myshopify.com`;
        
        if (!accessToken.startsWith('shpat_')) {
          throw new Error('Access token must start with shpat_');
        }

        // Test connection
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

        // Clear localStorage after successful connection
        localStorage.removeItem(`shopify_setup_${brandId}`);

        setConnection(data);
        setTestResult({
          success: true,
          message: `✅ Connected successfully to: ${shopData.shop.name}`
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `❌ Connection failed: ${error.message}`
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Shopify?')) return;

    try {
      await supabase
        .from('shopify_connections')
        .update({ is_active: false })
        .eq('brand_id', brandId);

      await supabase
        .from('brands')
        .update({ shopify_connected: false })
        .eq('id', brandId);

      // Clear localStorage
      localStorage.removeItem(`shopify_setup_${brandId}`);

      setConnection(null);
      setShopSubdomain('');
      setAccessToken('');
      setClientId('');
      setClientSecret('');
      setTestResult({ success: true, message: '✅ Shopify disconnected' });
    } catch (error) {
      setTestResult({ success: false, message: `❌ Error: ${error.message}` });
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
        throw new Error('Connection failed - check your token');
      }

      const data = await response.json();
      setTestResult({
        success: true,
        message: `✅ Connection works! Store: ${data.shop.name}`
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `❌ Test failed: ${error.message}`
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Store className="w-8 h-8 text-green-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Shopify Integration</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Connect your Shopify store to send order confirmations via WhatsApp
                </p>
              </div>
            </div>
            {/* Connection Status Badge */}
            <div>
              {loading ? (
                <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                  Loading...
                </span>
              ) : connection && connection.is_active ? (
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Connected
                </span>
              ) : (
                <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Not Connected
                </span>
              )}
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
                  <h3 className="font-semibold text-green-900">Connected Successfully</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Store: <span className="font-mono">{connection.shop_url}</span>
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Connected: {new Date(connection.created_at).toLocaleDateString()}
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
                Test Connection
              </button>

              <a
                href={`https://${connection.shop_url}/admin`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <ExternalLink className="w-4 h-4" />
                Open Shopify
              </a>

              <button
                onClick={handleDisconnect}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 ml-auto"
              >
                <XCircle className="w-4 h-4" />
                Disconnect
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
                  <h4 className="font-semibold mb-2">How to use:</h4>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Connect n8n to Shopify to receive new orders</li>
                    <li>When a new order is created, send POST request to API</li>
                    <li>WhatsApp message with buttons will be sent</li>
                    <li>When customer clicks button, Shopify updates automatically</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Connection Form */
          <form onSubmit={handleConnect} className="p-6 space-y-6">
            {/* Saved Data Notice */}
            {(shopSubdomain || clientId) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <CheckCircle className="w-4 h-4" />
                  <span>Your data is saved and will persist after refresh</span>
                </div>
              </div>
            )}

            {/* OAuth Redirect URL - Always visible */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-2">📍 OAuth Redirect URL</h4>
                  <p className="text-xs text-blue-700 mb-2">
                    Copy this URL and paste it in Shopify App settings:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={redirectUri}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded-lg font-mono text-sm text-blue-900"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(redirectUri);
                        setTestResult({ success: true, message: '✅ Redirect URL copied!' });
                        setTimeout(() => setTestResult(null), 2000);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Connection Method Toggle */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={!useOAuth}
                    onChange={() => setUseOAuth(false)}
                    className="w-4 h-4 text-green-600"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Manual Token (Recommended)</span>
                    <p className="text-xs text-gray-600">Easier setup, works immediately</p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={useOAuth}
                    onChange={() => setUseOAuth(true)}
                    className="w-4 h-4 text-green-600"
                  />
                  <div>
                    <span className="font-medium text-gray-900">OAuth (Advanced)</span>
                    <p className="text-xs text-gray-600">More secure, requires redirect URL setup</p>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shop Subdomain *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shopSubdomain}
                  onChange={(e) => setShopSubdomain(e.target.value.replace(/[^a-z0-9-]/g, ''))}
                  placeholder="your-store"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                <span className="text-gray-600">.myshopify.com</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Example: If your store is "my-store.myshopify.com", enter "my-store"
              </p>
            </div>

            {useOAuth ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client ID *
                  </label>
                  <input
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="Your Client ID from Shopify App"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Also called "API Key" in Shopify
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Secret *
                  </label>
                  <input
                    type="password"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    placeholder="Your Client Secret from Shopify App"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Also called "API Secret Key" in Shopify
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Key className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-2">🔧 OAuth Setup Steps:</p>
                      <ol className="list-decimal list-inside space-y-1 text-xs">
                        <li>Go to Shopify Admin → Apps → Develop apps</li>
                        <li>Click "Create an app"</li>
                        <li>Enter app name (e.g., "WhatsApp CRM")</li>
                        <li>Go to "Configuration" tab</li>
                        <li>Under "App URL", paste the Redirect URL from above</li>
                        <li>Click "Configure Admin API scopes"</li>
                        <li>Select: read_orders, write_orders</li>
                        <li>Click "Save"</li>
                        <li>Go to "API credentials" tab</li>
                        <li>Copy "Client ID" and "Client secret"</li>
                        <li>Paste them here and click "Connect with OAuth"</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin API Access Token *
                  </label>
                  <input
                    type="password"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder="shpat_xxxxxxxxxxxxx"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must start with: shpat_
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-2">📝 How to get Admin API Token:</p>
                      <ol className="list-decimal list-inside space-y-1 text-xs">
                        <li>Open Shopify Admin Panel</li>
                        <li>Go to: Settings → Apps and sales channels</li>
                        <li>Click "Develop apps" (top right)</li>
                        <li>Create a new app or select existing one</li>
                        <li>Go to "Configuration" tab</li>
                        <li>Click "Configure Admin API scopes"</li>
                        <li>Select: read_orders, write_orders</li>
                        <li>Click "Save"</li>
                        <li>Click "Install app" (top right)</li>
                        <li>Go to "API credentials" tab</li>
                        <li>Click "Reveal token once"</li>
                        <li>Copy the token and paste it here</li>
                      </ol>
                      <p className="mt-2 text-xs text-blue-700 font-medium">
                        ⚠️ Save the token somewhere safe - you can only see it once!
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {testResult && (
              <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {testResult.message}
              </div>
            )}

            {testResult && (
              <div className={`p-4 rounded-lg border-2 ${testResult.success ? 'bg-green-50 border-green-300 text-green-900' : 'bg-red-50 border-red-300 text-red-900'}`}>
                <div className="font-medium mb-2">{testResult.message}</div>
                {testResult.url && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-semibold">📋 Copy this URL and open in new tab:</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={testResult.url}
                        readOnly
                        className="flex-1 px-3 py-2 bg-white border border-green-400 rounded-lg font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(testResult.url);
                          alert('✅ URL copied to clipboard!');
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 whitespace-nowrap text-sm"
                      >
                        Copy
                      </button>
                      <a
                        href={testResult.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap text-sm flex items-center gap-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open
                      </a>
                    </div>
                  </div>
                )}
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
                  Connecting...
                </>
              ) : (
                <>
                  <Store className="w-5 h-5" />
                  {useOAuth ? 'Connect with OAuth' : 'Connect to Shopify'}
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
