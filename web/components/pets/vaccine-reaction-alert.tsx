'use client'

import * as Icons from 'lucide-react'

interface VaccineReaction {
  id: string
  reaction_detail: string
  occurred_at: string
}

interface VaccineReactionAlertProps {
  reactions: VaccineReaction[]
}

export function VaccineReactionAlert({ reactions }: VaccineReactionAlertProps) {
  if (!reactions || reactions.length === 0) return null

  return (
    <div className="flex animate-pulse items-start gap-4 rounded-3xl border-2 border-red-200 bg-red-50 p-6">
      <div className="rounded-2xl bg-red-500 p-3 text-white">
        <Icons.AlertTriangle className="h-8 w-8" />
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-black text-red-900">¡Alerta de Reacción Alérgica!</h3>
        <p className="font-medium leading-relaxed text-red-700">
          Este paciente ha presentado reacciones adversas en aplicaciones previas:
        </p>
        <ul className="mt-2 space-y-1">
          {reactions.map((r) => (
            <li key={r.id} className="flex items-center gap-2 font-black text-red-700">
              • {r.reaction_detail}{' '}
              <span className="text-xs font-medium opacity-50">
                ({new Date(r.occurred_at).toLocaleDateString()})
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs font-black uppercase tracking-widest text-red-900">
          Extremar precauciones antes de cualquier nueva aplicación.
        </p>
      </div>
    </div>
  )
}
