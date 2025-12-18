'use client'

import * as Icons from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { messageStatusConfig, type WhatsAppMessage } from '@/lib/types/whatsapp'

interface MessageBubbleProps {
  message: WhatsAppMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isOutbound = message.direction === 'outbound'
  const statusConfig = messageStatusConfig[message.status]

  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          isOutbound
            ? 'bg-[var(--primary)] text-white rounded-br-sm'
            : 'bg-gray-100 text-[var(--text-primary)] rounded-bl-sm'
        }`}
      >
        {/* Message content */}
        <p className="whitespace-pre-wrap break-words">{message.content}</p>

        {/* Time and status */}
        <div className={`flex items-center justify-end gap-1 mt-1 ${
          isOutbound ? 'text-white/70' : 'text-[var(--text-secondary)]'
        }`}>
          <span className="text-xs">
            {message.sent_at && format(new Date(message.sent_at), 'HH:mm', { locale: es })}
          </span>

          {isOutbound && (
            <span className={isOutbound ? 'text-white/70' : statusConfig?.color}>
              {message.status === 'read' ? (
                <Icons.CheckCheck className="w-4 h-4" />
              ) : message.status === 'delivered' ? (
                <Icons.CheckCheck className="w-4 h-4" />
              ) : message.status === 'sent' ? (
                <Icons.Check className="w-4 h-4" />
              ) : message.status === 'failed' ? (
                <Icons.AlertCircle className="w-4 h-4" />
              ) : (
                <Icons.Clock className="w-4 h-4" />
              )}
            </span>
          )}
        </div>

        {/* Error message */}
        {message.status === 'failed' && message.error_message && (
          <p className={`text-xs mt-1 ${isOutbound ? 'text-red-200' : 'text-red-500'}`}>
            Error: {message.error_message}
          </p>
        )}
      </div>
    </div>
  )
}
