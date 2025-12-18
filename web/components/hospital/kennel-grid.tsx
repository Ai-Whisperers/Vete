"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MapPin, Filter, Package, AlertCircle } from 'lucide-react';

interface Kennel {
  id: string;
  kennel_number: string;
  kennel_type: string;
  size: string;
  location: string;
  kennel_status: string;
  features: string[] | null;
  current_occupant?: {
    id: string;
    hospitalization_number: string;
    pet: {
      id: string;
      name: string;
      species: string;
      breed: string;
    };
  }[];
}

interface KennelGridProps {
  onKennelClick?: (kennel: Kennel) => void;
}

export default function KennelGrid({ onKennelClick }: KennelGridProps): JSX.Element {
  const [kennels, setKennels] = useState<Kennel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const supabase = createClient();

  useEffect(() => {
    fetchKennels();
  }, [filterType, filterStatus, filterLocation]);

  const fetchKennels = async (): Promise<void> => {
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('kennel_type', filterType);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterLocation !== 'all') params.append('location', filterLocation);

      const response = await fetch(`/api/kennels?${params.toString()}`);
      if (!response.ok) throw new Error('Error al cargar jaulas');

      const data = await response.json();
      setKennels(data);
    } catch (error) {
      console.error('Error fetching kennels:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-400 text-green-800';
      case 'occupied':
        return 'bg-blue-100 border-blue-400 text-blue-800';
      case 'cleaning':
        return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      case 'maintenance':
        return 'bg-red-100 border-red-400 text-red-800';
      default:
        return 'bg-gray-100 border-gray-400 text-gray-800';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'occupied':
        return 'Ocupado';
      case 'cleaning':
        return 'Limpieza';
      case 'maintenance':
        return 'Mantenimiento';
      default:
        return status;
    }
  };

  const groupedKennels = kennels.reduce((acc, kennel) => {
    if (!acc[kennel.location]) {
      acc[kennel.location] = [];
    }
    acc[kennel.location].push(kennel);
    return acc;
  }, {} as Record<string, Kennel[]>);

  const locations = [
    ...new Set(kennels.map(k => k.location))
  ].filter(Boolean);

  const types = [
    ...new Set(kennels.map(k => k.kennel_type))
  ].filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-[var(--text-secondary)]">Cargando jaulas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--border)]">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-[var(--text-secondary)]" />
          <h3 className="font-medium text-[var(--text-primary)]">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Estado
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--bg-default)] text-[var(--text-primary)]"
            >
              <option value="all">Todos</option>
              <option value="available">Disponible</option>
              <option value="occupied">Ocupado</option>
              <option value="cleaning">Limpieza</option>
              <option value="maintenance">Mantenimiento</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Tipo
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--bg-default)] text-[var(--text-primary)]"
            >
              <option value="all">Todos</option>
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Ubicación
            </label>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--bg-default)] text-[var(--text-primary)]"
            >
              <option value="all">Todas</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Kennel Grid by Location */}
      {Object.entries(groupedKennels).map(([location, locationKennels]) => (
        <div key={location} className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[var(--primary)]" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              {location}
            </h3>
            <span className="text-sm text-[var(--text-secondary)]">
              ({locationKennels.length} jaulas)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {locationKennels.map((kennel) => {
              const occupant = kennel.current_occupant?.[0];
              return (
                <button
                  key={kennel.id}
                  onClick={() => onKennelClick?.(kennel)}
                  className={`
                    p-4 rounded-lg border-2 transition-all hover:shadow-md
                    ${getStatusColor(kennel.kennel_status)}
                  `}
                >
                  <div className="text-center">
                    <div className="font-bold text-lg mb-1">
                      {kennel.kennel_number}
                    </div>
                    <div className="text-xs mb-2">
                      {kennel.kennel_type}
                    </div>
                    <div className="text-xs mb-1">
                      {kennel.size}
                    </div>
                    <div className="text-xs font-medium">
                      {getStatusLabel(kennel.kennel_status)}
                    </div>

                    {occupant && (
                      <div className="mt-2 pt-2 border-t border-current/20">
                        <div className="text-xs font-medium truncate">
                          {occupant.pet.name}
                        </div>
                        <div className="text-xs opacity-75">
                          {occupant.pet.species}
                        </div>
                      </div>
                    )}

                    {kennel.features && kennel.features.length > 0 && (
                      <div className="mt-2 flex justify-center">
                        <Package className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {kennels.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-[var(--text-secondary)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">
            No se encontraron jaulas con los filtros seleccionados
          </p>
        </div>
      )}
    </div>
  );
}
