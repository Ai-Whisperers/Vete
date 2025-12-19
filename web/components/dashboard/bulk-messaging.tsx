"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  Users,
  Filter,
  Check,
  Loader2,
  Mail,
  Phone,
  AlertCircle,
  ChevronDown,
  Search,
  Crown,
  Heart,
  Building2,
  Tag,
} from "lucide-react";
import { useDashboardLabels } from "@/lib/hooks/use-dashboard-labels";

interface Client {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  tags?: string[];
  pets_count?: number;
}

interface BulkMessagingProps {
  clinic: string;
  isOpen: boolean;
  onClose: () => void;
}

type MessageChannel = "whatsapp" | "email" | "sms";

interface FilterOption {
  id: string;
  icon: React.ElementType;
  color: string;
}

const FILTER_CONFIGS: FilterOption[] = [
  { id: "all", icon: Users, color: "bg-blue-100 text-blue-700" },
  { id: "vip", icon: Crown, color: "bg-amber-100 text-amber-700" },
  { id: "recent", icon: Tag, color: "bg-green-100 text-green-700" },
  { id: "inactive", icon: AlertCircle, color: "bg-red-100 text-red-700" },
  { id: "criadero", icon: Building2, color: "bg-purple-100 text-purple-700" },
  { id: "rescate", icon: Heart, color: "bg-pink-100 text-pink-700" },
];

const TEMPLATE_IDS = ["reminder", "promo", "checkup", "custom"] as const;

export function BulkMessaging({
  clinic,
  isOpen,
  onClose,
}: BulkMessagingProps): React.ReactElement {
  const labels = useDashboardLabels();
  const [step, setStep] = useState<"select" | "compose" | "review" | "sending">("select");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [channel, setChannel] = useState<MessageChannel>("whatsapp");
  const [message, setMessage] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sendProgress, setSendProgress] = useState(0);
  const [sendResult, setSendResult] = useState<{ success: number; failed: number } | null>(null);

  // Build filter options with labels
  const filterOptions = FILTER_CONFIGS.map((config) => ({
    ...config,
    label: labels.clients.filters[config.id as keyof typeof labels.clients.filters] as string,
  }));

  // Build message templates with labels
  const messageTemplates = TEMPLATE_IDS.map((id) => ({
    id,
    title: labels.bulk_messaging.templates[id as keyof typeof labels.bulk_messaging.templates] as string,
    message: id === "custom" ? "" : `Hola {nombre}, ${id === "reminder" ? "te recordamos que {mascota} tiene una vacuna pendiente. ¡Agenda tu cita!" : id === "promo" ? "este mes tenemos 20% de descuento en baños y cortes. ¡Te esperamos!" : "ha pasado un año desde el último chequeo de {mascota}. Es hora de una revisión."}`,
  }));

  // Fetch clients based on filter
  useEffect(() => {
    if (!isOpen) return;

    const fetchClients = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/clients?clinic=${clinic}&filter=${selectedFilter}`
        );
        if (response.ok) {
          const data = await response.json();
          setClients(data.clients || []);
        } else {
          // Mock data
          setClients([
            { id: "1", full_name: "Juan Pérez", email: "juan@email.com", phone: "+595 981 123456", pets_count: 2, tags: ["vip"] },
            { id: "2", full_name: "María García", email: "maria@email.com", phone: "+595 982 654321", pets_count: 1, tags: [] },
            { id: "3", full_name: "Carlos López", email: "carlos@email.com", phone: "+595 983 111222", pets_count: 3, tags: ["criadero"] },
          ]);
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [clinic, selectedFilter, isOpen]);

  const filteredClients = clients.filter(
    (c) =>
      c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const toggleClient = (clientId: string): void => {
    setSelectedClients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(clientId)) {
        newSet.delete(clientId);
      } else {
        newSet.add(clientId);
      }
      return newSet;
    });
  };

  const selectAllFiltered = (): void => {
    setSelectedClients(new Set(filteredClients.map((c) => c.id)));
  };

  const clearSelection = (): void => {
    setSelectedClients(new Set());
  };

  const handleSelectTemplate = (templateId: string): void => {
    setSelectedTemplate(templateId);
    const template = messageTemplates.find((t) => t.id === templateId);
    if (template && template.id !== "custom") {
      setMessage(template.message);
    }
  };

  const handleSend = async (): Promise<void> => {
    setStep("sending");
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

  const resetAndClose = (): void => {
    setStep("select");
    setSelectedClients(new Set());
    setMessage("");
    setSelectedTemplate(null);
    setSendProgress(0);
    setSendResult(null);
    onClose();
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
                  <p className="text-sm text-white/70">
                    {step === "select" && labels.bulk_messaging.steps.select}
                    {step === "compose" && labels.bulk_messaging.steps.compose}
                    {step === "review" && labels.bulk_messaging.steps.review}
                    {step === "sending" && labels.bulk_messaging.steps.sending}
                  </p>
                </div>
              </div>
              <button
                onClick={resetAndClose}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Step 1: Select Recipients */}
            {step === "select" && (
              <div className="flex-1 overflow-hidden flex flex-col">
                {/* Filters */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.id}
                          onClick={() => setSelectedFilter(option.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            selectedFilter === option.id
                              ? option.color
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Search */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={labels.clients.search_placeholder}
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-500">
                      {labels.bulk_messaging.selected_count
                        .replace("{count}", String(selectedClients.size))
                        .replace("{total}", String(filteredClients.length))}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={selectAllFiltered}
                        className="text-sm text-[var(--primary)] hover:underline"
                      >
                        {labels.bulk_messaging.select_all}
                      </button>
                      <button
                        onClick={clearSelection}
                        className="text-sm text-gray-500 hover:underline"
                      >
                        {labels.bulk_messaging.clear}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Client List */}
                <div className="flex-1 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" />
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredClients.map((client) => (
                        <label
                          key={client.id}
                          className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedClients.has(client.id)}
                            onChange={() => toggleClient(client.id)}
                            className="w-5 h-5 text-[var(--primary)] border-gray-300 rounded focus:ring-[var(--primary)]"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">{client.full_name}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5" />
                                {client.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5" />
                                {client.phone}
                              </span>
                            </div>
                          </div>
                          {client.pets_count && (
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                              {client.pets_count} mascota{client.pets_count > 1 ? "s" : ""}
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <button
                    onClick={() => setStep("compose")}
                    disabled={selectedClients.size === 0}
                    className="w-full py-3 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50"
                  >
                    {labels.bulk_messaging.continue_with.replace("{count}", String(selectedClients.size))}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Compose Message */}
            {step === "compose" && (
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Channel Selection */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {labels.bulk_messaging.channel}
                    </label>
                    <div className="flex gap-3">
                      {[
                        { id: "whatsapp", label: labels.bulk_messaging.channels.whatsapp, icon: MessageSquare, color: "green" },
                        { id: "email", label: labels.bulk_messaging.channels.email, icon: Mail, color: "blue" },
                        { id: "sms", label: labels.bulk_messaging.channels.sms, icon: Phone, color: "purple" },
                      ].map((ch) => {
                        const Icon = ch.icon;
                        return (
                          <button
                            key={ch.id}
                            onClick={() => setChannel(ch.id as MessageChannel)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-colors ${
                              channel === ch.id
                                ? `border-${ch.color}-500 bg-${ch.color}-50 text-${ch.color}-700`
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            {ch.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Templates */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {labels.bulk_messaging.template}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {messageTemplates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => handleSelectTemplate(template.id)}
                          className={`p-3 text-left rounded-lg border transition-colors ${
                            selectedTemplate === template.id
                              ? "border-[var(--primary)] bg-[var(--primary)] bg-opacity-5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <p className="font-medium text-sm text-gray-900">{template.title}</p>
                          {template.message && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {template.message}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {labels.bulk_messaging.message}
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Escribe tu mensaje aquí..."
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {labels.bulk_messaging.variables_hint}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                  <button
                    onClick={() => setStep("select")}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    {labels.common.back}
                  </button>
                  <button
                    onClick={() => setStep("review")}
                    disabled={!message.trim()}
                    className="flex-1 py-3 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50"
                  >
                    {labels.bulk_messaging.steps.review}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === "review" && (
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{labels.search.types.client}</span>
                      <span className="font-medium">{selectedClients.size}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{labels.bulk_messaging.channel}</span>
                      <span className="font-medium capitalize">{channel}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">{labels.bulk_messaging.message}</p>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-900 whitespace-pre-wrap">{message}</p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-800">{labels.bulk_messaging.confirm_send}</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          {labels.bulk_messaging.send_warning.replace("{count}", String(selectedClients.size))}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                  <button
                    onClick={() => setStep("compose")}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    {labels.common.edit}
                  </button>
                  <button
                    onClick={handleSend}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                    {labels.bulk_messaging.send}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Sending */}
            {step === "sending" && (
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                {!sendResult ? (
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">{labels.bulk_messaging.steps.sending}</p>
                    <p className="text-sm text-gray-500 mb-4">{sendProgress}%</p>
                    <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[var(--primary)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${sendProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-2">{labels.bulk_messaging.completed}</p>
                    <p className="text-sm text-gray-500 mb-6">
                      {labels.bulk_messaging.sent_count.replace("{success}", String(sendResult.success))}
                      {sendResult.failed > 0 && `, ${labels.bulk_messaging.failed_count.replace("{failed}", String(sendResult.failed))}`}
                    </p>
                    <button
                      onClick={resetAndClose}
                      className="px-6 py-3 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-colors"
                    >
                      {labels.common.close}
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
