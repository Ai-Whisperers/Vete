'use client'

import { useState } from 'react'

interface FaqItem {
  question: string
  answer: string
}

interface Props {
  items: FaqItem[]
  primary: string
  accent: string
  headingFont?: string
}

export function FaqAccordion({ items, primary, accent, headingFont = 'Georgia, serif' }: Props) {
  const [open, setOpen] = useState<number | null>(null)

  if (!items || items.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {items.map((item, i) => (
        <div key={i} style={{ border: `1px solid ${open === i ? accent : '#E5E7EB'}`, borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.2s ease', background: 'white', boxShadow: open === i ? `0 4px 20px -2px ${primary}20` : '0 1px 3px rgba(0,0,0,0.05)' }}>
          <button onClick={() => setOpen(open === i ? null : i)} style={{ width: '100%', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '1rem' }}>
            <span style={{ fontFamily: headingFont, fontWeight: 600, fontSize: '1rem', color: open === i ? primary : '#1F2937', lineHeight: 1.4 }}>{item.question}</span>
            <span style={{ flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%', background: open === i ? primary : '#F3F4F6', color: open === i ? 'white' : '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 300, transition: 'all 0.2s ease', transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)' }}>+</span>
          </button>
          {open === i && <div style={{ padding: '0 1.5rem 1.25rem', color: '#4B5563', lineHeight: 1.7, fontSize: '0.9375rem', borderTop: `1px solid ${accent}30` }}>{item.answer}</div>}
        </div>
      ))}
    </div>
  )
}
