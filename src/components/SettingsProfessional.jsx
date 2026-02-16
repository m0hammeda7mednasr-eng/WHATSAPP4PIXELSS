import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { X, User, Smartphone, Store, Package, Settings as SettingsIcon, ArrowLeft } from 'lucide-react';
import { useBrand } from '../context/BrandContext';
import ShopifySettings from './ShopifySettings';
import ShopifyOrders from './ShopifyOrders';

export default function SettingsProfessional({ session, onClose }) {
  const { currentBrand } = useBrand();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile & WhatsApp', icon: User },
    { id: 'shopify', label: 'Shopify Integration', icon: Store },
    { id: 'orders', label: 'Shopify Orders', icon: Package }
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
            <ProfileTab session={session} currentBrand={currentBrand} />
          )}
          {activeTab === 'shopify' && currentBrand && (
            <ShopifySettings brandId={currentBrand.id} />
          )}
          {activeTab === 'orders' && currentBrand && (
            <ShopifyOrders brandId={currentBrand.id} />
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

function ProfileTab({ session, currentBrand }) {
  return (
    <div className="p-6 space-y-6">
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
          <div>
            <label className="text-sm font-medium text-gray-700">User ID</label>
            <p className="text-xs text-gray-500 font-mono mt-1">{session?.user?.id}</p>
          </div>
        </div>
      </div>

      {/* Current Brand */}
      {currentBrand && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Current Brand</h3>
              <p className="text-sm text-gray-600">WhatsApp Business Account</p>
            </div>
          </div>
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
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Quick Tips</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use the <strong>Shopify Integration</strong> tab to connect your store</li>
          <li>• View all orders in the <strong>Shopify Orders</strong> tab</li>
          <li>• Switch brands using the dropdown at the top</li>
        </ul>
      </div>
    </div>
  );
}
