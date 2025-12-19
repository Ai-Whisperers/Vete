'use client';

import * as Icons from 'lucide-react';

interface VaccineReaction {
  id: string;
  reaction_detail: string;
  occurred_at: string;
}

interface VaccineReactionAlertProps {
  reactions: VaccineReaction[];
}

export function VaccineReactionAlert({ reactions }: VaccineReactionAlertProps) {
  if (!reactions || reactions.length === 0) return null;

  return (
    <div className="bg-red-50 border-2 border-red-200 p-6 rounded-3xl flex items-start gap-4 animate-pulse">
      <div className="bg-red-500 p-3 rounded-2xl text-white">
        <Icons.AlertTriangle className="w-8 h-8" />
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-black text-red-900">¡Alerta de Reacción Alérgica!</h3>
        <p className="text-red-700 font-medium leading-relaxed">
          Este paciente ha presentado reacciones adversas en aplicaciones previas:
        </p>
        <ul className="mt-2 space-y-1">
          {reactions.map((r) => (
            <li key={r.id} className="text-red-700 font-black flex items-center gap-2">
              • {r.reaction_detail} <span className="text-xs opacity-50 font-medium">({new Date(r.occurred_at).toLocaleDateString()})</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-red-900 font-black uppercase text-xs tracking-widest">
          Extremar precauciones antes de cualquier nueva aplicación.
        </p>
      </div>
    </div>
  );
}
