import React from 'react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'outline'
  }
  className?: string
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-4 py-12 text-center ${className}`}
    >
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 opacity-60">
          {icon}
        </div>
      )}

      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>

      {description && <p className="mb-6 max-w-sm text-gray-500">{description}</p>}

      {action && (
        <Button onClick={action.onClick} variant={action.variant || 'primary'}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
