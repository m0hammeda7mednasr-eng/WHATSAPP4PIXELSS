import { useState } from 'react';
import { X, User, Smartphone, Store, Package, ArrowLeft } from 'lucide-react';
import ShopifySettings from './ShopifySettings';
import ShopifyOrders from './ShopifyOrders';
import { useBrand } from '../context/BrandContext';

export default function SettingsWithShopify({ session, onClose }) {
  const { currentBrand } = useBrand();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header with Tabs */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
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
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === 'profile'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <User className="w-4 h-4" />
              Profile & WhatsApp
            </button>
            <button
              onClick={() => setActiveTab('shopify')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === 'shopify'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Store className="w-4 h-4" />
              Shopify Integration
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === 'orders'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Package className="w-4 h-4" />
              Shopify Orders
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'profile' && (
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">📋 Profile & WhatsApp Settings</h3>
                <p className="text-sm text-blue-700">
                  هنا هتلاقي إعدادات الحساب وإعدادات WhatsApp. استخدم الأيقونة ⚙️ في الأعلى للوصول للإعدادات الكاملة.
                </p>
              </div>
              
              <div className="grid gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <User className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-semibold">Profile Information</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Email: {session?.user?.email}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    للتعديل، استخدم Settings الكاملة من الأيقونة ⚙️
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Smartphone className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-semibold">WhatsApp Brands</h3>
                  </div>
                  {currentBrand ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Current Brand:</span> {currentBrand.name}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Phone:</span> {currentBrand.display_phone_number}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs font-medium text-gray-500">Token:</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          currentBrand.whatsapp_token && currentBrand.whatsapp_token !== 'your_token_here'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {currentBrand.whatsapp_token && currentBrand.whatsapp_token !== 'your_token_here'
                            ? '✅ Configured'
                            : '⚠️ Not Configured'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No brand selected</p>
                  )}
                  <p className="text-xs text-gray-500 mt-3">
                    للتعديل، استخدم Settings الكاملة من الأيقونة ⚙️
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shopify' && (
            <>
              {currentBrand ? (
                <ShopifySettings brandId={currentBrand.id} />
              ) : (
                <div className="p-12 text-center text-gray-500">
                  <Store className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No brand selected</p>
                  <p className="text-sm mt-1">Please select a brand first from the top</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'orders' && (
            <>
              {currentBrand ? (
                <ShopifyOrders brandId={currentBrand.id} />
              ) : (
                <div className="p-12 text-center text-gray-500">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No brand selected</p>
                  <p className="text-sm mt-1">Please select a brand first from the top</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
