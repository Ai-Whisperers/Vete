"use client";

import type { JSX } from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps): JSX.Element {
  return (
    <div className="flex items-center gap-4 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={`flex-1 h-2 rounded ${
            currentStep >= i + 1 ? 'bg-[var(--primary)]' : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  );
}
