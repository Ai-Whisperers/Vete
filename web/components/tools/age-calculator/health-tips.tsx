'use client';

import * as Icons from 'lucide-react';

interface HealthTipsProps {
  healthTips: string[];
}

export function HealthTips({ healthTips }: HealthTipsProps) {
  return (
    <div>
      <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
        <Icons.Lightbulb className="w-5 h-5 text-amber-500" />
        Recomendaciones específicas
      </h4>
      <ul className="space-y-2">
        {healthTips.map((tip, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
            <Icons.CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}
