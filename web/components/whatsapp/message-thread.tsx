'use client'

import { useEffect, useRef } from 'react'
import { format, isToday, isYesterday, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { MessageBubble } from './message-bubble'
import type { WhatsAppMessage } from '@/lib/types/whatsapp'

interface MessageThreadProps {
  messages: WhatsAppMessage[]
}

function formatDateDivider(date: Date): string {
  if (isToday(date)) {
    return 'Hoy'
  }
  if (isYesterday(date)) {
    return 'Ayer'
  }
  return format(date, "d 'de' MMMM, yyyy", { locale: es })
}

export function MessageThread({ messages }: MessageThreadProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-[var(--text-secondary)]">
        <p>No hay mensajes en esta conversación</p>
      </div>
    )
  }

  // Group messages by date
  const groupedMessages: { date: Date; messages: WhatsAppMessage[] }[] = []

  messages.forEach((message) => {
    const messageDate = new Date(message.sent_at || message.created_at)
    const lastGroup = groupedMessages[groupedMessages.length - 1]

    if (!lastGroup || !isSameDay(lastGroup.date, messageDate)) {
      groupedMessages.push({
        date: messageDate,
        messages: [message],
      })
    } else {
      lastGroup.messages.push(message)
    }
  })

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {groupedMessages.map((group, groupIndex) => (
        <div key={groupIndex}>
          {/* Date divider */}
          <div className="flex items-center justify-center my-4">
            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-[var(--text-secondary)]">
              {formatDateDivider(group.date)}
            </span>
          </div>

          {/* Messages for this date */}
          <div className="space-y-2">
            {group.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  )
}
