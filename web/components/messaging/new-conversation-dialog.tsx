"use client"

import { useState, useEffect } from 'react'
import { X, Send, MessageSquare, Search, User, PawPrint } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Pet {
  id: string
  name: string
}

interface Client {
  id: string
  full_name: string
  email: string
}

interface Props {
  clinic: string
  onClose: () => void
  isOpen: boolean
  isStaff: boolean
  pets?: Pet[]
}

export default function NewConversationDialog({
  clinic,
  onClose,
  isOpen,
  isStaff,
  pets = []
}: Props) {
  const router = useRouter()
  const [subject, setSubject] = useState('')
  const [petId, setPetId] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Staff-specific state
  const [clientSearch, setClientSearch] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSubject('')
      setPetId('')
      setMessage('')
      setError('')
      setClientSearch('')
      setClients([])
      setSelectedClient(null)
    }
  }, [isOpen])

  // Search for clients (staff only)
  useEffect(() => {
    if (!isStaff || !clientSearch.trim()) {
      setClients([])
      return
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const response = await fetch(
          `/api/clients/search?q=${encodeURIComponent(clientSearch)}`
        )
        if (response.ok) {
          const data = await response.json()
          setClients(data.clients || [])
        }
      } catch (err) {
        console.error('Error searching clients:', err)
      } finally {
        setSearchLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [clientSearch, isStaff])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!subject.trim()) {
      setError('El asunto es obligatorio')
      return
    }

    if (!message.trim()) {
      setError('El mensaje es obligatorio')
      return
    }

    if (isStaff && !selectedClient) {
      setError('Debes seleccionar un cliente')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: subject.trim(),
          pet_id: petId || null,
          initial_message: message.trim(),
          recipient_id: isStaff ? selectedClient?.id : null
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al crear la conversación')
      }

      const data = await response.json()

      // Redirect to the new conversation
      router.push(`/${clinic}/portal/messages/${data.conversation.id}`)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la conversación')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--primary)]/10 rounded-xl">
              <MessageSquare className="w-6 h-6 text-[var(--primary)]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Nueva Conversación
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                {isStaff ? 'Iniciar conversación con un cliente' : 'Enviar mensaje a la clínica'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-5">
            {/* Client selector (staff only) */}
            {isStaff && (
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Cliente <span className="text-red-500">*</span>
                </label>
                {!selectedClient ? (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      placeholder="Buscar por nombre o email..."
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all"
                      disabled={loading}
                    />
                    {searchLoading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    {clients.length > 0 && (
                      <div className="absolute z-10 w-full mt-2 bg-white rounded-xl border border-gray-200 shadow-lg max-h-60 overflow-y-auto">
                        {clients.map((client) => (
                          <button
                            key={client.id}
                            type="button"
                            onClick={() => {
                              setSelectedClient(client)
                              setClientSearch('')
                              setClients([])
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                          >
                            <User className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-[var(--text-primary)]">
                                {client.full_name}
                              </p>
                              <p className="text-sm text-[var(--text-secondary)]">
                                {client.email}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">
                          {selectedClient.full_name}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {selectedClient.email}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedClient(null)}
                      className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                      disabled={loading}
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Asunto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ej: Consulta sobre vacunación"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all"
                disabled={loading}
                maxLength={200}
              />
            </div>

            {/* Pet selector (optional) */}
            {!isStaff && pets.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Mascota (opcional)
                </label>
                <div className="relative">
                  <PawPrint className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={petId}
                    onChange={(e) => setPetId(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all appearance-none bg-white"
                    disabled={loading}
                  >
                    <option value="">Seleccionar mascota...</option>
                    {pets.map((pet) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Mensaje <span className="text-red-500">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu mensaje aquí..."
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all resize-none"
                disabled={loading}
                maxLength={2000}
              />
              <p className="mt-1 text-xs text-[var(--text-secondary)] text-right">
                {message.length}/2000
              </p>
            </div>

            {/* Error message - TICKET-A11Y-004: Added role="alert" for screen readers */}
            {error && (
              <div role="alert" aria-live="assertive" className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !subject.trim() || !message.trim() || (isStaff && !selectedClient)}
            className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Enviar Mensaje
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}
