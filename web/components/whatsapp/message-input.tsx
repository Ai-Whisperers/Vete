'use client'

import { useState, useRef } from 'react'
import * as Icons from 'lucide-react'

interface MessageInputProps {
  onSend: (message: string) => Promise<void>
  onTemplateClick?: () => void
  disabled?: boolean
  placeholder?: string
}

export function MessageInput({
  onSend,
  onTemplateClick,
  disabled = false,
  placeholder = 'Escribe un mensaje...',
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = async () => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage || sending) return

    setSending(true)
    try {
      await onSend(trimmedMessage)
      setMessage('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)

    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }

  return (
    <div className="bg-white border-t border-gray-100 p-3">
      <div className="flex items-end gap-2">
        {/* Template button */}
        {onTemplateClick && (
          <button
            onClick={onTemplateClick}
            disabled={disabled}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            title="Usar plantilla"
          >
            <Icons.FileText className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        )}

        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || sending}
            rows={1}
            className="w-full px-4 py-2 bg-gray-100 rounded-2xl resize-none
                       text-[var(--text-primary)] placeholder-[var(--text-secondary)]
                       focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50
                       disabled:opacity-50"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled || sending}
          className="p-2 bg-[var(--primary)] text-white rounded-full
                     hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-opacity"
        >
          {sending ? (
            <Icons.Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Icons.Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  )
}
