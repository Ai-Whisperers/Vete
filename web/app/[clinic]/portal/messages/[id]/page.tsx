'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Send,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  MoreVertical,
  X,
  Check
} from 'lucide-react'
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'
import { es } from 'date-fns/locale'

interface Message {
  id: string
  content: string
  content_type: string
  attachment_url: string | null
  attachment_type: string | null
  is_internal: boolean
  created_at: string
  sender: {
    id: string
    full_name: string
    avatar_url: string | null
    role: string
  }
}

interface Conversation {
  id: string
  subject: string
  status: 'open' | 'pending' | 'closed'
  priority: string
  created_at: string
  client: {
    id: string
    full_name: string
    email: string
    phone: string | null
    avatar_url: string | null
  }
  pet: {
    id: string
    name: string
    species: string
    photo_url: string | null
  } | null
  assigned_staff: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
}

interface ConversationData {
  conversation: Conversation
  messages: Message[]
  total_messages: number
  page: number
  limit: number
}

export default function ConversationPage() {
  const params = useParams()
  const router = useRouter()
  const clinic = params.clinic as string
  const conversationId = params.id as string

  const [data, setData] = useState<ConversationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null)
  const [showActions, setShowActions] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)

  // Fetch conversation data
  const fetchConversation = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`)
      if (!response.ok) {
        throw new Error('Error al cargar la conversación')
      }
      const result = await response.json()
      setData(result)
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setLoading(false)
    }
  }

  // Get current user profile
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setCurrentUser({ id: userData.id, role: userData.role })
      }
    } catch (err) {
      console.error('Error fetching user:', err)
    }
  }

  useEffect(() => {
    fetchConversation()
    fetchCurrentUser()

    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchConversation, 5000)
    return () => clearInterval(interval)
  }, [conversationId])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [data?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage.trim(),
          content_type: 'text'
        })
      })

      if (!response.ok) {
        throw new Error('Error al enviar mensaje')
      }

      setNewMessage('')
      await fetchConversation()
      messageInputRef.current?.focus()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al enviar mensaje')
    } finally {
      setSending(false)
    }
  }

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Update conversation status
  const updateStatus = async (newStatus: 'open' | 'pending' | 'closed') => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Error al actualizar estado')
      }

      await fetchConversation()
      setShowActions(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar estado')
    }
  }

  // Format date for message grouping
  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) return 'Hoy'
    if (isYesterday(date)) return 'Ayer'
    return format(date, "EEEE, d 'de' MMMM", { locale: es })
  }

  // Group messages by date
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {}
    messages.forEach(msg => {
      const dateKey = formatMessageDate(msg.created_at)
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(msg)
    })
    return groups
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Cargando conversación...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            Error al cargar conversación
          </h2>
          <p className="text-[var(--text-secondary)] mb-6">{error}</p>
          <Link
            href={`/${clinic}/portal/messages`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a Mensajes
          </Link>
        </div>
      </div>
    )
  }

  const { conversation, messages } = data
  const isStaff = currentUser?.role === 'vet' || currentUser?.role === 'admin'
  const messageGroups = groupMessagesByDate(messages)

  const statusConfig = {
    open: {
      label: 'Abierto',
      icon: CheckCircle2,
      className: 'bg-green-100 text-green-700'
    },
    pending: {
      label: 'Pendiente',
      icon: Clock,
      className: 'bg-yellow-100 text-yellow-700'
    },
    closed: {
      label: 'Cerrado',
      icon: AlertCircle,
      className: 'bg-gray-100 text-gray-700'
    }
  }

  const status = statusConfig[conversation.status]
  const StatusIcon = status.icon

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 max-w-5xl">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <Link
              href={`/${clinic}/portal/messages`}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-[var(--text-secondary)]" />
            </Link>

            {/* Conversation Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-[var(--text-primary)] truncate">
                {conversation.subject}
              </h1>
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                {isStaff ? (
                  <>
                    <User className="w-4 h-4" />
                    <span>{conversation.client.full_name}</span>
                    {conversation.pet && (
                      <>
                        <span>·</span>
                        <span>{conversation.pet.name}</span>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {conversation.assigned_staff ? (
                      <>
                        <User className="w-4 h-4" />
                        <span>Asignado a {conversation.assigned_staff.full_name}</span>
                      </>
                    ) : (
                      <span>Clínica</span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.className}`}>
                <StatusIcon className="w-4 h-4" />
                {status.label}
              </span>

              {/* Actions Menu (Staff Only) */}
              {isStaff && (
                <div className="relative">
                  <button
                    onClick={() => setShowActions(!showActions)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-[var(--text-secondary)]" />
                  </button>

                  {showActions && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowActions(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                        {conversation.status !== 'open' && (
                          <button
                            onClick={() => updateStatus('open')}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            Marcar como Abierto
                          </button>
                        )}
                        {conversation.status !== 'pending' && (
                          <button
                            onClick={() => updateStatus('pending')}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Clock className="w-4 h-4 text-yellow-600" />
                            Marcar como Pendiente
                          </button>
                        )}
                        {conversation.status !== 'closed' && (
                          <button
                            onClick={() => updateStatus('closed')}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <X className="w-4 h-4 text-gray-600" />
                            Cerrar Conversación
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          {Object.entries(messageGroups).map(([dateKey, dateMessages]) => (
            <div key={dateKey} className="mb-8">
              {/* Date Divider */}
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px bg-gray-200 flex-1" />
                <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
                  {dateKey}
                </span>
                <div className="h-px bg-gray-200 flex-1" />
              </div>

              {/* Messages for this date */}
              <div className="space-y-4">
                {dateMessages.map((message) => {
                  const isSentByMe = message.sender.id === currentUser?.id
                  const isStaffMessage = ['vet', 'admin'].includes(message.sender.role)

                  return (
                    <div
                      key={message.id}
                      className={`flex items-start gap-3 ${isSentByMe ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center overflow-hidden">
                          {message.sender.avatar_url ? (
                            <img
                              src={message.sender.avatar_url}
                              alt={message.sender.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white text-sm font-medium">
                              {message.sender.full_name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Message Bubble */}
                      <div className={`flex-1 max-w-lg ${isSentByMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        {/* Sender Name (if not sent by me) */}
                        {!isSentByMe && (
                          <span className="text-xs font-medium text-[var(--text-secondary)] mb-1 px-1">
                            {message.sender.full_name}
                            {isStaffMessage && (
                              <span className="ml-1 text-[var(--primary)]">(Personal)</span>
                            )}
                          </span>
                        )}

                        {/* Message Content */}
                        <div
                          className={`rounded-2xl px-4 py-3 ${
                            isSentByMe
                              ? 'bg-[var(--primary)] text-white rounded-br-sm'
                              : 'bg-white text-[var(--text-primary)] border border-gray-200 rounded-bl-sm shadow-sm'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>

                          {/* Attachment */}
                          {message.attachment_url && (
                            <a
                              href={message.attachment_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-2 mt-2 text-sm ${
                                isSentByMe ? 'text-white' : 'text-[var(--primary)]'
                              } hover:underline`}
                            >
                              <Paperclip className="w-4 h-4" />
                              Ver adjunto
                            </a>
                          )}
                        </div>

                        {/* Timestamp */}
                        <span className={`text-xs text-[var(--text-tertiary)] mt-1 px-1 ${isSentByMe ? 'text-right' : 'text-left'}`}>
                          {format(new Date(message.created_at), 'HH:mm', { locale: es })}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Empty State */}
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-[var(--text-tertiary)]" />
              </div>
              <p className="text-[var(--text-secondary)]">
                No hay mensajes aún. Sé el primero en escribir.
              </p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Composer */}
      {conversation.status !== 'closed' ? (
        <div className="bg-white border-t border-gray-200 shadow-lg">
          <div className="container mx-auto px-4 py-4 max-w-5xl">
            <div className="flex items-end gap-3">
              {/* Attachment Button (Placeholder) */}
              <button
                disabled
                className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Próximamente: adjuntar archivos"
              >
                <Paperclip className="w-6 h-6" />
              </button>

              {/* Text Input */}
              <div className="flex-1 relative">
                <textarea
                  ref={messageInputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu mensaje..."
                  rows={1}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none max-h-32"
                  style={{
                    minHeight: '48px',
                    maxHeight: '128px',
                    overflowY: 'auto'
                  }}
                />
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                className="p-3 bg-[var(--primary)] text-white rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                {sending ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-6 h-6" />
                )}
              </button>
            </div>

            {/* Help Text */}
            <p className="text-xs text-[var(--text-tertiary)] mt-2 text-center">
              Presiona Enter para enviar, Shift+Enter para nueva línea
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-100 border-t border-gray-200 py-4">
          <div className="container mx-auto px-4 max-w-5xl text-center">
            <p className="text-[var(--text-secondary)] text-sm">
              Esta conversación está cerrada. {isStaff ? 'Reabre la conversación para continuar.' : 'Contacta a la clínica para reabrir.'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
