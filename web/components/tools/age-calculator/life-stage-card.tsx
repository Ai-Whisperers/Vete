'use client';

import * as Icons from 'lucide-react';
import { LifeStage } from '@/hooks/use-age-calculation';

interface LifeStageCardProps {
  lifeStage: LifeStage;
}

export function LifeStageCard({ lifeStage }: LifeStageCardProps) {
  return (
    <div className="bg-[var(--bg-subtle)] rounded-xl p-5 border border-gray-100">
      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
        <Icons.Stethoscope className="w-5 h-5 text-[var(--primary)]" />
        Etapa: {lifeStage.label}
      </h4>
      <p className="text-sm text-gray-600 mb-4">{lifeStage.description}</p>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Chequeos</p>
          <p className="text-sm text-gray-700">{lifeStage.checkupFrequency}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Dieta</p>
          <p className="text-sm text-gray-700">{lifeStage.dietTips}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Ejercicio</p>
          <p className="text-sm text-gray-700">{lifeStage.exerciseTips}</p>
        </div>
      </div>
    </div>
  );
}
