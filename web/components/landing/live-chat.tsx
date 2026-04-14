'use client'

import { useState } from 'react'
import { MessageCircle, X, Mail } from 'lucide-react'

export function LiveChat() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-6 left-6 z-40">
      {open && (
        <div className="mb-4 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-[#1B3A6B] p-4 flex items-center justify-between">
            <span className="font-bold text-white">Chat with us</span>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <a
              href="https://wa.me/595981234567"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-slate-800">WhatsApp</div>
                <div className="text-xs text-slate-500">Quick response</div>
              </div>
            </a>
            <a
              href="mailto:info@lealtis.com"
              className="flex items-center gap-3 p-3 rounded-xl bg-[#1B3A6B]/5 hover:bg-[#1B3A6B]/10 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B3A6B]">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-slate-800">Email</div>
                <div className="text-xs text-slate-500">info@lealtis.com</div>
              </div>
            </a>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1B3A6B] text-white shadow-lg hover:bg-[#1B3A6B]/90 transition-all hover:-translate-y-0.5"
        aria-label="Open chat"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  )
}
