import { getClinicData } from '@/lib/clinics'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  PawPrint,
  FileText,
  DollarSign,
  MessageSquare,
  Plus,
  ArrowLeft,
  Clock,
  Send,
  StickyNote,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'

interface Props {
  params: Promise<{ clinic: string; id: string }>
}

export default async function ClientDetailPage({ params }: Props) {
  const { clinic, id } = await params
  const clinicData = await getClinicData(clinic)
  if (!clinicData) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${clinic}/portal/login`)

  // Check staff role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    redirect(`/${clinic}/portal/dashboard`)
  }

  // Fetch client data
  const { data: client } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', profile.tenant_id)
    .single()

  if (!client) notFound()

  // Fetch client's pets
  const { data: pets } = await supabase
    .from('pets')
    .select('id, name, species, breed, date_of_birth, photo_url, sex, neutered')
    .eq('owner_id', id)
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: false })

  // Fetch recent appointments
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      id,
      appointment_date,
      status,
      notes,
      service_id,
      pet_id,
      pets(name)
    `)
    .eq('clinic_slug', clinic)
    .in('pet_id', (pets || []).map(p => p.id))
    .order('appointment_date', { ascending: false })
    .limit(10)

  // Fetch invoices with outstanding balance
  const { data: invoices } = await supabase
    .from('invoices')
    .select(`
      id,
      invoice_number,
      total_amount,
      paid_amount,
      status,
      issue_date,
      due_date,
      pet_id,
      pets(name)
    `)
    .eq('tenant_id', profile.tenant_id)
    .in('pet_id', (pets || []).map(p => p.id))
    .order('issue_date', { ascending: false })
    .limit(10)

  // Calculate total outstanding balance
  const outstandingBalance = (invoices || [])
    .filter(inv => inv.status !== 'paid')
    .reduce((sum, inv) => sum + (inv.total_amount - (inv.paid_amount || 0)), 0)

  // Fetch communication history from notification_log
  const { data: communications } = await supabase
    .from('notification_log')
    .select('id, channel, message, status, sent_at, error_message')
    .eq('user_id', id)
    .order('sent_at', { ascending: false })
    .limit(10)

  // Fetch internal notes (we'll use medical_records with type 'note' for now)
  const { data: notes } = await supabase
    .from('medical_records')
    .select('id, notes, created_at, created_by')
    .eq('tenant_id', profile.tenant_id)
    .in('pet_id', (pets || []).map(p => p.id))
    .eq('record_type', 'note')
    .order('created_at', { ascending: false })
    .limit(5)

  // Format date helper
  const formatDate = (date: string | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('es-PY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateTime = (date: string | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleString('es-PY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Calculate age helper
  const calculateAge = (dob: string | null) => {
    if (!dob) return 'Desconocido'
    const birth = new Date(dob)
    const today = new Date()
    const years = today.getFullYear() - birth.getFullYear()
    const months = today.getMonth() - birth.getMonth()

    if (years === 0) {
      return `${months} ${months === 1 ? 'mes' : 'meses'}`
    }
    return `${years} ${years === 1 ? 'año' : 'años'}`
  }

  // Status badge helper
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
      confirmed: { label: 'Confirmada', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
      cancelled: { label: 'Cancelada', className: 'bg-red-100 text-red-800', icon: XCircle },
      completed: { label: 'Completada', className: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      paid: { label: 'Pagada', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      partial: { label: 'Parcial', className: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      unpaid: { label: 'Pendiente', className: 'bg-red-100 text-red-800', icon: XCircle },
      sent: { label: 'Enviado', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { label: 'Fallido', className: 'bg-red-100 text-red-800', icon: XCircle },
      delivered: { label: 'Entregado', className: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    }

    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800', icon: AlertCircle }
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-subtle)] py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/${clinic}/dashboard/clients`}
            className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Clientes
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                {client.full_name || 'Sin nombre'}
              </h1>
              <p className="text-sm text-[var(--text-secondary)]">
                Cliente desde {formatDate(client.created_at)}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/${clinic}/dashboard/appointments/new?client=${id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Nueva Cita
              </Link>
              <Link
                href={`/${clinic}/dashboard/invoices?client=${id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-subtle)] transition-colors text-sm font-medium shadow-sm"
              >
                <FileText className="w-4 h-4" />
                Ver Facturas
              </Link>
              <button
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-subtle)] transition-colors text-sm font-medium shadow-sm"
              >
                <Send className="w-4 h-4" />
                Enviar Mensaje
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Client Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border border-[var(--border-color)] p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-[var(--primary)]" />
                Información de Contacto
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[var(--text-secondary)] mt-0.5" />
                  <div>
                    <p className="text-xs text-[var(--text-secondary)] mb-1">Email</p>
                    <p className="text-sm text-[var(--text-primary)] font-medium">
                      {client.email || 'No registrado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[var(--text-secondary)] mt-0.5" />
                  <div>
                    <p className="text-xs text-[var(--text-secondary)] mb-1">Teléfono</p>
                    <p className="text-sm text-[var(--text-primary)] font-medium">
                      {client.phone || 'No registrado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[var(--text-secondary)] mt-0.5" />
                  <div>
                    <p className="text-xs text-[var(--text-secondary)] mb-1">Dirección</p>
                    <p className="text-sm text-[var(--text-primary)] font-medium">
                      {client.address || 'No registrada'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[var(--text-secondary)] mt-0.5" />
                  <div>
                    <p className="text-xs text-[var(--text-secondary)] mb-1">Fecha de Registro</p>
                    <p className="text-sm text-[var(--text-primary)] font-medium">
                      {formatDate(client.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-[var(--border-color)] p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[var(--primary)]" />
                Resumen Financiero
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-[var(--bg-subtle)] rounded-lg">
                  <span className="text-sm text-[var(--text-secondary)]">Saldo Pendiente</span>
                  <span className={`text-lg font-bold ${outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {outstandingBalance.toLocaleString('es-PY')} Gs.
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-[var(--bg-subtle)] rounded-lg">
                  <span className="text-sm text-[var(--text-secondary)]">Total Facturas</span>
                  <span className="text-lg font-bold text-[var(--text-primary)]">
                    {invoices?.length || 0}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-[var(--bg-subtle)] rounded-lg">
                  <span className="text-sm text-[var(--text-secondary)]">Mascotas Registradas</span>
                  <span className="text-lg font-bold text-[var(--text-primary)]">
                    {pets?.length || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Internal Notes */}
            <div className="bg-white rounded-xl shadow-sm border border-[var(--border-color)] p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-[var(--primary)]" />
                Notas Internas
              </h2>

              {notes && notes.length > 0 ? (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div key={note.id} className="p-3 bg-[var(--bg-subtle)] rounded-lg border-l-4 border-[var(--primary)]">
                      <p className="text-sm text-[var(--text-primary)] mb-2">{note.notes}</p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {formatDateTime(note.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--text-secondary)] text-center py-4">
                  No hay notas registradas
                </p>
              )}

              <button className="w-full mt-4 px-4 py-2 bg-[var(--bg-subtle)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--border-color)] transition-colors text-sm font-medium">
                Agregar Nota
              </button>
            </div>
          </div>

          {/* Right Column - Pets, Appointments, etc. */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pets Section */}
            <div className="bg-white rounded-xl shadow-sm border border-[var(--border-color)] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <PawPrint className="w-5 h-5 text-[var(--primary)]" />
                  Mascotas ({pets?.length || 0})
                </h2>
                <Link
                  href={`/${clinic}/dashboard/pets/new?owner=${id}`}
                  className="text-sm text-[var(--primary)] hover:underline font-medium"
                >
                  + Agregar Mascota
                </Link>
              </div>

              {pets && pets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pets.map((pet) => (
                    <Link
                      key={pet.id}
                      href={`/${clinic}/dashboard/pets/${pet.id}`}
                      className="flex items-center gap-4 p-4 bg-[var(--bg-subtle)] rounded-lg hover:shadow-md transition-shadow border border-transparent hover:border-[var(--primary)]"
                    >
                      {pet.photo_url ? (
                        <img
                          src={pet.photo_url}
                          alt={pet.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-[var(--primary)] bg-opacity-10 flex items-center justify-center">
                          <PawPrint className="w-8 h-8 text-[var(--primary)]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[var(--text-primary)] truncate">
                          {pet.name}
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] truncate">
                          {pet.species} {pet.breed && `• ${pet.breed}`}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                          {calculateAge(pet.date_of_birth)} • {pet.sex === 'male' ? 'Macho' : 'Hembra'}
                          {pet.neutered && ' • Esterilizado'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <PawPrint className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-[var(--text-secondary)]">
                    No hay mascotas registradas
                  </p>
                </div>
              )}
            </div>

            {/* Recent Appointments */}
            <div className="bg-white rounded-xl shadow-sm border border-[var(--border-color)] p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[var(--primary)]" />
                Historial de Citas
              </h2>

              {appointments && appointments.length > 0 ? (
                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-4 bg-[var(--bg-subtle)] rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-[var(--text-primary)]">
                            {formatDateTime(apt.appointment_date)}
                          </p>
                          {getStatusBadge(apt.status)}
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]">
                          Mascota: {(apt.pets as any)?.name || 'N/A'}
                        </p>
                        {apt.notes && (
                          <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-1">
                            {apt.notes}
                          </p>
                        )}
                      </div>
                      <Link
                        href={`/${clinic}/dashboard/appointments/${apt.id}`}
                        className="text-sm text-[var(--primary)] hover:underline font-medium ml-4"
                      >
                        Ver detalles
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-[var(--text-secondary)]">
                    No hay citas registradas
                  </p>
                </div>
              )}
            </div>

            {/* Invoice History */}
            <div className="bg-white rounded-xl shadow-sm border border-[var(--border-color)] p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[var(--primary)]" />
                Historial de Facturas
              </h2>

              {invoices && invoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border-color)]">
                        <th className="text-left py-3 px-2 text-xs font-semibold text-[var(--text-secondary)] uppercase">
                          Nº Factura
                        </th>
                        <th className="text-left py-3 px-2 text-xs font-semibold text-[var(--text-secondary)] uppercase">
                          Fecha
                        </th>
                        <th className="text-left py-3 px-2 text-xs font-semibold text-[var(--text-secondary)] uppercase">
                          Mascota
                        </th>
                        <th className="text-right py-3 px-2 text-xs font-semibold text-[var(--text-secondary)] uppercase">
                          Monto
                        </th>
                        <th className="text-center py-3 px-2 text-xs font-semibold text-[var(--text-secondary)] uppercase">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-subtle)] transition-colors">
                          <td className="py-3 px-2 text-sm font-medium text-[var(--text-primary)]">
                            {invoice.invoice_number}
                          </td>
                          <td className="py-3 px-2 text-sm text-[var(--text-secondary)]">
                            {formatDate(invoice.issue_date)}
                          </td>
                          <td className="py-3 px-2 text-sm text-[var(--text-secondary)]">
                            {(invoice.pets as any)?.name || 'N/A'}
                          </td>
                          <td className="py-3 px-2 text-sm text-right font-medium text-[var(--text-primary)]">
                            {invoice.total_amount.toLocaleString('es-PY')} Gs.
                          </td>
                          <td className="py-3 px-2 text-center">
                            {getStatusBadge(invoice.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-[var(--text-secondary)]">
                    No hay facturas registradas
                  </p>
                </div>
              )}
            </div>

            {/* Communication History */}
            <div className="bg-white rounded-xl shadow-sm border border-[var(--border-color)] p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[var(--primary)]" />
                Historial de Comunicaciones
              </h2>

              {communications && communications.length > 0 ? (
                <div className="space-y-3">
                  {communications.map((comm) => (
                    <div
                      key={comm.id}
                      className="flex items-start gap-3 p-4 bg-[var(--bg-subtle)] rounded-lg"
                    >
                      <div className={`p-2 rounded-full ${
                        comm.channel === 'email' ? 'bg-blue-100' :
                        comm.channel === 'sms' ? 'bg-green-100' :
                        comm.channel === 'whatsapp' ? 'bg-green-100' :
                        'bg-gray-100'
                      }`}>
                        {comm.channel === 'email' ? (
                          <Mail className="w-4 h-4 text-blue-600" />
                        ) : comm.channel === 'sms' || comm.channel === 'whatsapp' ? (
                          <MessageSquare className="w-4 h-4 text-green-600" />
                        ) : (
                          <Send className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-[var(--text-primary)] uppercase">
                            {comm.channel}
                          </span>
                          {getStatusBadge(comm.status)}
                        </div>
                        <p className="text-sm text-[var(--text-primary)] line-clamp-2 mb-1">
                          {comm.message}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {formatDateTime(comm.sent_at)}
                        </p>
                        {comm.error_message && (
                          <p className="text-xs text-red-600 mt-1">
                            Error: {comm.error_message}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-[var(--text-secondary)]">
                    No hay comunicaciones registradas
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
