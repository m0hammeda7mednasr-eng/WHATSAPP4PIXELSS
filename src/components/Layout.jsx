import { useState } from 'react'
import { useBrand } from '../context/BrandContext'
import BrandSwitcher from './BrandSwitcher'
import ChatList from './ChatList'
import ChatWindow from './ChatWindow'
import SettingsComplete from './SettingsComplete'
import { Settings as SettingsIcon, LogOut } from 'lucide-react'

export default function Layout({ session }) {
  const { currentBrand, loading } = useBrand()
  const [selectedContact, setSelectedContact] = useState(null)
  const [showSettings, setShowSettings] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('session')
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-xl text-gray-600">Loading brands...</div>
      </div>
    )
  }

  // Allow access to settings even if no brands
  if (!currentBrand && !showSettings) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl text-gray-600 mb-4">لا توجد براندات</h2>
          <p className="text-sm text-gray-500 mb-6">الرجاء إضافة براند للبدء</p>
          <button
            onClick={() => setShowSettings(true)}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            <SettingsIcon className="w-5 h-5" />
            إضافة براند جديد
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {showSettings && (
        <SettingsComplete session={session} onClose={() => setShowSettings(false)} />
      )}

      {!showSettings && currentBrand && (
        <div className="flex h-screen bg-gray-100">
          {/* Left Sidebar */}
          <div className="w-full md:w-96 bg-white border-r border-gray-200 flex flex-col">
            {/* Brand Switcher Header */}
            <div className="p-4 bg-green-600 text-white border-b border-green-700">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-xl font-semibold">WhatsApp CRM</h1>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="p-2 hover:bg-green-700 rounded-full transition-colors"
                    title="Settings"
                  >
                    <SettingsIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-2 hover:bg-green-700 rounded-full transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <BrandSwitcher />
            </div>

            {/* Chat List */}
            <ChatList
              selectedContact={selectedContact}
              onSelectContact={setSelectedContact}
            />
          </div>

          {/* Main Chat Window */}
          <ChatWindow
            contact={selectedContact}
            onContactUpdate={() => setSelectedContact(null)}
          />
        </div>
      )}
    </>
  )
}
