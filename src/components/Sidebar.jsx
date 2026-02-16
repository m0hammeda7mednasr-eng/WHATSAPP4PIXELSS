import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { MessageCircle, LogOut, Search, Settings as SettingsIcon, Plus, X } from 'lucide-react'
import Settings from './Settings'
import { useBrand } from '../context/BrandContext'

export default function Sidebar({ contacts, selectedContact, onSelectContact, session, onContactCreated }) {
  const { currentBrand } = useBrand()
  const [showSettings, setShowSettings] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewChat, setShowNewChat] = useState(false)
  const [newPhone, setNewPhone] = useState('')
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone_number.includes(searchTerm)
  )

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date

    if (diff < 86400000) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const handleCreateContact = async (e) => {
    e.preventDefault()
    if (!newPhone.trim() || !currentBrand) return

    setCreating(true)

    try {
      const cleanPhone = newPhone.replace(/[^\d+]/g, '')
      
      let wa_id = cleanPhone
      if (!cleanPhone.startsWith('+')) {
        if (cleanPhone.startsWith('01')) {
          wa_id = '2' + cleanPhone
        } else if (cleanPhone.startsWith('1')) {
          wa_id = '20' + cleanPhone
        } else {
          wa_id = cleanPhone
        }
      } else {
        wa_id = cleanPhone.substring(1)
      }

      const { data: contact, error } = await supabase
        .from('contacts')
        .upsert({
          brand_id: currentBrand.id,
          wa_id: wa_id,
          name: newName.trim() || wa_id,
          last_message_at: new Date().toISOString()
        }, {
          onConflict: 'brand_id,wa_id'
        })
        .select()
        .single()

      if (error) {
        alert('Failed to create contact: ' + error.message)
        return
      }

      onSelectContact(contact)
      if (onContactCreated) onContactCreated()
      
      setNewPhone('')
      setNewName('')
      setShowNewChat(false)

    } catch (error) {
      alert('Failed to create contact')
    } finally {
      setCreating(false)
    }
  }

  return (
    <>
      {showSettings && (
        <Settings session={session} onClose={() => setShowSettings(false)} />
      )}

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">New Chat</h2>
              <button
                onClick={() => setShowNewChat(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="01234567890 or +201234567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-green-500"
                  required
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  أدخل رقم مصري (01xxxxxxxxx) أو دولي (+2...)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contact name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-green-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewChat(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newPhone.trim()}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Start Chat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="w-full md:w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-green-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-6 h-6" />
              <h1 className="text-xl font-semibold">WhatsApp CRM</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNewChat(true)}
                className="p-2 hover:bg-green-700 rounded-full transition-colors"
                title="New Chat"
              >
                <Plus className="w-5 h-5" />
              </button>
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

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white text-gray-800 rounded-lg outline-none"
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No contacts found</p>
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedContact?.id === contact.id ? 'bg-green-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {contact.name}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatTime(contact.last_message_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {contact.phone_number}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
    </>
  )
}
