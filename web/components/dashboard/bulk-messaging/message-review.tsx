'use client';

import { AlertCircle, Send } from 'lucide-react';
import type { MessageChannel } from './types';

interface MessageReviewProps {
  selectedCount: number;
  channel: MessageChannel;
  message: string;
  labels: {
    client_label: string;
    channel_label: string;
    message_label: string;
    confirm_send: string;
    send_warning: string;
    edit: string;
    send: string;
  };
  onBack: () => void;
  onSend: () => void;
}

export function MessageReview({
  selectedCount,
  channel,
  message,
  labels,
  onBack,
  onSend,
}: MessageReviewProps): React.ReactElement {
  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{labels.client_label}</span>
            <span className="font-medium">{selectedCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{labels.channel_label}</span>
            <span className="font-medium capitalize">{channel}</span>
          </div>
        </div>

        {/* Message Preview */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            {labels.message_label}
          </p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-gray-900 whitespace-pre-wrap">{message}</p>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">{labels.confirm_send}</p>
              <p className="text-sm text-yellow-700 mt-1">
                {labels.send_warning.replace('{count}', String(selectedCount))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          {labels.edit}
        </button>
        <button
          onClick={onSend}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-colors"
        >
          <Send className="w-5 h-5" />
          {labels.send}
        </button>
      </div>
    </div>
  );
}
