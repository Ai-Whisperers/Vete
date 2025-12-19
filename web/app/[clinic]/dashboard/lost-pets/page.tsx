"use client";

import type { JSX } from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Search,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  AlertCircle,
  Eye,
  Clock,
  Heart,
} from 'lucide-react';

interface LostPetReport {
  id: string;
  status: 'lost' | 'found' | 'reunited';
  last_seen_location: string | null;
  last_seen_date: string | null;
  finder_contact: string | null;
  finder_notes: string | null;
  notes: string | null;
  created_at: string;
  resolved_at: string | null;
  pet: {
    id: string;
    name: string;
    species: string;
    breed: string;
    photo_url: string | null;
    owner: {
      id: string;
      full_name: string;
      phone: string | null;
      email: string | null;
    };
  };
  reported_by_user: {
    full_name: string;
  } | null;
  resolved_by_user: {
    full_name: string;
  } | null;
}

export default function LostPetsPage(): JSX.Element {
  const params = useParams();
  const clinic = params?.clinic as string;

  const [reports, setReports] = useState<LostPetReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'lost' | 'found' | 'reunited'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<LostPetReport | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async (): Promise<void> => {
    setLoading(true);
    try {
      const url = filter === 'all'
        ? '/api/lost-pets'
        : `/api/lost-pets?status=${filter}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error('Error al cargar');

      const result = await response.json();
      setReports(result.data || []);
    } catch (error) {
      console.error('Error fetching lost pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string): Promise<void> => {
    if (!confirm(`¿Cambiar estado a "${getStatusLabel(newStatus)}"?`)) return;

    setUpdating(true);
    try {
      const response = await fetch('/api/lost-pets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!response.ok) throw new Error('Error al actualizar');

      alert('Estado actualizado exitosamente');
      fetchReports();
      setSelectedReport(null);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar estado');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      lost: 'Perdido',
      found: 'Encontrado',
      reunited: 'Reunido',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'lost':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'found':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reunited':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string): JSX.Element => {
    switch (status) {
      case 'lost':
        return <AlertCircle className="h-4 w-4" />;
      case 'found':
        return <Eye className="h-4 w-4" />;
      case 'reunited':
        return <Heart className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('es-PY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const filteredReports = reports.filter(report => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      report.pet.name.toLowerCase().includes(search) ||
      report.pet.owner.full_name.toLowerCase().includes(search) ||
      report.last_seen_location?.toLowerCase().includes(search)
    );
  });

  // Stats
  const stats = {
    total: reports.length,
    lost: reports.filter(r => r.status === 'lost').length,
    found: reports.filter(r => r.status === 'found').length,
    reunited: reports.filter(r => r.status === 'reunited').length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Mascotas Perdidas y Encontradas
        </h1>
        <p className="text-[var(--text-secondary)]">
          Gestionar reportes de mascotas perdidas y encontradas
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-medium">Total</span>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-medium">Perdidos</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.lost}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 text-yellow-600 mb-1">
            <Eye className="w-4 h-4" />
            <span className="text-xs font-medium">Encontrados</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.found}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <Heart className="w-4 h-4" />
            <span className="text-xs font-medium">Reunidos</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.reunited}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Buscar por nombre, propietario o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-default)] text-[var(--text-primary)]"
          />
        </div>

        <div className="flex gap-2">
          {(['all', 'lost', 'found', 'reunited'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-default)]'
              }`}
            >
              {status === 'all' ? 'Todos' : getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-[var(--text-secondary)]">Cargando...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-12 bg-[var(--bg-secondary)] rounded-lg">
          <AlertCircle className="h-12 w-12 text-[var(--text-secondary)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">No hay reportes</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Pet Photo */}
                <div className="w-16 h-16 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center overflow-hidden flex-shrink-0">
                  {report.pet.photo_url ? (
                    <img
                      src={report.pet.photo_url}
                      alt={report.pet.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">🐾</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[var(--text-primary)]">
                      {report.pet.name}
                    </h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                      {getStatusIcon(report.status)}
                      {getStatusLabel(report.status)}
                    </span>
                  </div>

                  <p className="text-sm text-[var(--text-secondary)]">
                    {report.pet.species} • {report.pet.breed}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <MapPin className="h-4 w-4" />
                      <span>{report.last_seen_location || 'Ubicación no especificada'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Calendar className="h-4 w-4" />
                      <span>Reportado: {formatDate(report.created_at)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Phone className="h-4 w-4" />
                      <span>{report.pet.owner.phone || 'Sin teléfono'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{report.pet.owner.email || 'Sin email'}</span>
                    </div>
                  </div>

                  {report.finder_contact && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded-lg text-sm">
                      <strong className="text-yellow-800">Contacto del que encontró:</strong>{' '}
                      <span className="text-yellow-700">{report.finder_contact}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {report.status === 'lost' && (
                    <button
                      onClick={() => updateStatus(report.id, 'found')}
                      disabled={updating}
                      className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium hover:bg-yellow-200 disabled:opacity-50"
                    >
                      Marcar Encontrado
                    </button>
                  )}

                  {(report.status === 'lost' || report.status === 'found') && (
                    <button
                      onClick={() => updateStatus(report.id, 'reunited')}
                      disabled={updating}
                      className="px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-sm font-medium hover:bg-green-200 disabled:opacity-50"
                    >
                      Marcar Reunido
                    </button>
                  )}

                  {report.status === 'reunited' && report.resolved_at && (
                    <div className="text-xs text-center text-green-600">
                      <CheckCircle className="h-4 w-4 mx-auto mb-1" />
                      {formatDate(report.resolved_at)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
