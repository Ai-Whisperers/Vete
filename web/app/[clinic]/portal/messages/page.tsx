import { getClinicData } from '@/lib/clinics'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import {
  MessageSquare,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { getConversations } from '@/app/actions/messages'
import { AuthService } from '@/lib/auth/core'

interface Props {
  params: Promise<{ clinic: string }>
  searchParams: Promise<{ status?: string; search?: string }>
}

export async function generateStaticParams() {
  return [{ clinic: 'adris' }, { clinic: 'petlife' }]
}

export default async function MessagesPage({ params, searchParams }: Props) {
  const { clinic } = await params
  const { status, search } = await searchParams

  const clinicData = await getClinicData(clinic)
  if (!clinicData) {
    notFound()
  }

  // Fetch conversations using Server Action
  const result = await getConversations(clinic, { status, search })

  if (!result.success) {
    if (result.error === 'Authentication required') {
        redirect(`/${clinic}/portal/login`)
    }
    return (
        <div className="p-8 text-center bg-red-50 text-red-600 rounded-2xl mx-auto max-w-5xl mt-8">
            <p className="font-bold">Error al cargar mensajes</p>
            <p className="text-sm">{result.error}</p>
        </div>
    )
  }

  const conversations = result.data as any[]
  
  // Get context for isStaff check
  const authContext = await AuthService.getContext()
  const isStaff = authContext.isAuthenticated && ['vet', 'admin'].includes(authContext.profile.role)

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                Mensajes
              </h1>
              <p className="text-[var(--text-secondary)]">
                {isStaff
                  ? 'Gestiona las conversaciones con tus clientes'
                  : 'Comunícate con la clínica'
                }
              </p>
            </div>
            <Link
              href={`/${clinic}/portal/messages/new`}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Nueva Conversación</span>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-xl shadow-md p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  placeholder="Buscar por asunto o mensaje..."
                  defaultValue={search || ''}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        const target = e.target as HTMLInputElement
                        const params = new URLSearchParams(window.location.search)
                        if (target.value) {
                          params.set('search', target.value)
                        } else {
                          params.delete('search')
                        }
                        window.location.search = params.toString()
                    }
                  }}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-[var(--text-tertiary)]" />
              <select
                defaultValue={status || 'all'}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-white"
                onChange={(e) => {
                  const params = new URLSearchParams(window.location.search)
                  if (e.target.value !== 'all') {
                    params.set('status', e.target.value)
                  } else {
                    params.delete('status')
                  }
                  window.location.search = params.toString()
                }}
              >
                <option value="all">Todos los estados</option>
                <option value="open">Abierto</option>
                <option value="pending">Pendiente</option>
                <option value="closed">Cerrado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Conversations List */}
        <div className="space-y-3">
          {conversations.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <MessageSquare className="w-16 h-16 text-[var(--text-tertiary)] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                No hay conversaciones
              </h3>
              <p className="text-[var(--text-secondary)] mb-6">
                {search
                  ? 'No se encontraron conversaciones con ese criterio de búsqueda.'
                  : 'Inicia una nueva conversación para comenzar.'
                }
              </p>
              <Link
                href={`/${clinic}/portal/messages/new`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Nueva Conversación</span>
              </Link>
            </div>
          ) : (
            conversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/${clinic}/portal/messages/${conversation.id}`}
                className="block bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-5"
              >
                <div className="flex items-start gap-4">
                  {/* Unread Indicator */}
                  <div className="flex-shrink-0 mt-1">
                    {conversation.unread_count > 0 ? (
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    ) : (
                      <div className="w-3 h-3 bg-transparent rounded-full border-2 border-gray-200" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1 truncate">
                          {conversation.subject}
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {isStaff ? (
                            <span className="font-medium">{conversation.client_name}</span>
                          ) : (
                            <span className="font-medium">Clínica {clinicData.config.name}</span>
                          )}
                          {isStaff && conversation.staff_name && (
                            <span className="text-[var(--text-tertiary)]"> · Asignado a {conversation.staff_name}</span>
                          )}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div className="flex-shrink-0">
                        {conversation.status === 'open' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            Abierto
                          </span>
                        )}
                        {conversation.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                            <Clock className="w-4 h-4" />
                            Pendiente
                          </span>
                        )}
                        {conversation.status === 'closed' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                            <AlertCircle className="w-4 h-4" />
                            Cerrado
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Last Message Preview */}
                    {conversation.last_message_preview && (
                      <p className="text-[var(--text-secondary)] text-sm mb-2 line-clamp-2">
                        {conversation.last_message_preview}
                      </p>
                    )}

                    {/* Footer Row */}
                    <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {conversation.last_message_at
                            ? formatDistanceToNow(new Date(conversation.last_message_at), {
                                addSuffix: true,
                                locale: es,
                              })
                            : formatDistanceToNow(new Date(conversation.created_at), {
                                addSuffix: true,
                                locale: es,
                              })
                          }
                        </span>
                      </div>
                      {conversation.unread_count > 0 && (
                        <div className="flex items-center gap-1 text-blue-600 font-medium">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{conversation.unread_count} nuevo{conversation.unread_count > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Stats Summary */}
        {conversations.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-[var(--primary)] mb-1">
                {conversations.filter(c => c.status === 'open').length}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">Abiertos</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {conversations.filter(c => c.status === 'pending').length}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">Pendientes</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {conversations.reduce((sum, c) => sum + c.unread_count, 0)}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">Mensajes sin leer</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
