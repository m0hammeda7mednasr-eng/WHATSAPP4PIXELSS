import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import Sidebar from './Sidebar'
import ChatArea from './ChatArea'

export default function ChatLayout({ session }) {
  const [contacts, setContacts] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContacts()

    // Subscribe to new messages
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => {
          fetchContacts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('last_message_at', { ascending: false })

    if (!error && data) {
      setContacts(data)
    }
    setLoading(false)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        contacts={contacts}
        selectedContact={selectedContact}
        onSelectContact={setSelectedContact}
        session={session}
      />
      <ChatArea
        contact={selectedContact}
        onMessageSent={fetchContacts}
      />
    </div>
  )
}
