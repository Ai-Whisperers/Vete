'use client';

import * as Icons from 'lucide-react';
import { Milestone } from '@/hooks/use-age-calculation';

interface MilestonesPanelProps {
  milestones: Milestone[];
  ageInYears: number;
}

export function MilestonesPanel({ milestones, ageInYears }: MilestonesPanelProps) {
  return (
    <div className="space-y-3">
      {milestones.map((milestone, i) => (
        <div
          key={i}
          className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
            milestone.reached ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              milestone.reached ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
            }`}
          >
            {milestone.reached ? <Icons.Check className="w-5 h-5" /> : <Icons.Clock className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-800">
              {milestone.petAge} {milestone.petAge === 1 ? 'año' : 'años'} = {milestone.humanAge} años humanos
            </p>
            <p className="text-sm text-gray-500">{milestone.description}</p>
          </div>
          {milestone.reached && Math.abs(milestone.petAge - ageInYears) < 0.5 && (
            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Actual</span>
          )}
        </div>
      ))}
    </div>
  );
}
