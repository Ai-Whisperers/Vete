'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Users, Crown, AlertCircle, Building2, Heart, Tag } from 'lucide-react';
import { useDashboardLabels } from '@/lib/hooks/use-dashboard-labels';
import { ClientSelector } from './client-selector';
import { MessageComposer } from './message-composer';
import { MessageReview } from './message-review';
import { SendProgress } from './send-progress';
import type { Client, MessageChannel, BulkMessagingStep, FilterOption, MessageTemplate, SendResult } from './types';

interface BulkMessagingProps {
  clinic: string;
  isOpen: boolean;
  onClose: () => void;
}

const FILTER_CONFIGS: Omit<FilterOption, 'label'>[] = [
  { id: 'all', icon: Users, color: 'bg-blue-100 text-blue-700' },
  { id: 'vip', icon: Crown, color: 'bg-amber-100 text-amber-700' },
  { id: 'recent', icon: Tag, color: 'bg-green-100 text-green-700' },
  { id: 'inactive', icon: AlertCircle, color: 'bg-red-100 text-red-700' },
  { id: 'criadero', icon: Building2, color: 'bg-purple-100 text-purple-700' },
  { id: 'rescate', icon: Heart, color: 'bg-pink-100 text-pink-700' },
];

const TEMPLATE_IDS = ['reminder', 'promo', 'checkup', 'custom'] as const;

/**
 * Bulk Messaging Modal
 *
 * A multi-step wizard for sending bulk messages to clients via WhatsApp, Email, or SMS.
 * Split into smaller components for maintainability:
 * - ClientSelector: Step 1 - Select recipients
 * - MessageComposer: Step 2 - Compose message
 * - MessageReview: Step 3 - Review before sending
 * - SendProgress: Step 4 - Sending progress and results
 */
export function BulkMessaging({
  clinic,
  isOpen,
  onClose,
}: BulkMessagingProps): React.ReactElement {
  const labels = useDashboardLabels();

  // State
  const [step, setStep] = useState<BulkMessagingStep>('select');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [channel, setChannel] = useState<MessageChannel>('whatsapp');
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sendProgress, setSendProgress] = useState(0);
  const [sendResult, setSendResult] = useState<SendResult | null>(null);

  // Build filter options with labels
  const filterOptions: FilterOption[] = FILTER_CONFIGS.map((config) => ({
    ...config,
    label: labels.clients.filters[config.id as keyof typeof labels.clients.filters] as string,
  }));

  // Build message templates with labels
  const messageTemplates: MessageTemplate[] = TEMPLATE_IDS.map((id) => ({
    id,
    title: labels.bulk_messaging.templates[id as keyof typeof labels.bulk_messaging.templates] as string,
    message:
      id === 'custom'
        ? ''
        : `Hola {nombre}, ${
            id === 'reminder'
              ? 'te recordamos que {mascota} tiene una vacuna pendiente. ¡Agenda tu cita!'
              : id === 'promo'
              ? 'este mes tenemos 20% de descuento en baños y cortes. ¡Te esperamos!'
              : 'ha pasado un año desde el último chequeo de {mascota}. Es hora de una revisión.'
          }`,
  }));

  // Fetch clients based on filter
  useEffect(() => {
    if (!isOpen) return;

    const fetchClients = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/clients?clinic=${clinic}&filter=${selectedFilter}`);
        if (response.ok) {
          const data = await response.json();
          setClients(data.clients || []);
        } else {
          // Mock data for development
          setClients([
            { id: '1', full_name: 'Juan Pérez', email: 'juan@email.com', phone: '+595 981 123456', pets_count: 2, tags: ['vip'] },
            { id: '2', full_name: 'María García', email: 'maria@email.com', phone: '+595 982 654321', pets_count: 1, tags: [] },
            { id: '3', full_name: 'Carlos López', email: 'carlos@email.com', phone: '+595 983 111222', pets_count: 3, tags: ['criadero'] },
          ]);
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [clinic, selectedFilter, isOpen]);

  // Get filtered clients based on search
  const filteredClients = clients.filter(
    (c) =>
      c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  // Handlers
  const toggleClient = useCallback((clientId: string): void => {
    setSelectedClients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(clientId)) {
        newSet.delete(clientId);
      } else {
        newSet.add(clientId);
      }
      return newSet;
    });
  }, []);

  const selectAllFiltered = useCallback((): void => {
    setSelectedClients(new Set(filteredClients.map((c) => c.id)));
  }, [filteredClients]);

  const clearSelection = useCallback((): void => {
    setSelectedClients(new Set());
  }, []);

  const handleSelectTemplate = useCallback((templateId: string): void => {
    setSelectedTemplate(templateId);
    const template = messageTemplates.find((t) => t.id === templateId);
    if (template && template.id !== 'custom') {
      setMessage(template.message);
    }
  }, [messageTemplates]);

  const handleSend = async (): Promise<void> => {
    setStep('sending');
    const clientIds = Array.from(selectedClients);
    let success = 0;
    let failed = 0;

    for (let i = 0; i < clientIds.length; i++) {
      try {
        // Simulate sending
        await new Promise((resolve) => setTimeout(resolve, 300));
        success++;
      } catch {
        failed++;
      }
      setSendProgress(Math.round(((i + 1) / clientIds.length) * 100));
    }

    setSendResult({ success, failed });
  };

  const resetAndClose = useCallback((): void => {
    setStep('select');
    setSelectedClients(new Set());
    setMessage('');
    setSelectedTemplate(null);
    setSendProgress(0);
    setSendResult(null);
    onClose();
  }, [onClose]);

  // Step descriptions for header
  const stepDescriptions: Record<BulkMessagingStep, string> = {
    select: labels.bulk_messaging.steps.select,
    compose: labels.bulk_messaging.steps.compose,
    review: labels.bulk_messaging.steps.review,
    sending: labels.bulk_messaging.steps.sending,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetAndClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[700px] md:max-h-[85vh] bg-white rounded-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark,var(--primary))]">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-white" />
                <div>
                  <h2 className="text-lg font-bold text-white">{labels.bulk_messaging.title}</h2>
                  <p className="text-sm text-white/70">{stepDescriptions[step]}</p>
                </div>
              </div>
              <button
                onClick={resetAndClose}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Step Content */}
            {step === 'select' && (
              <ClientSelector
                clients={filteredClients}
                selectedClients={selectedClients}
                isLoading={isLoading}
                searchQuery={searchQuery}
                selectedFilter={selectedFilter}
                filterOptions={filterOptions}
                labels={{
                  search_placeholder: labels.clients.search_placeholder,
                  selected_count: labels.bulk_messaging.selected_count,
                  select_all: labels.bulk_messaging.select_all,
                  clear: labels.bulk_messaging.clear,
                  continue_with: labels.bulk_messaging.continue_with,
                }}
                onSearchChange={setSearchQuery}
                onFilterChange={setSelectedFilter}
                onToggleClient={toggleClient}
                onSelectAll={selectAllFiltered}
                onClearSelection={clearSelection}
                onContinue={() => setStep('compose')}
              />
            )}

            {step === 'compose' && (
              <MessageComposer
                channel={channel}
                message={message}
                selectedTemplate={selectedTemplate}
                templates={messageTemplates}
                labels={{
                  channel: labels.bulk_messaging.channel,
                  channels: labels.bulk_messaging.channels,
                  template: labels.bulk_messaging.template,
                  message: labels.bulk_messaging.message,
                  variables_hint: labels.bulk_messaging.variables_hint,
                  back: labels.common.back,
                  review: labels.bulk_messaging.steps.review,
                }}
                onChannelChange={setChannel}
                onTemplateSelect={handleSelectTemplate}
                onMessageChange={setMessage}
                onBack={() => setStep('select')}
                onContinue={() => setStep('review')}
              />
            )}

            {step === 'review' && (
              <MessageReview
                selectedCount={selectedClients.size}
                channel={channel}
                message={message}
                labels={{
                  client_label: labels.search.types.client,
                  channel_label: labels.bulk_messaging.channel,
                  message_label: labels.bulk_messaging.message,
                  confirm_send: labels.bulk_messaging.confirm_send,
                  send_warning: labels.bulk_messaging.send_warning,
                  edit: labels.common.edit,
                  send: labels.bulk_messaging.send,
                }}
                onBack={() => setStep('compose')}
                onSend={handleSend}
              />
            )}

            {step === 'sending' && (
              <SendProgress
                progress={sendProgress}
                result={sendResult}
                labels={{
                  sending: labels.bulk_messaging.steps.sending,
                  completed: labels.bulk_messaging.completed,
                  sent_count: labels.bulk_messaging.sent_count,
                  failed_count: labels.bulk_messaging.failed_count,
                  close: labels.common.close,
                }}
                onClose={resetAndClose}
              />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Re-export types for external use
export type { BulkMessagingProps };
export type * from './types';
