'use client';

import { motion } from 'framer-motion';
import { Loader2, Check } from 'lucide-react';
import type { SendResult } from './types';

interface SendProgressProps {
  progress: number;
  result: SendResult | null;
  labels: {
    sending: string;
    completed: string;
    sent_count: string;
    failed_count: string;
    close: string;
  };
  onClose: () => void;
}

export function SendProgress({
  progress,
  result,
  labels,
  onClose,
}: SendProgressProps): React.ReactElement {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      {!result ? (
        <SendingState progress={progress} label={labels.sending} />
      ) : (
        <CompletedState result={result} labels={labels} onClose={onClose} />
      )}
    </div>
  );
}

/**
 * Sending in progress state
 */
function SendingState({
  progress,
  label,
}: {
  progress: number;
  label: string;
}): React.ReactElement {
  return (
    <div className="text-center">
      <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin mx-auto mb-4" />
      <p className="text-lg font-medium text-gray-900 mb-2">{label}</p>
      <p className="text-sm text-gray-500 mb-4">{progress}%</p>
      <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[var(--primary)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Completed state with results
 */
function CompletedState({
  result,
  labels,
  onClose,
}: {
  result: SendResult;
  labels: {
    completed: string;
    sent_count: string;
    failed_count: string;
    close: string;
  };
  onClose: () => void;
}): React.ReactElement {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check className="w-8 h-8 text-green-600" />
      </div>
      <p className="text-lg font-medium text-gray-900 mb-2">{labels.completed}</p>
      <p className="text-sm text-gray-500 mb-6">
        {labels.sent_count.replace('{success}', String(result.success))}
        {result.failed > 0 &&
          `, ${labels.failed_count.replace('{failed}', String(result.failed))}`}
      </p>
      <button
        onClick={onClose}
        className="px-6 py-3 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-colors"
      >
        {labels.close}
      </button>
    </div>
  );
}
