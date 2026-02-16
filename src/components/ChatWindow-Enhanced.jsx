import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useBrand } from '../context/BrandContext'
import { API_URL } from '../config'
import { 
  Send, Phone, MessageCircle, Check, CheckCheck, Clock, AlertCircle, 
  Trash2, Mic, Paperclip, X, Download
} from 'lucide-react'
import OrderMessageCard from './OrderMessageCard'

export default function ChatWindow({ contact, onContactUpdate }) {
  const { currentBrand } = useBrand()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  useEffect(() => {
    if (contact && currentBrand) {
      fetchMessages()
      const cleanup = subscribeToMessages()
      
      const refreshInterval = setInterval(() => {
        fetchMessages();
      }, 2000);
      
      return () => {
        cleanup && cleanup();
        clearInterval(refreshInterval);
      }
    }
  }, [contact, currentBrand])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    if (!contact || !currentBrand) return

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('contact_id', contact.id)
      .eq('brand_id', currentBrand.id)
      .order('created_at', { ascending: true })

    if (!error && data) {
      setMessages(data)
    }
  }

  const subscribeToMessages = () => {
    if (!contact || !currentBrand) return;

    const channel = supabase
      .channel(`brand-messages-${currentBrand.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `brand_id=eq.${currentBrand.id}`,
        },
        (payload) => {
          if (payload.new.contact_id === contact.id) {
            setMessages((prev) => {
              const exists = prev.some(msg => msg.id === payload.new.id);
              if (!exists) {
                return [...prev, payload.new];
              }
              return prev;
            });
            scrollToBottom();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // File handling
  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Check file size (5MB for images, 16MB for others)
    const maxSize = file.type.startsWith('image/') ? 5 * 1024 * 1024 : 16 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File too large! Max size: ${maxSize / 1024 / 1024}MB`);
      return;
    }

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
    setAudioBlob(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/ogg; codecs=opus' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Upload file to Supabase Storage
  const uploadFile = async (file, type = 'file') => {
    const fileExt = type === 'audio' ? 'ogg' : file.name.split('.').pop();
    const fileName = `${contact.id}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('whatsapp-media')
      .upload(fileName, file, {
        contentType: file.type,
        cacheControl: '3600',
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('whatsapp-media')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  // Send message
  const handleSend = async (e) => {
    e.preventDefault()
    if ((!newMessage.trim() && !selectedFile && !audioBlob) || !contact || !currentBrand) return

    const messageText = newMessage.trim();
    const tempId = 'temp_' + Date.now();

    setSending(true)
    setNewMessage('')

    // Determine message type
    let messageType = 'text';
    let mediaUrl = null;
    let fileToUpload = selectedFile || audioBlob;

    if (selectedFile) {
      if (selectedFile.type.startsWith('image/')) {
        messageType = 'image';
      } else if (selectedFile.type.startsWith('audio/')) {
        messageType = 'audio';
      } else if (selectedFile.type.startsWith('video/')) {
        messageType = 'video';
      } else {
        messageType = 'document';
      }
    } else if (audioBlob) {
      messageType = 'audio';
    }

    // Optimistic update
    const tempMessage = {
      id: tempId,
      contact_id: contact.id,
      brand_id: currentBrand.id,
      direction: 'outbound',
      message_type: messageType,
      body: messageText || (messageType === 'audio' ? '[Voice message]' : `[${messageType}]`),
      status: 'sending',
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempMessage]);
    scrollToBottom();

    try {
      // Upload file if exists
      if (fileToUpload) {
        mediaUrl = await uploadFile(fileToUpload, messageType);
      }

      // Send to server
      const response = await fetch(`${API_URL}/api/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_id: contact.id,
          brand_id: currentBrand.id,
          message: messageText,
          media_url: mediaUrl,
          message_type: messageType,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        setMessages((prev) => prev.filter(msg => msg.id !== tempId));
        alert(`Failed to send: ${result.error || 'Unknown error'}`)
        setSending(false)
        return
      }

      // Update temp message with real ID
      setMessages((prev) => 
        prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, id: result.message_id, status: 'sent', media_url: mediaUrl }
            : msg
        )
      );

      handleRemoveFile();
      
    } catch (error) {
      console.error('Error:', error)
      setMessages((prev) => prev.filter(msg => msg.id !== tempId));
      alert('Failed to send message.')
    } finally {
      setSending(false)
    }
  }

  // Delete chat
  const handleDeleteChat = async () => {
    if (!contact) return;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('contact_id', contact.id);

      if (error) throw error;

      setMessages([]);
      setShowDeleteConfirm(false);
      alert('Chat deleted successfully!');
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Failed to delete chat.');
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 animate-pulse" />
      case 'sent':
        return <Check className="w-3 h-3" />
      case 'delivered':
        return <CheckCheck className="w-3 h-3" />
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-500" />
      default:
        return <Clock className="w-3 h-3" />
    }
  }

  const renderMessageContent = (message) => {
    // Image
    if (message.message_type === 'image' && message.media_url) {
      return (
        <div className="space-y-2">
          <img
            src={message.media_url}
            alt="Image"
            className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 max-h-64 object-cover"
            onClick={() => window.open(message.media_url, '_blank')}
          />
          {message.body && message.body !== '[image]' && (
            <p className="break-words">{message.body}</p>
          )}
        </div>
      )
    }

    // Audio/Voice
    if ((message.message_type === 'audio' || message.message_type === 'voice') && message.media_url) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 bg-black/10 rounded">
            <Mic className="w-4 h-4" />
            <audio controls className="flex-1 h-8">
              <source src={message.media_url} type="audio/ogg" />
              <source src={message.media_url} type="audio/mpeg" />
              Your browser does not support audio.
            </audio>
          </div>
          {message.body && message.body !== '[Voice message]' && message.body !== '[audio]' && (
            <p className="break-words text-sm">{message.body}</p>
          )}
        </div>
      )
    }

    // Video
    if (message.message_type === 'video' && message.media_url) {
      return (
        <div className="space-y-2">
          <video controls className="rounded-lg max-w-full h-auto max-h-64">
            <source src={message.media_url} />
            Your browser does not support video.
          </video>
          {message.body && message.body !== '[video]' && (
            <p className="break-words">{message.body}</p>
          )}
        </div>
      )
    }

    // Document
    if (message.message_type === 'document' && message.media_url) {
      return (
        <div className="space-y-2">
          <a
            href={message.media_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 bg-black/10 rounded hover:bg-black/20"
          >
            <Paperclip className="w-4 h-4" />
            <span className="flex-1 text-sm">{message.body || 'Document'}</span>
            <Download className="w-4 h-4" />
          </a>
        </div>
      )
    }

    // Text
    return <p className="break-words">{message.body}</p>
  }

  if (!contact) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageCircle className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl text-gray-500">Select a contact to start chatting</h2>
          <p className="text-sm text-gray-400 mt-2">
            Current Brand: {currentBrand?.name}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Chat?</h3>
            <p className="text-sm text-gray-600 mb-4">
              This will permanently delete all messages in this chat. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteChat}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
              {contact.wa_id}
            </p>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
            title="Delete Chat"
          >
            <Trash2 className="w-5 h-5" />
          </button>
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
              {/* Show order card if message has order_id */}
              {message.order_id && (
                <OrderMessageCard orderId={message.order_id} />
              )}
              
              {renderMessageContent(message)}
              
              <div className={`flex items-center gap-1 mt-1 text-xs ${
                message.direction === 'outbound' ? 'text-green-100' : 'text-gray-500'
              }`}>
                <span>{formatTime(message.created_at)}</span>
                {message.direction === 'outbound' && (
                  <span className="ml-1">{getStatusIcon(message.status)}</span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        {/* File/Audio Preview */}
        {(selectedFile || audioBlob) && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {filePreview ? (
                <img src={filePreview} alt="Preview" className="w-16 h-16 object-cover rounded" />
              ) : audioBlob ? (
                <div className="flex items-center gap-2 flex-1">
                  <Mic className="w-6 h-6 text-green-500" />
                  <span className="text-sm text-gray-600">Voice message ready</span>
                </div>
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                  <Paperclip className="w-6 h-6 text-gray-500" />
                </div>
              )}
              {selectedFile && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              )}
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
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
          />
          
          {/* File Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 hover:bg-gray-100 rounded-full transition-colors"
            disabled={sending || isRecording}
            title="Attach file"
          >
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>

          {/* Voice Record Button */}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-3 rounded-full transition-colors ${
              isRecording 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            disabled={sending || selectedFile}
            title={isRecording ? 'Stop recording' : 'Record voice message'}
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full outline-none focus:border-green-500"
            disabled={sending || isRecording}
          />
          
          {/* Send Button */}
          <button
            type="submit"
            disabled={sending || (!newMessage.trim() && !selectedFile && !audioBlob) || isRecording}
            className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
