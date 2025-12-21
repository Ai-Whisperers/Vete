'use client'

import * as Icons from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { messageStatusConfig, type Conversation } from '@/lib/types/whatsapp'

interface ConversationListProps {
  conversations: Conversation[]
  selectedPhone: string | null
  onSelect: (phone: string) => void
}

export function ConversationList({ conversations, selectedPhone, onSelect }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center">
        <Icons.MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-[var(--text-secondary)]">No hay conversaciones</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {conversations.map((conversation) => {
        const isSelected = selectedPhone === conversation.phone_number
        const statusConfig = conversation.last_message_status ? messageStatusConfig[conversation.last_message_status] : undefined

        return (
          <button
            key={conversation.phone_number}
            onClick={() => onSelect(conversation.phone_number)}
            className={`w-full p-4 min-h-[60px] text-left hover:bg-gray-50 transition-colors ${
              isSelected ? 'bg-[var(--primary)]/5 border-l-4 border-[var(--primary)]' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                <Icons.User className="w-5 h-5 text-[var(--primary)]" />
              </div>

              <div className="flex-1 min-w-0">
                {/* Name and time */}
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-medium text-[var(--text-primary)] truncate">
                    {conversation.client_name || conversation.phone_number}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)] flex-shrink-0">
                    {conversation.last_message_at && formatDistanceToNow(
                      new Date(conversation.last_message_at),
                      { addSuffix: true, locale: es }
                    )}
                  </span>
                </div>

                {/* Phone and last message preview */}
                {conversation.client_name && (
                  <p className="text-xs text-[var(--text-secondary)] mb-1">
                    {conversation.phone_number}
                  </p>
                )}

                {/* Last message */}
                <div className="flex items-center gap-2">
                  {conversation.last_message_direction === 'outbound' && (
                    <span className={`flex-shrink-0 ${statusConfig?.className || 'text-gray-400'}`}>
                      {conversation.last_message_status === 'read' ? (
                        <Icons.CheckCheck className="w-4 h-4" />
                      ) : conversation.last_message_status === 'delivered' ? (
                        <Icons.CheckCheck className="w-4 h-4" />
                      ) : conversation.last_message_status === 'sent' ? (
                        <Icons.Check className="w-4 h-4" />
                      ) : conversation.last_message_status === 'failed' ? (
                        <Icons.AlertCircle className="w-4 h-4" />
                      ) : (
                        <Icons.Clock className="w-4 h-4" />
                      )}
                    </span>
                  )}
                  <p className="text-sm text-[var(--text-secondary)] truncate">
                    {conversation.last_message}
                  </p>
                </div>

                {/* Unread badge */}
                {conversation.unread_count > 0 && (
                  <div className="mt-2">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-[var(--primary)] text-white rounded-full">
                      {conversation.unread_count}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
