import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Send, Phone, MessageCircle, Paperclip, Image as ImageIcon, Download, X } from 'lucide-react'

export default function ChatArea({ contact, onMessageSent }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('')
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    loadWebhookUrl()
  }, [])

  const loadWebhookUrl = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('user_settings')
      .select('webhook_url')
      .eq('user_id', user.id)
      .single()

    if (data?.webhook_url) {
      setWebhookUrl(data.webhook_url)
    }
  }

  useEffect(() => {
    if (contact) {
      fetchMessages()

      // Subscribe to new messages for this contact
      const channel = supabase
        .channel(`messages-${contact.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `contact_id=eq.${contact.id}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new])
            scrollToBottom()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [contact])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('contact_id', contact.id)
      .order('created_at', { ascending: true })

    if (!error && data) {
      setMessages(data)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setSelectedFile(file)

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreview(reader.result)
      }
      reader.readAsDataURL(file)
    } else {
      setFilePreview(null)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setFilePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadFile = async (file) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
    const filePath = `${contact.id}/${fileName}`

    const { data, error } = await supabase.storage
      .from('whatsapp-media')
      .upload(filePath, file)

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('whatsapp-media')
      .getPublicUrl(filePath)

    return { publicUrl, fileName: file.name, fileSize: file.size }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if ((!newMessage.trim() && !selectedFile) || !contact) return

    setSending(true)
    setUploading(true)

    try {
      let mediaUrl = null
      let mediaType = null
      let fileName = null
      let fileSize = null

      // 1. Upload file if exists
      if (selectedFile) {
        const uploadResult = await uploadFile(selectedFile)
        mediaUrl = uploadResult.publicUrl
        mediaType = selectedFile.type
        fileName = uploadResult.fileName
        fileSize = uploadResult.fileSize
      }

      // 2. Call n8n webhook
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: contact.phone_number,
            text: newMessage || '',
            media_url: mediaUrl,
            media_type: mediaType,
          }),
        })
      }

      // 3. Insert message into Supabase
      const { error } = await supabase.from('messages').insert({
        contact_id: contact.id,
        direction: 'outbound',
        body: newMessage || (selectedFile ? `Sent ${selectedFile.type.startsWith('image/') ? 'an image' : 'a file'}` : ''),
        type: selectedFile ? (selectedFile.type.startsWith('image/') ? 'image' : 'file') : 'text',
        media_url: mediaUrl,
        media_type: mediaType,
        file_name: fileName,
        file_size: fileSize,
      })

      if (!error) {
        // 4. Update contact's last_message_at
        await supabase
          .from('contacts')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', contact.id)

        setNewMessage('')
        handleRemoveFile()
        onMessageSent()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
      setUploading(false)
    }
  }

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename || 'download'
      link.click()
    } catch (error) {
      console.error('Error downloading file:', error)
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!contact) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageCircle className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl text-gray-500">Select a contact to start chatting</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
            {contact.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-800">{contact.name}</h2>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {contact.phone_number}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.direction === 'outbound' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-md px-4 py-2 rounded-lg ${
                message.direction === 'outbound'
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-800'
              } shadow-sm`}
            >
              {/* Image Preview */}
              {message.media_url && message.type === 'image' && (
                <div className="mb-2">
                  <img
                    src={message.media_url}
                    alt={message.file_name || 'Image'}
                    className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90"
                    onClick={() => window.open(message.media_url, '_blank')}
                  />
                </div>
              )}

              {/* File Attachment */}
              {message.media_url && message.type !== 'image' && message.type !== 'text' && (
                <div className={`flex items-center gap-2 p-2 rounded mb-2 ${
                  message.direction === 'outbound' ? 'bg-green-600' : 'bg-gray-100'
                }`}>
                  <Paperclip className="w-4 h-4" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{message.file_name}</p>
                    {message.file_size && (
                      <p className="text-xs opacity-75">
                        {(message.file_size / 1024).toFixed(1)} KB
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDownload(message.media_url, message.file_name)}
                    className="p-1 hover:bg-black/10 rounded"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Text Body */}
              {message.body && <p className="break-words">{message.body}</p>}

              <span
                className={`text-xs mt-1 block ${
                  message.direction === 'outbound'
                    ? 'text-green-100'
                    : 'text-gray-500'
                }`}
              >
                {formatTime(message.created_at)}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        {/* File Preview */}
        {selectedFile && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {filePreview ? (
                <img src={filePreview} alt="Preview" className="w-16 h-16 object-cover rounded" />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                  <Paperclip className="w-6 h-6 text-gray-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={handleRemoveFile}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSend} className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 hover:bg-gray-100 rounded-full transition-colors"
            disabled={sending}
          >
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full outline-none focus:border-green-500"
            disabled={sending}
          />
          
          <button
            type="submit"
            disabled={sending || (!newMessage.trim() && !selectedFile)}
            className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
