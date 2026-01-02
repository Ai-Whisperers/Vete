'use client';

import Link from 'next/link';
import {
  Activity,
  Calendar,
  Stethoscope,
  Pill,
  FileText,
  Download,
  Paperclip,
  Plus,
  Filter,
  Search,
  ChevronDown,
  Scissors,
  Heart,
  Thermometer,
} from 'lucide-react';
import { useState } from 'react';

interface TimelineItem {
  id: string;
  created_at: string;
  type: 'record' | 'prescription';
  record_type?: string;
  title: string;
  diagnosis?: string | null;
  notes?: string | null;
  vitals?: {
    weight?: number;
    temp?: number;
    hr?: number;
    rr?: number;
  } | null;
  medications?: Array<{
    name: string;
    dose: string;
    frequency: string;
    duration: string;
  }>;
  attachments?: string[];
  vet_name?: string;
}

interface PetHistoryTabProps {
  petId: string;
  petName: string;
  timelineItems: TimelineItem[];
  clinic: string;
  isStaff?: boolean;
}

type FilterType = 'all' | 'consultation' | 'surgery' | 'prescription' | 'vaccination' | 'emergency';

export function PetHistoryTab({
  petId,
  petName,
  timelineItems,
  clinic,
  isStaff = false,
}: PetHistoryTabProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // Filter items
  const filteredItems = timelineItems.filter(item => {
    // Type filter
    if (filter !== 'all') {
      if (filter === 'prescription' && item.type !== 'prescription') return false;
      if (filter !== 'prescription' && item.type === 'prescription') return false;
      if (filter !== 'prescription' && item.record_type !== filter) return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        item.diagnosis?.toLowerCase().includes(query) ||
        item.notes?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('es-PY', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getTypeIcon = (item: TimelineItem) => {
    if (item.type === 'prescription') return <Pill className="w-4 h-4" />;
    switch (item.record_type) {
      case 'surgery':
        return <Scissors className="w-4 h-4" />;
      case 'emergency':
        return <Heart className="w-4 h-4" />;
      case 'vaccination':
        return <Thermometer className="w-4 h-4" />;
      default:
        return <Stethoscope className="w-4 h-4" />;
    }
  };

  const getTypeColor = (item: TimelineItem): string => {
    if (item.type === 'prescription') return 'bg-purple-500';
    switch (item.record_type) {
      case 'surgery':
        return 'bg-red-500';
      case 'emergency':
        return 'bg-orange-500';
      case 'vaccination':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getTypeBadge = (item: TimelineItem): { label: string; color: string } => {
    if (item.type === 'prescription') {
      return { label: 'Receta', color: 'bg-purple-100 text-purple-700' };
    }
    switch (item.record_type) {
      case 'surgery':
        return { label: 'Cirugía', color: 'bg-red-100 text-red-700' };
      case 'emergency':
        return { label: 'Emergencia', color: 'bg-orange-100 text-orange-700' };
      case 'vaccination':
        return { label: 'Vacunación', color: 'bg-green-100 text-green-700' };
      default:
        return { label: 'Consulta', color: 'bg-blue-100 text-blue-700' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Historial Médico
          </h2>
          <p className="text-sm text-gray-500">
            {timelineItems.length} registro{timelineItems.length !== 1 ? 's' : ''} médico{timelineItems.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isStaff && (
          <div className="flex gap-2">
            <Link
              href={`/${clinic}/portal/prescriptions/new?pet_id=${petId}`}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-medium text-sm hover:bg-purple-200 transition-colors"
            >
              <Pill className="w-4 h-4" />
              Nueva Receta
            </Link>
            <Link
              href={`/${clinic}/portal/pets/${petId}/records/new`}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Nueva Consulta
            </Link>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar en historial..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 outline-none text-sm"
          />
        </div>

        {/* Type filter */}
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="appearance-none pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 outline-none text-sm bg-white cursor-pointer"
          >
            <option value="all">Todos los registros</option>
            <option value="consultation">Consultas</option>
            <option value="surgery">Cirugías</option>
            <option value="prescription">Recetas</option>
            <option value="vaccination">Vacunaciones</option>
            <option value="emergency">Emergencias</option>
          </select>
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Timeline */}
      {filteredItems.length > 0 ? (
        <div className="relative border-l-2 border-dashed border-gray-200 ml-4 space-y-6 pb-6">
          {filteredItems.map((item) => {
            const isExpanded = expandedItems.has(item.id);
            const typeBadge = getTypeBadge(item);

            return (
              <div key={item.id} className="ml-8 relative">
                {/* Timeline Node */}
                <div className={`absolute -left-[41px] top-0 w-5 h-5 rounded-full border-4 border-white shadow-sm ${getTypeColor(item)}`} />

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  {/* Header - Always visible */}
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className="w-full p-4 text-left flex items-start justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${typeBadge.color}`}>
                          {getTypeIcon(item)}
                          {typeBadge.label}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                      <h3 className="font-bold text-[var(--text-primary)]">{item.title}</h3>
                      {item.diagnosis && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">{item.diagnosis}</p>
                      )}
                      {item.vet_name && (
                        <p className="text-xs text-gray-400 mt-1">Dr. {item.vet_name}</p>
                      )}
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
                      {/* Vitals */}
                      {item.vitals && (item.vitals.weight || item.vitals.temp || item.vitals.hr || item.vitals.rr) && (
                        <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                          <span className="text-xs font-bold text-blue-600 uppercase mb-2 block">Signos Vitales</span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                            {item.vitals.weight && (
                              <div>
                                <span className="text-gray-400 text-xs">Peso</span>
                                <p className="font-bold text-gray-700">{item.vitals.weight} kg</p>
                              </div>
                            )}
                            {item.vitals.temp && (
                              <div>
                                <span className="text-gray-400 text-xs">Temp</span>
                                <p className="font-bold text-gray-700">{item.vitals.temp}°C</p>
                              </div>
                            )}
                            {item.vitals.hr && (
                              <div>
                                <span className="text-gray-400 text-xs">FC</span>
                                <p className="font-bold text-gray-700">{item.vitals.hr} lpm</p>
                              </div>
                            )}
                            {item.vitals.rr && (
                              <div>
                                <span className="text-gray-400 text-xs">FR</span>
                                <p className="font-bold text-gray-700">{item.vitals.rr} rpm</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Medications (for prescriptions) */}
                      {item.medications && item.medications.length > 0 && (
                        <div>
                          <span className="text-xs font-bold text-purple-600 uppercase mb-2 block">Medicamentos</span>
                          <div className="space-y-2">
                            {item.medications.map((med, idx) => (
                              <div key={idx} className="bg-purple-50/50 p-3 rounded-lg border border-purple-100/50">
                                <p className="font-bold text-purple-900 text-sm">{med.name}</p>
                                <p className="text-xs text-purple-700">
                                  {med.dose} • {med.frequency} • {med.duration}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {item.notes && (
                        <div className="bg-gray-50 p-3 rounded-xl text-sm text-gray-600 italic">
                          "{item.notes}"
                        </div>
                      )}

                      {/* Attachments and actions */}
                      <div className="flex flex-wrap gap-2">
                        {item.type === 'prescription' && (
                          <button className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors">
                            <Download className="w-3 h-3" />
                            Descargar PDF
                          </button>
                        )}
                        {item.attachments?.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                          >
                            <Paperclip className="w-3 h-3" />
                            Adjunto {idx + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">
            {searchQuery || filter !== 'all' ? 'Sin resultados' : 'Sin historial médico'}
          </h3>
          <p className="text-sm text-gray-500 mb-4 max-w-xs mx-auto">
            {searchQuery || filter !== 'all'
              ? 'No se encontraron registros con estos filtros'
              : `No hay registros médicos para ${petName}`}
          </p>
          {filter !== 'all' && (
            <button
              onClick={() => {
                setFilter('all');
                setSearchQuery('');
              }}
              className="text-[var(--primary)] font-medium text-sm hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}
