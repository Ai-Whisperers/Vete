'use client'

import * as Icons from 'lucide-react'
import Link from 'next/link'

interface ConversationHeaderProps {
  phoneNumber: string
  clientName?: string
  clientId?: string
  petName?: string
  petId?: string
  clinic: string
  onClose?: () => void
}

export function ConversationHeader({
  phoneNumber,
  clientName,
  clientId,
  petName,
  petId,
  clinic,
  onClose,
}: ConversationHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-100 px-3 sm:px-4 py-3">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Back button (mobile) */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2 hover:bg-gray-100 rounded-lg"
          >
            <Icons.ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        )}

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
          <Icons.User className="w-5 h-5 text-[var(--primary)]" />
        </div>

        {/* Contact info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[var(--text-primary)] truncate">
            {clientName || phoneNumber}
          </h3>
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span className="truncate">{phoneNumber}</span>
            {petName && (
              <>
                <span className="shrink-0">•</span>
                <span className="flex items-center gap-1 shrink-0">
                  <Icons.PawPrint className="w-3 h-3" />
                  <span className="truncate max-w-[80px] sm:max-w-none">{petName}</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {clientId && (
            <Link
              href={`/${clinic}/dashboard/clients/${clientId}`}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-gray-100 rounded-lg"
              title="Ver cliente"
            >
              <Icons.ExternalLink className="w-5 h-5 text-[var(--text-secondary)]" />
            </Link>
          )}
          {petId && (
            <Link
              href={`/${clinic}/dashboard/patients/${petId}`}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-gray-100 rounded-lg"
              title="Ver mascota"
            >
              <Icons.PawPrint className="w-5 h-5 text-[var(--text-secondary)]" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
