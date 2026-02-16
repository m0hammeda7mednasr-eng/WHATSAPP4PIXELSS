import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useBrand } from '../context/BrandContext'
import { Search, MessageCircle, Plus, X } from 'lucide-react'

export default function ChatList({ selectedContact, onSelectContact }) {
  const { currentBrand } = useBrand()
  const [contacts, setContacts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showNewChat, setShowNewChat] = useState(false)
  const [newPhone, setNewPhone] = useState('')
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (currentBrand) {
      fetchContacts()
      subscribeToContacts()
    }
  }, [currentBrand])

  const fetchContacts = async () => {
    if (!currentBrand) {
      console.log('⚠️  No current brand selected')
      return
    }

    console.log('📥 Fetching contacts for brand:', currentBrand.name)

    setLoading(true)
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('brand_id', currentBrand.id)
      .order('last_message_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching contacts:', error)
    } else {
      console.log(`✅ Loaded ${data.length} contacts`)
      setContacts(data)
    }
    setLoading(false)
  }

  const subscribeToContacts = () => {
    const channel = supabase
      .channel(`contacts-${currentBrand.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts',
          filter: `brand_id=eq.${currentBrand.id}`,
        },
        () => {
          fetchContacts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.wa_id.includes(searchTerm)
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
      // تنظيف الرقم (إزالة المسافات والرموز)
      const cleanPhone = newPhone.replace(/[^\d+]/g, '')
      
      // إضافة 2 لو الرقم مصري ومبدأش بـ +
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
        wa_id = cleanPhone.substring(1) // إزالة الـ +
      }

      console.log('📝 Creating contact:', { 
        wa_id, 
        name: newName || wa_id,
        brand_id: currentBrand.id,
        brand_name: currentBrand.name
      })

      // إنشاء أو جلب الـ contact
      const { data: contact, error } = await supabase
        .from('contacts')
        .upsert({
          brand_id: currentBrand.id,
          wa_id: wa_id,
          name: newName.trim() || wa_id,
          last_message_at: new Date().toISOString()
        }, {
          onConflict: 'brand_id,wa_id',
          ignoreDuplicates: false
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating contact:', error)
        alert('Failed to create contact: ' + error.message)
        return
      }

      console.log('✅ Contact created/updated:', contact)

      // اختيار الـ contact الجديد
      onSelectContact(contact)
      
      // إعادة تعيين الـ form
      setNewPhone('')
      setNewName('')
      setShowNewChat(false)
      
      // تحديث القائمة
      await fetchContacts()

    } catch (error) {
      console.error('❌ Error:', error)
      alert('Failed to create contact: ' + error.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
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
                  Enter Egyptian number (01xxxxxxxxx) or international format (+2...)
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
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Start Chat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search & New Chat Button */}
      <div className="p-3 border-b border-gray-200 space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-green-500"
            />
          </div>
          <button
            onClick={() => setShowNewChat(true)}
            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            title="New Chat"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading contacts...</div>
        ) : filteredContacts.length === 0 ? (
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
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {contact.name}
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {formatTime(contact.last_message_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {contact.wa_id}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
