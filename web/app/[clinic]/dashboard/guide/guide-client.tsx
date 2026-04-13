'use client'

import { useState } from 'react'
import {
  BookOpen,
  Settings,
  Users,
  Calendar,
  Package,
  FileText,
  Syringe,
  MessageSquare,
  BarChart3,
  CreditCard,
  ChevronDown,
  CheckCircle2,
  Circle,
  Clock,
  Shield,
  Palette,
  ToggleRight,
  UserPlus,
  CalendarClock,
  Dog,
  ClipboardList,
  DollarSign,
  Truck,
  Bell,
  Gift,
  Keyboard,
  HelpCircle,
  Lightbulb,
} from 'lucide-react'

interface GuideSection {
  id: string
  title: string
  icon: React.ElementType
  content: React.ReactNode
}

export function GuideClient({ clinic, clinicName }: { clinic: string; clinicName: string }) {
  const [activeSection, setActiveSection] = useState('welcome')
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  const toggleStep = (step: string) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev)
      if (next.has(step)) next.delete(step)
      else next.add(step)
      return next
    })
  }

  const sections: GuideSection[] = [
    {
      id: 'welcome',
      title: 'Bienvenido',
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <div className="rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/70 p-6 text-white">
            <h2 className="text-2xl font-bold">Bienvenido a CavillPet</h2>
            <p className="mt-2 text-white/90">
              Tu plataforma de gestión integral para <strong>{clinicName}</strong>. Esta guía te ayudará
              a configurar y usar todas las funcionalidades paso a paso.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <QuickCard icon={Settings} title="Configuración" description="Personaliza datos, marca y módulos" href="#config" />
            <QuickCard icon={UserPlus} title="Equipo" description="Invita veterinarios y admins" href="#team" />
            <QuickCard icon={Dog} title="Clientes" description="Registra propietarios y mascotas" href="#clients" />
            <QuickCard icon={Calendar} title="Citas" description="Agenda y gestiona consultas" href="#appointments" />
            <QuickCard icon={DollarSign} title="Servicios" description="Configura precios y catálogo" href="#services" />
            <QuickCard icon={Package} title="Inventario" description="Productos, stock y proveedores" href="#inventory" />
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
              <div>
                <p className="font-medium text-amber-800">Tip: Atajos de teclado</p>
                <p className="mt-1 text-sm text-amber-700">
                  Presiona <kbd className="rounded border border-amber-300 bg-white px-1.5 py-0.5 text-xs font-mono">Ctrl+K</kbd> para
                  búsqueda global, <kbd className="rounded border border-amber-300 bg-white px-1.5 py-0.5 text-xs font-mono">Ctrl+N</kbd> para
                  nueva cita rápida, y <kbd className="rounded border border-amber-300 bg-white px-1.5 py-0.5 text-xs font-mono">?</kbd> para
                  ver todos los atajos.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'config',
      title: 'Configuración Inicial',
      icon: Settings,
      content: (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Configuración Inicial</h2>
          <p className="text-[var(--text-secondary)]">Completa estos pasos para personalizar tu clínica.</p>

          <SetupCard
            step="config-general"
            title="1. Datos Generales"
            route={`/${clinic}/dashboard/settings/general`}
            routeLabel="Ir a General"
            completed={completedSteps.has('config-general')}
            onToggle={() => toggleStep('config-general')}
          >
            <p>Configura el nombre, eslogan, teléfono, email, dirección y horarios de atención.</p>
          </SetupCard>

          <SetupCard
            step="config-branding"
            title="2. Marca y Colores"
            route={`/${clinic}/dashboard/settings/branding`}
            routeLabel="Ir a Marca"
            completed={completedSteps.has('config-branding')}
            onToggle={() => toggleStep('config-branding')}
          >
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Sube el logo de tu clínica (PNG, 200x200px mínimo)</li>
              <li>Elige entre 6 presets de color o personaliza</li>
              <li>Sube una imagen hero para tu sitio público</li>
            </ul>
          </SetupCard>

          <SetupCard
            step="config-modules"
            title="3. Activar Módulos"
            route={`/${clinic}/dashboard/settings/modules`}
            routeLabel="Ir a Módulos"
            completed={completedSteps.has('config-modules')}
            onToggle={() => toggleStep('config-modules')}
          >
            <p>Activa solo lo que necesitas:</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <ModuleBadge icon={Syringe} label="Seguimiento de Vacunas" />
              <ModuleBadge icon={Package} label="Tienda Online" />
              <ModuleBadge icon={Calendar} label="Reservas Online" />
              <ModuleBadge icon={MessageSquare} label="WhatsApp Business" />
              <ModuleBadge icon={Shield} label="Código QR" />
              <ModuleBadge icon={Gift} label="Programa de Referidos" />
            </div>
          </SetupCard>

          <SetupCard
            step="config-payments"
            title="4. Pasarelas de Pago"
            route={`/${clinic}/dashboard/admin/payment-gateways`}
            routeLabel="Ir a Pasarelas"
            completed={completedSteps.has('config-payments')}
            onToggle={() => toggleStep('config-payments')}
          >
            <p>Configura los métodos de pago: Stripe, Bancard, Tigo Money, etc. Ingresa las credenciales API y prueba en modo sandbox antes de producir.</p>
          </SetupCard>
        </div>
      ),
    },
    {
      id: 'team',
      title: 'Gestión de Equipo',
      icon: Users,
      content: (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Gestión de Equipo</h2>

          <SetupCard
            step="team-invite"
            title="Invitar Miembros"
            route={`/${clinic}/dashboard/team`}
            routeLabel="Ir a Equipo"
            completed={completedSteps.has('team-invite')}
            onToggle={() => toggleStep('team-invite')}
          >
            <div className="space-y-3">
              <p>Agrega veterinarios y administradores:</p>
              <ol className="list-decimal pl-5 space-y-1 text-sm">
                <li>Clic en &quot;Invitar Miembro&quot;</li>
                <li>Completa nombre, email y rol</li>
                <li>El invitado recibe un email para crear su cuenta</li>
              </ol>
              <div className="rounded-lg border border-[var(--border-light)] p-3">
                <p className="text-xs font-bold uppercase text-[var(--text-muted)]">Roles disponibles</p>
                <div className="mt-2 space-y-1 text-sm">
                  <p><strong>Veterinario</strong> — Agenda, pacientes, historial médico, facturación</p>
                  <p><strong>Administrador</strong> — Todo lo anterior + configuración, equipo, auditoría</p>
                </div>
              </div>
            </div>
          </SetupCard>

          <SetupCard
            step="team-schedule"
            title="Configurar Horarios"
            route={`/${clinic}/dashboard/schedules`}
            routeLabel="Ir a Horarios"
            completed={completedSteps.has('team-schedule')}
            onToggle={() => toggleStep('team-schedule')}
          >
            <p>Define los horarios de trabajo de cada miembro. Los horarios se reflejan en el calendario de citas y determinan la disponibilidad para reservas online.</p>
          </SetupCard>

          <SetupCard
            step="team-timeoff"
            title="Gestión de Ausencias"
            route={`/${clinic}/dashboard/time-off`}
            routeLabel="Ir a Ausencias"
            completed={completedSteps.has('team-timeoff')}
            onToggle={() => toggleStep('team-timeoff')}
          >
            <p>Los veterinarios solicitan ausencias (vacaciones, enfermedad). Los administradores aprueban o rechazan desde esta página.</p>
          </SetupCard>
        </div>
      ),
    },
    {
      id: 'clients',
      title: 'Clientes y Mascotas',
      icon: Dog,
      content: (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Clientes y Mascotas</h2>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <h3 className="font-medium text-blue-800">Agregar un Nuevo Cliente</h3>
            <div className="mt-2 space-y-2 text-sm text-blue-700">
              <p><strong>Ruta:</strong> Clientes → Directorio → Invitar Cliente</p>
              <p>Completa: Nombre, Email, Teléfono. El cliente recibe un email para crear su cuenta.</p>
              <p><strong>Alternativa:</strong> El cliente se registra directamente en tu sitio: <code className="rounded bg-blue-100 px-1">/{clinic}/portal/signup</code></p>
            </div>
          </div>

          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <h3 className="font-medium text-green-800">Registrar una Mascota</h3>
            <div className="mt-2 text-sm text-green-700">
              <p><strong>Ruta:</strong> Clientes → Directorio → [Cliente] → Agregar Mascota</p>
              <p className="mt-1">Datos mínimos: <strong>Nombre, Especie, Raza</strong></p>
              <p className="mt-1">Datos completos: Fecha de nacimiento, sexo, peso, color, microchip, castrado, alergias, condiciones crónicas, foto</p>
            </div>
          </div>

          <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
            <h3 className="font-medium text-purple-800">Perfil del Paciente</h3>
            <p className="mt-1 text-sm text-purple-700">
              <strong>Ruta:</strong> Agenda → Pacientes → [Mascota]
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 text-sm">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-500" /> Datos generales con foto</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-500" /> Alertas de alergias</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-500" /> Timeline médico</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-500" /> Documentos adjuntos</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-500" /> Recetas médicas</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-purple-500" /> Historial de vacunas</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'appointments',
      title: 'Gestión de Citas',
      icon: Calendar,
      content: (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Gestión de Citas</h2>

          <h3 className="font-semibold">Crear una Cita</h3>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-[var(--text-secondary)]">
            <li>Ve a <strong>Agenda → Citas Hoy → Nueva Cita</strong> (o <kbd className="rounded border px-1 py-0.5 text-xs font-mono">Ctrl+N</kbd>)</li>
            <li><strong>Selecciona Cliente</strong> — busca por nombre o email</li>
            <li><strong>Selecciona Mascota</strong> — se filtran las del cliente</li>
            <li><strong>Selecciona Veterinario</strong> — solo los disponibles</li>
            <li><strong>Selecciona Servicio</strong> — del catálogo configurado</li>
            <li><strong>Fecha y Hora</strong> — elige slot disponible</li>
            <li><strong>Motivo</strong> — Consulta, Vacunación, Control, Cirugía, etc.</li>
            <li>Clic en <strong>Crear Cita</strong></li>
          </ol>

          <h3 className="font-semibold">Flujo de Estados</h3>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <StatusBadge label="Programada" color="blue" />
            <span>→</span>
            <StatusBadge label="Confirmada" color="green" />
            <span>→</span>
            <StatusBadge label="En Espera" color="yellow" />
            <span>→</span>
            <StatusBadge label="En Consulta" color="purple" />
            <span>→</span>
            <StatusBadge label="Completada" color="green" />
          </div>

          <h3 className="font-semibold mt-4">Vista del Calendario</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-[var(--text-secondary)]">
            <li>Cambia entre vistas: Día, Semana, Mes, Agenda</li>
            <li>Arrastra y suelta citas para reprogramar</li>
            <li>Los colores indican el veterinario asignado</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'services',
      title: 'Servicios y Precios',
      icon: DollarSign,
      content: (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Catálogo de Servicios y Precios</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            <strong>Ruta:</strong> Administración → Ajustes → Servicios/Precios
          </p>

          <h3 className="font-semibold">Para cada servicio configura:</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoItem icon={ClipboardList} label="Nombre" value="Ej: Consulta General" />
            <InfoItem icon={ToggleRight} label="Categoría" value="Consulta, Vacuna, Cirugía..." />
            <InfoItem icon={DollarSign} label="Precio base" value="Monto en guaraníes" />
            <InfoItem icon={Clock} label="Duración" value="En minutos" />
          </div>

          <h3 className="font-semibold">Precios por Tamaño</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Cada servicio puede tener precios diferentes según el tamaño de la mascota:
          </p>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-sm border border-[var(--border-light)] rounded-lg">
              <thead>
                <tr className="bg-[var(--bg-subtle)]">
                  <th className="px-3 py-2 text-left">Tamaño</th>
                  <th className="px-3 py-2 text-left">Peso</th>
                  <th className="px-3 py-2 text-left">Ejemplo Precio</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t"><td className="px-3 py-2">Pequeño</td><td className="px-3 py-2">Hasta 10kg</td><td className="px-3 py-2">GS 60.000</td></tr>
                <tr className="border-t"><td className="px-3 py-2">Mediano</td><td className="px-3 py-2">10-25kg</td><td className="px-3 py-2">GS 80.000</td></tr>
                <tr className="border-t"><td className="px-3 py-2">Grande</td><td className="px-3 py-2">25-40kg</td><td className="px-3 py-2">GS 100.000</td></tr>
                <tr className="border-t"><td className="px-3 py-2">Gigante</td><td className="px-3 py-2">40kg+</td><td className="px-3 py-2">GS 120.000</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
    {
      id: 'inventory',
      title: 'Inventario',
      icon: Package,
      content: (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Inventario y Productos</h2>
          <p className="text-sm text-[var(--text-secondary)]"><strong>Ruta:</strong> Finanzas → Inventario</p>

          <SetupCard
            step="inv-products"
            title="Agregar Productos"
            route={`/${clinic}/dashboard/inventory`}
            routeLabel="Ir a Inventario"
            completed={completedSteps.has('inv-products')}
            onToggle={() => toggleStep('inv-products')}
          >
            <p>Para cada producto: Nombre, SKU, Categoría, Precio de costo, Precio de venta, Stock actual, Stock mínimo, Proveedor, Foto.</p>
          </SetupCard>

          <SetupCard
            step="inv-suppliers"
            title="Registrar Proveedores"
            route={`/${clinic}/dashboard/inventory/suppliers`}
            routeLabel="Ir a Proveedores"
            completed={completedSteps.has('inv-suppliers')}
            onToggle={() => toggleStep('inv-suppliers')}
          >
            <p>Para cada proveedor: Nombre/Razón social, RUC, Contacto, Tipo (productos/servicios), Términos de pago, Tiempo de entrega.</p>
          </SetupCard>

          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <h3 className="font-medium text-orange-800">
              <Truck className="mr-1 inline h-4 w-4" /> Importar desde Google Sheets
            </h3>
            <ol className="mt-2 list-decimal pl-5 space-y-1 text-sm text-orange-700">
              <li>Descarga la plantilla desde Inventario</li>
              <li>Llena los datos en Google Sheets</li>
              <li>Sube el archivo completado</li>
              <li>Los productos se importan automáticamente</li>
            </ol>
          </div>

          <h3 className="font-semibold">Alertas de Stock Bajo</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Configura umbrales en <strong>Ajustes → Alertas Inventario</strong>. Cuando un producto
            cae por debajo del mínimo, recibirás una alerta y aparecerá en &quot;Sugerencias de Reorder&quot;.
          </p>
        </div>
      ),
    },
    {
      id: 'invoicing',
      title: 'Facturación',
      icon: FileText,
      content: (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Facturación y Pagos</h2>

          <h3 className="font-semibold">Crear una Factura</h3>
          <ol className="list-decimal pl-5 space-y-1 text-sm text-[var(--text-secondary)]">
            <li>Ve a <strong>Finanzas → Facturas → Nueva Factura</strong></li>
            <li>Selecciona el cliente</li>
            <li>Agrega ítems: servicios prestados, productos vendidos, medicamentos</li>
            <li>Cada ítem tiene: descripción, cantidad, precio unitario</li>
            <li>Aplica descuento si es necesario</li>
            <li>Clic en <strong>Crear Factura</strong></li>
          </ol>

          <h3 className="font-semibold mt-4">Registrar un Pago</h3>
          <ol className="list-decimal pl-5 space-y-1 text-sm text-[var(--text-secondary)]">
            <li>Abre la factura</li>
            <li>Clic en <strong>Registrar Pago</strong></li>
            <li>Selecciona método: Efectivo, Tarjeta, Transferencia, QR</li>
            <li>Ingresa el monto</li>
          </ol>

          <h3 className="font-semibold mt-4">Estados de Factura</h3>
          <div className="flex flex-wrap gap-2 text-sm">
            <StatusBadge label="Pendiente" color="yellow" />
            <StatusBadge label="Pagada" color="green" />
            <StatusBadge label="Parcial" color="blue" />
            <StatusBadge label="Vencida" color="red" />
            <StatusBadge label="Anulada" color="gray" />
          </div>
        </div>
      ),
    },
    {
      id: 'vaccines',
      title: 'Vacunas',
      icon: Syringe,
      content: (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Vacunas y Control Sanitario</h2>
          <p className="text-sm text-[var(--text-secondary)]"><strong>Ruta:</strong> Agenda → Vacunas</p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-xs font-bold text-red-600">VENCIDAS</p>
              <p className="text-sm text-red-700">Requieren atención inmediata</p>
            </div>
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
              <p className="text-xs font-bold text-yellow-600">PRÓXIMAS (30 días)</p>
              <p className="text-sm text-yellow-700">Programar pronto</p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <p className="text-xs font-bold text-green-600">AL DÍA</p>
              <p className="text-sm text-green-700">Vacunas vigentes</p>
            </div>
          </div>

          <h3 className="font-semibold">Registrar una Vacuna</h3>
          <ol className="list-decimal pl-5 space-y-1 text-sm text-[var(--text-secondary)]">
            <li>Ve al perfil del paciente → pestaña Vacunas</li>
            <li>Clic en Nueva Vacuna</li>
            <li>Completa: Tipo, Fecha, Próxima dosis, Lote, Veterinario</li>
          </ol>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-700">
              <Bell className="mr-1 inline h-4 w-4" /> El sistema envía recordatorios automáticos a los clientes cuando una vacuna está próxima a vencer (7 días antes) o ya vencida.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'communication',
      title: 'Comunicación',
      icon: MessageSquare,
      content: (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Comunicación con Clientes</h2>

          <h3 className="font-semibold">WhatsApp Business</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            <strong>Ruta:</strong> Clientes → Mensajes (requiere módulo activo)
          </p>
          <ul className="mt-1 list-disc pl-5 text-sm text-[var(--text-secondary)]">
            <li>Bandeja de entrada con todas las conversaciones</li>
            <li>Respuestas rápidas para mensajes frecuentes</li>
            <li>Plantillas para recordatorios y confirmaciones</li>
          </ul>

          <h3 className="font-semibold mt-4">Mensajes Internos</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            <strong>Ruta:</strong> Portal → Mensajes — Mensajería entre equipo y clientes con adjuntos.
          </p>

          <h3 className="font-semibold mt-4">Notificaciones</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            <strong>Ruta:</strong> Portal → Notificaciones — Centro de alertas: vacunas, citas, facturas, cumpleaños de mascotas.
          </p>
        </div>
      ),
    },
    {
      id: 'analytics',
      title: 'Reportes',
      icon: BarChart3,
      content: (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Reportes y Analytics</h2>
          <p className="text-sm text-[var(--text-secondary)]"><strong>Ruta:</strong> Finanzas → Analytics</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <ReportCard title="Ingresos" description="Tendencia de facturación, comparativa mensual" />
            <ReportCard title="Citas" description="Total, tasa de asistencia, no-shows" />
            <ReportCard title="Tienda" description="Ventas, productos top, márgenes" />
            <ReportCard title="Pacientes" description="Distribución por especie, raza, edad" />
            <ReportCard title="Operaciones" description="Tiempos de espera, utilización" />
            <ReportCard title="Clientes" description="Retención, valor de vida, fidelización" />
          </div>

          <p className="text-sm text-[var(--text-secondary)]">
            Cada reporte se puede filtrar por rango de fechas y exportar a PDF.
          </p>

          <h3 className="font-semibold">Auditoría</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            <strong>Ruta:</strong> Administración → Auditoría — Registro de todas las acciones: quién hizo qué y cuándo.
          </p>
        </div>
      ),
    },
    {
      id: 'checklist',
      title: 'Checklist',
      icon: CheckCircle2,
      content: (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Checklist de Configuración</h2>
          <p className="text-sm text-[var(--text-secondary)]">Completa estos pasos en orden para tener tu clínica funcionando:</p>

          <div className="space-y-2">
            <ChecklistItem step="ck-1" label="Iniciar sesión y explorar el Dashboard" completed={completedSteps} onToggle={toggleStep} />
            <ChecklistItem step="ck-2" label="Configurar datos generales (Ajustes → General)" completed={completedSteps} onToggle={toggleStep} />
            <ChecklistItem step="ck-3" label="Personalizar marca y colores (Ajustes → Marca)" completed={completedSteps} onToggle={toggleStep} />
            <ChecklistItem step="ck-4" label="Activar módulos necesarios (Ajustes → Módulos)" completed={completedSteps} onToggle={toggleStep} />
            <ChecklistItem step="ck-5" label="Configurar servicios y precios (Ajustes → Servicios)" completed={completedSteps} onToggle={toggleStep} />
            <ChecklistItem step="ck-6" label="Configurar pasarela de pago (Administración → Pasarelas)" completed={completedSteps} onToggle={toggleStep} />
            <ChecklistItem step="ck-7" label="Invitar equipo de trabajo (Administración → Equipo)" completed={completedSteps} onToggle={toggleStep} />
            <ChecklistItem step="ck-8" label="Configurar horarios del equipo (Administración → Horarios)" completed={completedSteps} onToggle={toggleStep} />
            <ChecklistItem step="ck-9" label="Registrar los primeros clientes y mascotas" completed={completedSteps} onToggle={toggleStep} />
            <ChecklistItem step="ck-10" label="Cargar inventario inicial" completed={completedSteps} onToggle={toggleStep} />
            <ChecklistItem step="ck-11" label="Crear la primera cita de prueba" completed={completedSteps} onToggle={toggleStep} />
            <ChecklistItem step="ck-12" label="Crear factura de prueba y registrar pago" completed={completedSteps} onToggle={toggleStep} />
            <ChecklistItem step="ck-13" label="Configurar alertas de stock (Ajustes → Alertas)" completed={completedSteps} onToggle={toggleStep} />
          </div>

          <div className="rounded-xl bg-[var(--bg-subtle)] p-4">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {completedSteps.size} de 13 completados
            </p>
            <div className="mt-2 h-2 rounded-full bg-[var(--border-light)]">
              <div
                className="h-2 rounded-full bg-[var(--primary)] transition-all"
                style={{ width: `${(completedSteps.size / 13) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center gap-3">
        <BookOpen className="h-8 w-8 text-[var(--primary)]" />
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Guía de Onboarding</h1>
          <p className="text-sm text-[var(--text-secondary)]">Aprende a usar {clinicName} paso a paso</p>
        </div>
      </div>

      <div className="flex gap-6">
        <nav className="hidden w-56 flex-shrink-0 lg:block">
          <div className="sticky top-24 space-y-1">
            {sections.map((s) => {
              const Icon = s.icon
              const isActive = activeSection === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-[var(--primary)] font-medium text-white'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{s.title}</span>
                </button>
              )
            })}
          </div>
        </nav>

        <div className="min-w-0 flex-1 lg:hidden">
          <select
            value={activeSection}
            onChange={(e) => setActiveSection(e.target.value)}
            className="w-full rounded-lg border border-[var(--border-light)] bg-[var(--bg-paper)] px-3 py-2 text-sm"
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>

        <main className="min-w-0 flex-1">
          <div className="rounded-xl border border-[var(--border-light)] bg-[var(--bg-paper)] p-6">
            {sections.find((s) => s.id === activeSection)?.content}
          </div>
        </main>
      </div>
    </div>
  )
}

function QuickCard({ icon: Icon, title, description, href }: { icon: React.ElementType; title: string; description: string; href: string }) {
  return (
    <button
      onClick={() => {
        const el = document.querySelector(href)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }}
      className="rounded-xl border border-[var(--border-light)] bg-[var(--bg-paper)] p-4 text-left transition-colors hover:border-[var(--primary)] hover:shadow-sm"
    >
      <Icon className="h-6 w-6 text-[var(--primary)]" />
      <h3 className="mt-2 font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-1 text-xs text-[var(--text-secondary)]">{description}</p>
    </button>
  )
}

function SetupCard({
  step,
  title,
  route,
  routeLabel,
  children,
  completed,
  onToggle,
}: {
  step: string
  title: string
  route: string
  routeLabel: string
  children: React.ReactNode
  completed: boolean
  onToggle: () => void
}) {
  return (
    <div className={`rounded-xl border p-4 transition-colors ${completed ? 'border-green-200 bg-green-50/50' : 'border-[var(--border-light)]'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onToggle} className="flex-shrink-0">
            {completed ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-[var(--text-muted)]" />
            )}
          </button>
          <h3 className="font-semibold text-[var(--text-primary)]">{title}</h3>
        </div>
        <a
          href={route}
          className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
        >
          {routeLabel}
        </a>
      </div>
      <div className="mt-3 pl-7 text-sm text-[var(--text-secondary)]">{children}</div>
    </div>
  )
}

function ModuleBadge({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-[var(--border-light)] bg-[var(--bg-paper)] px-3 py-1.5 text-xs">
      <Icon className="h-3.5 w-3.5 text-[var(--primary)]" />
      <span>{label}</span>
    </div>
  )
}

function StatusBadge({ label, color }: { label: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-700',
    gray: 'bg-gray-100 text-gray-700',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[color]}`}>
      {label}
    </span>
  )
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-[var(--border-light)] p-3">
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--primary)]" />
      <div>
        <p className="text-xs font-bold text-[var(--text-muted)]">{label}</p>
        <p className="text-sm text-[var(--text-secondary)]">{value}</p>
      </div>
    </div>
  )
}

function ReportCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-[var(--border-light)] p-3">
      <p className="font-medium text-[var(--text-primary)]">{title}</p>
      <p className="mt-1 text-xs text-[var(--text-secondary)]">{description}</p>
    </div>
  )
}

function ChecklistItem({
  step,
  label,
  completed,
  onToggle,
}: {
  step: string
  label: string
  completed: Set<string>
  onToggle: (s: string) => void
}) {
  const isDone = completed.has(step)
  return (
    <button
      onClick={() => onToggle(step)}
      className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
        isDone ? 'border-green-200 bg-green-50' : 'border-[var(--border-light)] hover:bg-[var(--bg-subtle)]'
      }`}
    >
      {isDone ? (
        <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />
      ) : (
        <Circle className="h-5 w-5 flex-shrink-0 text-[var(--text-muted)]" />
      )}
      <span className={isDone ? 'text-green-700 line-through' : 'text-[var(--text-primary)]'}>{label}</span>
    </button>
  )
}
