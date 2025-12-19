'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import * as Icons from 'lucide-react'
import Link from 'next/link'
import { ResultViewer } from '@/components/lab/result-viewer'
import { ResultEntry } from '@/components/lab/result-entry'

interface LabOrder {
  id: string
  order_number: string
  ordered_at: string
  status: string
  priority: string
  lab_type: string
  fasting_status: string | null
  clinical_notes?: string
  has_critical_values: boolean
  specimen_collected_at?: string
  pets: {
    id: string
    name: string
    species: string
    breed: string
    date_of_birth: string
    owner_id: string
  }
}

interface Comment {
  id: string
  comment: string
  comment_type: string
  created_at: string
}

interface Attachment {
  id: string
  file_name: string
  file_url: string
  file_type: string
  uploaded_at: string
}

const statusConfig: Record<string, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
  ordered: { label: 'Ordenado', className: 'bg-blue-100 text-blue-800', icon: Icons.FileText },
  specimen_collected: { label: 'Muestra Recolectada', className: 'bg-purple-100 text-purple-800', icon: Icons.Droplet },
  in_progress: { label: 'En Proceso', className: 'bg-yellow-100 text-yellow-800', icon: Icons.Clock },
  completed: { label: 'Completado', className: 'bg-green-100 text-green-800', icon: Icons.CheckCircle },
  cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-800', icon: Icons.XCircle }
}

export default function LabOrderDetailPage() {
  const [order, setOrder] = useState<LabOrder | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loading, setLoading] = useState(true)
  const [showResultEntry, setShowResultEntry] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [addingComment, setAddingComment] = useState(false)

  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string
  const clinic = params.clinic as string
  const supabase = createClient()

  useEffect(() => {
    fetchOrderDetails()
  }, [orderId])

  const fetchOrderDetails = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push(`/${clinic}`)
        return
      }

      // Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from('lab_orders')
        .select(`
          id,
          order_number,
          ordered_at,
          status,
          priority,
          lab_type,
          fasting_status,
          clinical_notes,
          has_critical_values,
          specimen_collected_at,
          pets!inner(id, name, species, breed, date_of_birth, owner_id)
        `)
        .eq('id', orderId)
        .single()

      if (orderError) throw orderError

      setOrder(orderData as unknown as LabOrder)

      // Fetch comments
      const { data: commentsData } = await supabase
        .from('lab_result_comments')
        .select(`
          id,
          comment,
          comment_type,
          created_at
        `)
        .eq('lab_order_id', orderId)
        .order('created_at', { ascending: false })

      setComments(commentsData as Comment[] || [])

      // Fetch attachments
      const { data: attachmentsData } = await supabase
        .from('lab_result_attachments')
        .select('id, file_name, file_url, file_type, uploaded_at')
        .eq('order_id', orderId)
        .order('uploaded_at', { ascending: false })

      setAttachments(attachmentsData || [])

    } catch (error) {
      console.error('Error fetching order details:', error)
      alert('Error al cargar la orden')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/lab-orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) throw new Error('Error al actualizar estado')

      await fetchOrderDetails()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error al actualizar el estado')
    }
  }

  const addComment = async () => {
    if (!newComment.trim()) return

    setAddingComment(true)
    try {
      const response = await fetch(`/api/lab-orders/${orderId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: newComment })
      })

      if (!response.ok) throw new Error('Error al agregar comentario')

      setNewComment('')
      await fetchOrderDetails()
    } catch (error) {
      console.error('Error adding comment:', error)
      alert('Error al agregar comentario')
    } finally {
      setAddingComment(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icons.Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-[var(--text-secondary)]">Orden no encontrada</p>
          <Link href={`/${clinic}/dashboard/lab`} className="text-[var(--primary)] hover:underline mt-4 inline-block">
            Volver a órdenes
          </Link>
        </div>
      </div>
    )
  }

  const status = statusConfig[order.status] || statusConfig.ordered
  const StatusIcon = status.icon
  const age = Math.floor((new Date().getTime() - new Date(order.pets.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365))

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/${clinic}/dashboard/lab`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icons.ArrowLeft className="w-6 h-6 text-[var(--text-primary)]" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              Orden #{order.order_number}
            </h1>
            <p className="text-[var(--text-secondary)]">
              {new Date(order.ordered_at).toLocaleDateString('es-PY', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-[var(--text-primary)] rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            <Icons.Printer className="w-4 h-4" />
            Imprimir
          </button>
          {order.status !== 'completed' && order.status !== 'cancelled' && (
            <button
              onClick={() => setShowResultEntry(!showResultEntry)}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              <Icons.Edit className="w-4 h-4" />
              {showResultEntry ? 'Ver Resultados' : 'Ingresar Resultados'}
            </button>
          )}
        </div>
      </div>

      {/* Order Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Pet Info */}
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Información del Paciente
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Icons.PawPrint className="w-5 h-5 text-[var(--primary)]" />
                <div>
                  <div className="text-sm text-[var(--text-secondary)]">Mascota</div>
                  <div className="font-medium text-[var(--text-primary)]">{order.pets.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Icons.Info className="w-5 h-5 text-[var(--primary)]" />
                <div>
                  <div className="text-sm text-[var(--text-secondary)]">Especie / Raza</div>
                  <div className="font-medium text-[var(--text-primary)] capitalize">
                    {order.pets.species} - {order.pets.breed}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Icons.Calendar className="w-5 h-5 text-[var(--primary)]" />
                <div>
                  <div className="text-sm text-[var(--text-secondary)]">Edad</div>
                  <div className="font-medium text-[var(--text-primary)]">
                    {age} {age === 1 ? 'año' : 'años'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Info */}
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Información de la Orden
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <StatusIcon className="w-5 h-5 text-[var(--primary)]" />
                <div>
                  <div className="text-sm text-[var(--text-secondary)]">Estado</div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${status.className}`}>
                    {status.label}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Icons.Clock className="w-5 h-5 text-[var(--primary)]" />
                <div>
                  <div className="text-sm text-[var(--text-secondary)]">Fecha de orden</div>
                  <div className="font-medium text-[var(--text-primary)]">
                    {new Date(order.ordered_at).toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Icons.Flag className="w-5 h-5 text-[var(--primary)]" />
                <div>
                  <div className="text-sm text-[var(--text-secondary)]">Prioridad / Tipo</div>
                  <div className="font-medium text-[var(--text-primary)] capitalize">
                    {order.priority} - {order.lab_type === 'in_house' ? 'Interno' : 'Externo'}
                  </div>
                </div>
              </div>
              {order.fasting_status && (
                <div className="flex items-center gap-3">
                  <Icons.Coffee className="w-5 h-5 text-[var(--primary)]" />
                  <div>
                    <div className="text-sm text-[var(--text-secondary)]">Ayuno</div>
                    <div className="font-medium text-[var(--text-primary)]">Sí</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Clinical Notes */}
        {order.clinical_notes && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Notas Clínicas</h3>
            <p className="text-[var(--text-secondary)]">{order.clinical_notes}</p>
          </div>
        )}

        {/* Critical Values Alert */}
        {order.has_critical_values && (
          <div className="mt-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <Icons.AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900">Valores Críticos Detectados</h4>
              <p className="text-sm text-red-700">Esta orden contiene valores que requieren atención inmediata.</p>
            </div>
          </div>
        )}
      </div>

      {/* Status Workflow */}
      {order.status !== 'cancelled' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Flujo de Trabajo
          </h2>
          <div className="flex items-center justify-between">
            {['ordered', 'specimen_collected', 'in_progress', 'completed'].map((statusKey, idx) => {
              const isActive = order.status === statusKey
              const isPast = ['ordered', 'specimen_collected', 'in_progress', 'completed'].indexOf(order.status) > idx
              const statusInfo = statusConfig[statusKey]

              return (
                <div key={statusKey} className="flex items-center flex-1">
                  <button
                    onClick={() => updateStatus(statusKey)}
                    disabled={isPast}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-all ${
                      isActive ? 'bg-[var(--primary)]/10 border-2 border-[var(--primary)]' :
                      isPast ? 'opacity-50 cursor-not-allowed' :
                      'hover:bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    {React.createElement(statusInfo.icon, { className: `w-6 h-6 ${isActive || isPast ? 'text-[var(--primary)]' : 'text-gray-400'}` })}
                    <span className={`text-sm font-medium ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}>
                      {statusInfo.label}
                    </span>
                  </button>
                  {idx < 3 && (
                    <div className={`flex-1 h-0.5 ${isPast ? 'bg-[var(--primary)]' : 'bg-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Results Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          {showResultEntry ? 'Ingresar Resultados' : 'Resultados'}
        </h2>
        {showResultEntry ? (
          <ResultEntry
            orderId={orderId}
            onSuccess={() => {
              setShowResultEntry(false)
              fetchOrderDetails()
              updateStatus('completed')
            }}
            onCancel={() => setShowResultEntry(false)}
          />
        ) : (
          <ResultViewer
            orderId={orderId}
            petId={order.pets.id}
            showHistory={true}
            onDownloadPdf={handlePrint}
          />
        )}
      </div>

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Archivos Adjuntos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attachments.map(attachment => (
              <a
                key={attachment.id}
                href={attachment.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-[var(--primary)] transition-colors"
              >
                <Icons.FileText className="w-6 h-6 text-[var(--primary)]" />
                <div className="flex-1">
                  <div className="font-medium text-[var(--text-primary)]">{attachment.file_name}</div>
                  <div className="text-sm text-[var(--text-secondary)]">
                    {new Date(attachment.uploaded_at).toLocaleDateString('es-PY')}
                  </div>
                </div>
                <Icons.ExternalLink className="w-5 h-5 text-[var(--text-secondary)]" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Comments & Interpretation */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          Comentarios e Interpretación
        </h2>

        {/* Add Comment */}
        <div className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Agregar interpretación o comentario..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none"
          />
          <button
            onClick={addComment}
            disabled={addingComment || !newComment.trim()}
            className="mt-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {addingComment ? 'Agregando...' : 'Agregar Comentario'}
          </button>
        </div>

        {/* Comments List */}
        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <span className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded capitalize">
                    {comment.comment_type || 'Nota'}
                  </span>
                  <span className="text-sm text-[var(--text-secondary)]">
                    {new Date(comment.created_at).toLocaleDateString('es-PY')}
                  </span>
                </div>
                <p className="text-[var(--text-secondary)]">{comment.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-[var(--text-secondary)] py-6">
            No hay comentarios aún
          </p>
        )}
      </div>
    </div>
  )
}
