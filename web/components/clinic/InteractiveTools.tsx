'use client'

import { useState } from 'react'

interface Tool {
  id: string
  icon: string
  title: string
  description: string
  color: string
}

interface Props {
  title?: string
  subtitle?: string
  tools: Tool[]
  waLink?: string | null
  primary?: string
  accent?: string
}

export function InteractiveTools({ title, subtitle, tools, waLink, primary = '#1B3A6B', accent = '#C9A84C' }: Props) {
  const [openTool, setOpenTool] = useState<string | null>(null)

  if (!tools || tools.length === 0) return null

  return (
    <section style={{ padding: '5rem 1.5rem', background: '#F8FAFC' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ color: accent, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
            Herramientas
          </span>
          <h2 style={{ color: primary, fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, marginTop: '0.5rem' }}>
            {title || '¿Dudas Rápidas?'}
          </h2>
          {subtitle && (
            <p style={{ color: '#6B7280', maxWidth: '600px', margin: '0.75rem auto 0', lineHeight: 1.7 }}>
              {subtitle}
            </p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setOpenTool(openTool === tool.id ? null : tool.id)}
              style={{
                background: 'white',
                border: `1px solid ${openTool === tool.id ? tool.color : '#E5E7EB'}`,
                borderRadius: '16px',
                padding: '1.5rem',
                textAlign: 'left',
                cursor: 'pointer',
                width: '100%',
                transition: 'all 0.2s ease',
                boxShadow: openTool === tool.id ? `0 8px 24px ${tool.color}20` : '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '0.75rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: `${tool.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                }}>
                  {tool.icon === 'alert-triangle' && '⚠️'}
                  {tool.icon === 'calculator' && '🧮'}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: primary, fontWeight: 700, fontSize: '1.0625rem', margin: 0 }}>{tool.title}</h3>
                  <p style={{ color: '#6B7280', fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>{tool.description}</p>
                </div>
                <span style={{
                  color: tool.color,
                  fontSize: '1.25rem',
                  transform: openTool === tool.id ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s',
                }}>
                  ▼
                </span>
              </div>

              {openTool === tool.id && (
                <div style={{
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: `1px solid ${tool.color}20`,
                }}>
                  {tool.id === 'toxic-food' && (
                    <div>
                      <p style={{ color: '#4B5563', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                        Algunos alimentos son tóxicos para mascotas:
                      </p>
                      <ul style={{ color: '#EF4444', fontSize: '0.8125rem', paddingLeft: '1rem', margin: 0 }}>
                        <li>Chocolate (todos los tipos)</li>
                        <li>Uvas y pasas</li>
                        <li>Cebolla y ajo</li>
                        <li>Xilitol (endulzante)</li>
                        <li>Cafeína</li>
                      </ul>
                    </div>
                  )}
                  {tool.id === 'age-calculator' && (
                    <div>
                      <p style={{ color: '#4B5563', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                        <strong>Regla general:</strong> 1 año humano = 4-5 años de mascota (perro/gato)
                      </p>
                      <p style={{ color: '#6B7280', fontSize: '0.8125rem' }}>
                        Cada raza envejece diferente. Consultá con tu veterinario.
                      </p>
                    </div>
                  )}
                  {waLink && (
                    <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
                      display: 'inline-block', marginTop: '1rem', background: tool.color,
                      color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'none',
                    }}>
                      Consultar →
                    </a>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
