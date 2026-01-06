'use client'

import {
  type LucideIcon,
  Inbox,
  Search,
  FileX,
  Users,
  PawPrint,
  Calendar,
  FileText,
  Syringe,
  FlaskConical,
  MessageSquare,
  ShoppingCart,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  secondaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  variant?: 'default' | 'search' | 'error' | 'card'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  secondaryAction,
  variant = 'default',
  size = 'md',
  className,
}: EmptyStateProps): React.ReactElement {
  const sizeClasses = {
    sm: {
      container: 'py-8',
      iconWrapper: 'w-12 h-12',
      icon: 'w-6 h-6',
      title: 'text-base',
      description: 'text-sm',
      button: 'px-4 py-2 text-sm',
    },
    md: {
      container: 'py-12',
      iconWrapper: 'w-16 h-16',
      icon: 'w-8 h-8',
      title: 'text-lg',
      description: 'text-sm',
      button: 'px-6 py-3 text-sm',
    },
    lg: {
      container: 'py-16',
      iconWrapper: 'w-20 h-20',
      icon: 'w-10 h-10',
      title: 'text-xl',
      description: 'text-base',
      button: 'px-8 py-4 text-base',
    },
  }

  const variantClasses = {
    default: {
      container: 'bg-[var(--bg-default)]',
      iconWrapper: 'bg-[var(--bg-subtle)]',
      icon: 'text-[var(--text-muted)]',
    },
    search: {
      container: 'bg-[var(--bg-default)]',
      iconWrapper: 'bg-[var(--status-info-bg)]',
      icon: 'text-[var(--status-info)]',
    },
    error: {
      container: 'bg-[var(--status-error-bg)]',
      iconWrapper: 'bg-[var(--status-error-bg)]',
      icon: 'text-[var(--status-error)]',
    },
    card: {
      container: 'bg-[var(--bg-default)] border border-dashed border-[var(--border)] rounded-2xl',
      iconWrapper: 'bg-[var(--bg-subtle)]',
      icon: 'text-[var(--text-muted)]',
    },
  }

  const sizes = sizeClasses[size]
  const variants = variantClasses[variant]

  const ActionButton = ({
    label,
    href,
    onClick,
    primary = false,
  }: {
    label: string
    href?: string
    onClick?: () => void
    primary?: boolean
  }): React.ReactElement => {
    const buttonClasses = cn(
      sizes.button,
      'font-bold rounded-xl transition-all inline-flex items-center justify-center gap-2',
      primary
        ? 'bg-[var(--primary)] text-white shadow-lg hover:shadow-xl hover:-translate-y-1'
        : 'border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
    )

    if (href) {
      return (
        <Link href={href} className={buttonClasses}>
          {label}
        </Link>
      )
    }

    return (
      <button type="button" onClick={onClick} className={buttonClasses}>
        {label}
      </button>
    )
  }

  return (
    <div className={cn('text-center', sizes.container, variants.container, className)}>
      <div
        className={cn(
          'mx-auto mb-4 flex items-center justify-center rounded-full',
          sizes.iconWrapper,
          variants.iconWrapper
        )}
      >
        <Icon className={cn(sizes.icon, variants.icon)} />
      </div>

      <h3 className={cn('mb-2 font-bold text-[var(--text-primary)]', sizes.title)}>{title}</h3>

      {description && (
        <p className={cn('mx-auto mb-6 max-w-sm text-[var(--text-muted)]', sizes.description)}>
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          {action && (
            <ActionButton
              label={action.label}
              href={action.href}
              onClick={action.onClick}
              primary
            />
          )}
          {secondaryAction && (
            <ActionButton
              label={secondaryAction.label}
              href={secondaryAction.href}
              onClick={secondaryAction.onClick}
            />
          )}
        </div>
      )}
    </div>
  )
}

// Pre-configured empty states for common scenarios
export function EmptyStateNoPets({
  clinic,
  className,
}: {
  clinic: string
  className?: string
}): React.ReactElement {
  return (
    <EmptyState
      icon={PawPrint}
      title="No tienes mascotas registradas"
      description="Registra tu primera mascota para comenzar a llevar su historial médico."
      action={{
        label: 'Agregar Mascota',
        href: `/${clinic}/portal/pets/new`,
      }}
      variant="card"
      size="lg"
      className={className}
    />
  )
}

export function EmptyStateNoAppointments({
  clinic,
  className,
}: {
  clinic: string
  className?: string
}): React.ReactElement {
  return (
    <EmptyState
      icon={Calendar}
      title="No hay citas programadas"
      description="Agenda una cita para tu mascota con nuestros veterinarios."
      action={{
        label: 'Agendar Cita',
        href: `/${clinic}/book`,
      }}
      variant="default"
      className={className}
    />
  )
}

export function EmptyStateNoInvoices({ className }: { className?: string }): React.ReactElement {
  return (
    <EmptyState
      icon={FileText}
      title="No hay facturas"
      description="Las facturas aparecerán aquí después de cada servicio."
      variant="default"
      className={className}
    />
  )
}

export function EmptyStateNoVaccines({
  clinic,
  petId,
  className,
}: {
  clinic: string
  petId: string
  className?: string
}): React.ReactElement {
  return (
    <EmptyState
      icon={Syringe}
      title="Sin vacunas registradas"
      description="Agrega las vacunas de tu mascota para llevar un control."
      action={{
        label: 'Agregar Vacuna',
        href: `/${clinic}/portal/pets/${petId}/vaccines/new`,
      }}
      variant="default"
      className={className}
    />
  )
}

export function EmptyStateNoLabOrders({ className }: { className?: string }): React.ReactElement {
  return (
    <EmptyState
      icon={FlaskConical}
      title="No hay órdenes de laboratorio"
      description="Las órdenes de laboratorio aparecerán aquí."
      variant="default"
      className={className}
    />
  )
}

export function EmptyStateNoClients({
  clinic,
  className,
}: {
  clinic: string
  className?: string
}): React.ReactElement {
  return (
    <EmptyState
      icon={Users}
      title="No hay clientes"
      description="Invita a tus primeros clientes para comenzar."
      action={{
        label: 'Invitar Cliente',
        href: `/${clinic}/dashboard/clients?action=new-client`,
      }}
      variant="default"
      className={className}
    />
  )
}

export function EmptyStateNoMessages({
  clinic,
  className,
}: {
  clinic: string
  className?: string
}): React.ReactElement {
  return (
    <EmptyState
      icon={MessageSquare}
      title="Sin mensajes"
      description="Inicia una conversación con la clínica."
      action={{
        label: 'Nuevo Mensaje',
        href: `/${clinic}/portal/messages/new`,
      }}
      variant="default"
      className={className}
    />
  )
}

export function EmptyStateNoSearchResults({
  query,
  onClear,
  className,
}: {
  query: string
  onClear?: () => void
  className?: string
}): React.ReactElement {
  return (
    <EmptyState
      icon={Search}
      title="Sin resultados"
      description={`No encontramos resultados para "${query}". Intenta con otra búsqueda.`}
      action={
        onClear
          ? {
              label: 'Limpiar búsqueda',
              onClick: onClear,
            }
          : undefined
      }
      variant="search"
      className={className}
    />
  )
}

export function EmptyStateError({
  title = 'Algo salió mal',
  description = 'No pudimos cargar los datos. Por favor intenta de nuevo.',
  onRetry,
  className,
}: {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}): React.ReactElement {
  return (
    <EmptyState
      icon={FileX}
      title={title}
      description={description}
      action={
        onRetry
          ? {
              label: 'Reintentar',
              onClick: onRetry,
            }
          : undefined
      }
      variant="error"
      className={className}
    />
  )
}

export function EmptyStateEmptyCart({
  clinic,
  className,
}: {
  clinic: string
  className?: string
}): React.ReactElement {
  return (
    <EmptyState
      icon={ShoppingCart}
      title="Tu carrito está vacío"
      description="Explora nuestra tienda y agrega productos."
      action={{
        label: 'Ver Tienda',
        href: `/${clinic}/store`,
      }}
      variant="card"
      size="lg"
      className={className}
    />
  )
}
