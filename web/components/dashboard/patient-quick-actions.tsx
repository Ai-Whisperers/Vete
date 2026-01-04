"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  FileText,
  Syringe,
  Pill,
  Heart,
  Stethoscope,
  FlaskConical,
  Camera,
  MessageSquare,
  MoreHorizontal,
  X,
  Bed,
  ClipboardList,
} from "lucide-react";
import { useDashboardLabels } from "@/lib/hooks/use-dashboard-labels";

interface PatientQuickActionsProps {
  clinic: string;
  petId: string;
  petName: string;
  ownerId: string;
}

interface QuickAction {
  icon: React.ElementType;
  label: string;
  href?: string;
  onClick?: () => void;
  color: string;
  bgColor: string;
}

export function PatientQuickActions({
  clinic,
  petId,
  petName,
  ownerId,
}: PatientQuickActionsProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(false);
  const labels = useDashboardLabels();

  const primaryActions: QuickAction[] = [
    {
      icon: Calendar,
      label: labels.patient_actions.actions.new_appointment,
      href: `/${clinic}/dashboard/appointments/new?pet=${petId}&client=${ownerId}`,
      color: "text-blue-600",
      bgColor: "bg-blue-100 hover:bg-blue-200",
    },
    {
      icon: FileText,
      label: labels.patient_actions.actions.medical_history,
      href: `/${clinic}/dashboard/records/new?pet=${petId}`,
      color: "text-green-600",
      bgColor: "bg-green-100 hover:bg-green-200",
    },
    {
      icon: Syringe,
      label: labels.patient_actions.actions.vaccine,
      href: `/${clinic}/dashboard/vaccines/add?pet=${petId}`,
      color: "text-purple-600",
      bgColor: "bg-purple-100 hover:bg-purple-200",
    },
    {
      icon: Pill,
      label: labels.patient_actions.actions.prescription,
      href: `/${clinic}/dashboard/prescriptions/new?pet=${petId}`,
      color: "text-orange-600",
      bgColor: "bg-orange-100 hover:bg-orange-200",
    },
  ];

  const secondaryActions: QuickAction[] = [
    {
      icon: FlaskConical,
      label: labels.patient_actions.actions.lab,
      href: `/${clinic}/dashboard/lab/new?pet=${petId}`,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100 hover:bg-cyan-200",
    },
    {
      icon: Bed,
      label: labels.patient_actions.actions.hospitalize,
      href: `/${clinic}/dashboard/hospital/admit?pet=${petId}`,
      color: "text-red-600",
      bgColor: "bg-red-100 hover:bg-red-200",
    },
    {
      icon: Heart,
      label: labels.patient_actions.actions.quality_of_life,
      href: `/${clinic}/dashboard/assessments/new?pet=${petId}`,
      color: "text-pink-600",
      bgColor: "bg-pink-100 hover:bg-pink-200",
    },
    {
      icon: Stethoscope,
      label: labels.patient_actions.actions.quick_consult,
      href: `/${clinic}/dashboard/consultations/quick?pet=${petId}`,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100 hover:bg-indigo-200",
    },
    {
      icon: ClipboardList,
      label: labels.patient_actions.actions.consent,
      href: `/${clinic}/dashboard/consents/new?pet=${petId}`,
      color: "text-amber-600",
      bgColor: "bg-amber-100 hover:bg-amber-200",
    },
    {
      icon: Camera,
      label: labels.patient_actions.actions.photo_doc,
      href: `/${clinic}/dashboard/documents/upload?pet=${petId}`,
      color: "text-teal-600",
      bgColor: "bg-teal-100 hover:bg-teal-200",
    },
    {
      icon: MessageSquare,
      label: labels.patient_actions.actions.message_owner,
      href: `/${clinic}/dashboard/messages/new?client=${ownerId}`,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 hover:bg-emerald-200",
    },
  ];

  const ActionButton = ({ action }: { action: QuickAction }): React.ReactElement => {
    const Icon = action.icon;

    if (action.href) {
      return (
        <Link
          href={action.href}
          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${action.bgColor}`}
          title={action.label}
        >
          <Icon className={`w-5 h-5 ${action.color}`} />
          <span className="text-xs font-medium text-gray-700 text-center leading-tight">
            {action.label}
          </span>
        </Link>
      );
    }

    return (
      <button
        onClick={action.onClick}
        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${action.bgColor}`}
        title={action.label}
      >
        <Icon className={`w-5 h-5 ${action.color}`} />
        <span className="text-xs font-medium text-gray-700 text-center leading-tight">
          {action.label}
        </span>
      </button>
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark,var(--primary))] px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-xs font-medium">{labels.patient_actions.title}</p>
                  <p className="text-white font-semibold truncate">{petName}</p>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                  aria-label="Cerrar acciones rapidas"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Primary Actions */}
            <div className="p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {labels.patient_actions.frequent}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {primaryActions.map((action) => (
                  <ActionButton key={action.label} action={action} />
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Secondary Actions */}
            <div className="p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {labels.patient_actions.more}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {secondaryActions.map((action) => (
                  <ActionButton key={action.label} action={action} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all ${
          isExpanded
            ? "bg-gray-800 hover:bg-gray-700"
            : "bg-[var(--primary)] hover:opacity-90"
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isExpanded ? "Cerrar menu de acciones" : `Abrir acciones rapidas para ${petName}`}
        aria-expanded={isExpanded}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isExpanded ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <MoreHorizontal className="w-6 h-6 text-white" />
          )}
        </motion.div>
      </motion.button>
    </div>
  );
}
