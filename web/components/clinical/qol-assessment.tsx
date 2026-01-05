'use client'

import { useState, useMemo } from 'react'
import * as Icons from 'lucide-react'

interface QoLAssessmentProps {
  onComplete: (score: number, notes: string) => void
}

// Critical thresholds for individual categories
const CRITICAL_THRESHOLD = 2 // Score <= 2 in any category is critical
const POOR_TOTAL_THRESHOLD = 35

export function QoLAssessment({ onComplete }: QoLAssessmentProps) {
  const [scores, setScores] = useState({
    hurt: 5,
    hunger: 5,
    hydration: 5,
    hygiene: 5,
    happiness: 5,
    mobility: 5,
    goodDays: 5,
  })

  const categories = [
    {
      id: 'hurt',
      label: 'Dolor (Hurt)',
      desc: '0 = Dolor severo sin control. 10 = Sin dolor o bien controlado.',
      critical: true,
    },
    {
      id: 'hunger',
      label: 'Hambre (Hunger)',
      desc: '0 = No come nada. 10 = Come con normalidad.',
      critical: true,
    },
    {
      id: 'hydration',
      label: 'Hidratación (Hydration)',
      desc: '0 = Deshidratación severa. 10 = Bien hidratado.',
      critical: true,
    },
    {
      id: 'hygiene',
      label: 'Higiene (Hygiene)',
      desc: '0 = Llagas/incontinencia sin tratamiento. 10 = Se mantiene limpio.',
      critical: false,
    },
    {
      id: 'happiness',
      label: 'Felicidad (Happiness)',
      desc: '0 = Deprimido/sin respuesta. 10 = Alegre e interactivo.',
      critical: false,
    },
    {
      id: 'mobility',
      label: 'Movilidad (Mobility)',
      desc: '0 = No puede moverse. 10 = Se mueve libremente.',
      critical: false,
    },
    {
      id: 'goodDays',
      label: 'Días Buenos (More Good Days)',
      desc: '0 = Solo días malos. 10 = Mayoría días buenos.',
      critical: false,
    },
  ]

  const total = Object.values(scores).reduce((a, b) => a + b, 0)

  // Check for critical individual scores
  const criticalWarnings = useMemo(() => {
    const warnings: string[] = []
    categories.forEach((cat) => {
      const score = scores[cat.id as keyof typeof scores]
      if (score <= CRITICAL_THRESHOLD && cat.critical) {
        warnings.push(`${cat.label}: Puntuación crítica (${score}/10)`)
      }
    })
    return warnings
  }, [scores])

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
      <h3 className="mb-2 text-xl font-black text-gray-900">Escala HHHHHMM</h3>
      <p className="mb-4 text-sm text-gray-500">
        Escala de Calidad de Vida (Dr. Alice Villalobos). Score {'>'} 35 sugiere calidad de vida
        aceptable.
      </p>

      {/* Important disclaimer */}
      <div className="mb-6 rounded-xl border border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] p-4">
        <div className="flex gap-3">
          <Icons.AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--status-warning)]" />
          <div className="text-sm text-[var(--status-warning-text)]">
            <p className="mb-1 font-bold">Esta herramienta es solo una guía</p>
            <p className="text-[var(--status-warning-text)]">
              Las decisiones sobre el final de la vida deben tomarse junto con un veterinario,
              considerando el contexto completo del paciente. Esta escala NO sustituye el juicio
              profesional.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {categories.map((cat) => (
          <div key={cat.id}>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-bold text-gray-700">{cat.label}</label>
              <span className="text-lg font-black text-[var(--primary)]">
                {scores[cat.id as keyof typeof scores]}
              </span>
            </div>
            <p className="mb-2 text-xs text-gray-400">{cat.desc}</p>
            <input
              type="range"
              min="0"
              max="10"
              value={scores[cat.id as keyof typeof scores]}
              onChange={(e) => setScores({ ...scores, [cat.id]: parseInt(e.target.value) })}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-100 accent-[var(--primary)]"
            />
          </div>
        ))}
      </div>

      {/* Critical warnings */}
      {criticalWarnings.length > 0 && (
        <div className="mt-6 rounded-xl border border-[var(--status-error-border)] bg-[var(--status-error-bg)] p-4">
          <div className="flex gap-3">
            <Icons.AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--status-error)]" />
            <div>
              <p className="mb-2 font-bold text-[var(--status-error-text)]">Valores críticos detectados:</p>
              <ul className="space-y-1 text-sm text-[var(--status-error-text)]">
                {criticalWarnings.map((warning, idx) => (
                  <li key={idx}>• {warning}</li>
                ))}
              </ul>
              <p className="mt-2 text-sm font-medium text-[var(--status-error)]">
                Puntuaciones críticas en categorías esenciales requieren atención veterinaria
                inmediata.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 rounded-2xl bg-gray-900 p-6 text-white">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-50">Puntaje Total</p>
            <p className="text-4xl font-black">{total} / 70</p>
          </div>
          <div className="text-right">
            <p
              className={`text-xl font-black uppercase tracking-tighter ${total > POOR_TOTAL_THRESHOLD ? 'text-[var(--status-success)]' : 'text-[var(--status-error)]'}`}
            >
              {total > POOR_TOTAL_THRESHOLD ? 'Calidad Aceptable' : 'Calidad Comprometida'}
            </p>
          </div>
        </div>

        {/* Score interpretation guide */}
        <div className="mt-4 border-t border-gray-700 pt-4 text-xs opacity-70">
          <p className="mb-1">
            <span className="text-[var(--status-success)]">{'>'} 35:</span> Calidad de vida aceptable
          </p>
          <p className="mb-1">
            <span className="text-[var(--status-warning)]">25-35:</span> Calidad comprometida, evaluar opciones
          </p>
          <p>
            <span className="text-[var(--status-error)]">{'<'} 25:</span> Calidad pobre, considerar cuidados
            paliativos
          </p>
        </div>
      </div>

      <button
        onClick={() => {
          const criticalNote =
            criticalWarnings.length > 0 ? ` ALERTA: ${criticalWarnings.join('; ')}.` : ''
          onComplete(
            total,
            `Evaluación HHHHHMM: Total ${total}/70.${criticalNote} ${total > POOR_TOTAL_THRESHOLD ? 'Calidad aceptable.' : 'Calidad comprometida - evaluar opciones con el veterinario.'}`
          )
        }}
        className="mt-6 w-full rounded-xl bg-[var(--primary)] py-4 font-bold text-white shadow-lg transition-all hover:shadow-xl"
      >
        Confirmar y Agregar a Notas
      </button>
    </div>
  )
}
