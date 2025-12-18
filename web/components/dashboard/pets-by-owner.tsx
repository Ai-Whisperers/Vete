"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  PawPrint,
  Search,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Plus,
  Syringe,
  Activity,
} from "lucide-react";

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  date_of_birth: string | null;
  photo_url: string | null;
  sex: string | null;
  neutered: boolean | null;
  microchip_id: string | null;
}

interface Owner {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  created_at: string;
  last_visit: string | null;
  pets: Pet[];
}

interface PetsByOwnerProps {
  clinic: string;
  owners: Owner[];
}

export function PetsByOwner({ clinic, owners }: PetsByOwnerProps): React.ReactElement {
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(
    owners.length > 0 ? owners[0].id : null
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Filter owners based on search
  const filteredOwners = useMemo(() => {
    if (!searchQuery.trim()) return owners;
    const query = searchQuery.toLowerCase();
    return owners.filter(
      (owner) =>
        owner.full_name.toLowerCase().includes(query) ||
        owner.email.toLowerCase().includes(query) ||
        owner.phone?.toLowerCase().includes(query) ||
        owner.pets.some(
          (pet) =>
            pet.name.toLowerCase().includes(query) ||
            pet.species.toLowerCase().includes(query) ||
            pet.breed?.toLowerCase().includes(query)
        )
    );
  }, [owners, searchQuery]);

  const selectedOwner = filteredOwners.find((o) => o.id === selectedOwnerId) || filteredOwners[0] || null;

  // Helper functions
  const formatDate = (date: string | null): string => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("es-PY", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateAge = (dob: string | null): string => {
    if (!dob) return "Edad desconocida";
    const birth = new Date(dob);
    const today = new Date();
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();

    if (years === 0) {
      const adjustedMonths = months < 0 ? 12 + months : months;
      return `${adjustedMonths} ${adjustedMonths === 1 ? "mes" : "meses"}`;
    }
    const adjustedYears = months < 0 ? years - 1 : years;
    return `${adjustedYears} ${adjustedYears === 1 ? "año" : "años"}`;
  };

  const isClientActive = (lastVisit: string | null): boolean => {
    if (!lastVisit) return false;
    const daysSinceVisit = Math.floor(
      (Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceVisit <= 90;
  };

  const getSpeciesEmoji = (species: string): string => {
    const speciesMap: Record<string, string> = {
      perro: "🐕",
      dog: "🐕",
      gato: "🐱",
      cat: "🐱",
      ave: "🦜",
      bird: "🦜",
      conejo: "🐰",
      rabbit: "🐰",
      hamster: "🐹",
      pez: "🐠",
      fish: "🐠",
      tortuga: "🐢",
      turtle: "🐢",
      reptil: "🦎",
      reptile: "🦎",
    };
    return speciesMap[species.toLowerCase()] || "🐾";
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)]">
      {/* Left Panel - Owner List */}
      <div className="w-full lg:w-96 flex flex-col bg-white rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
        {/* Search Header */}
        <div className="p-4 border-b border-[var(--border-color)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Buscar propietario o mascota..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            {filteredOwners.length} propietario{filteredOwners.length !== 1 ? "s" : ""}
            {searchQuery && ` encontrado${filteredOwners.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Owner List */}
        <div className="flex-1 overflow-y-auto">
          {filteredOwners.length === 0 ? (
            <div className="p-8 text-center">
              <User className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-3 opacity-50" />
              <p className="text-sm text-[var(--text-secondary)]">
                {searchQuery ? "No se encontraron resultados" : "No hay propietarios registrados"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-color)]">
              {filteredOwners.map((owner) => (
                <button
                  key={owner.id}
                  onClick={() => setSelectedOwnerId(owner.id)}
                  className={`w-full p-4 text-left transition-colors hover:bg-[var(--bg-subtle)] ${
                    selectedOwner?.id === owner.id
                      ? "bg-[var(--primary)] bg-opacity-5 border-l-4 border-l-[var(--primary)]"
                      : "border-l-4 border-l-transparent"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-[var(--primary)] bg-opacity-10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[var(--primary)] font-semibold">
                        {owner.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-[var(--text-primary)] truncate">
                          {owner.full_name}
                        </p>
                        {isClientActive(owner.last_visit) ? (
                          <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full" title="Activo" />
                        ) : (
                          <span className="flex-shrink-0 w-2 h-2 bg-orange-400 rounded-full" title="Inactivo" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <PawPrint className="w-3 h-3" />
                        <span>
                          {owner.pets.length} mascota{owner.pets.length !== 1 ? "s" : ""}
                        </span>
                        {owner.phone && (
                          <>
                            <span className="text-[var(--border-color)]">•</span>
                            <span className="truncate">{owner.phone}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight
                      className={`w-5 h-5 flex-shrink-0 transition-colors ${
                        selectedOwner?.id === owner.id
                          ? "text-[var(--primary)]"
                          : "text-[var(--text-secondary)]"
                      }`}
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Owner Details & Pets */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
        {selectedOwner ? (
          <>
            {/* Owner Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-[var(--border-color)] p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* Owner Info */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-[var(--primary)] bg-opacity-10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-[var(--primary)]">
                      {selectedOwner.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-[var(--text-primary)]">
                        {selectedOwner.full_name}
                      </h2>
                      {isClientActive(selectedOwner.last_visit) ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                          <AlertCircle className="w-3 h-3" />
                          Inactivo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Cliente desde {formatDate(selectedOwner.created_at)}
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/${clinic}/dashboard/appointments/new?client=${selectedOwner.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Nueva Cita
                  </Link>
                  <Link
                    href={`/${clinic}/dashboard/clients/${selectedOwner.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--border-color)] transition-colors text-sm font-medium"
                  >
                    <FileText className="w-4 h-4" />
                    Ver Ficha
                  </Link>
                </div>
              </div>

              {/* Contact Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-secondary)]">Email</p>
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {selectedOwner.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Phone className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-secondary)]">Teléfono</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {selectedOwner.phone || "No registrado"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-secondary)]">Dirección</p>
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {selectedOwner.address || "No registrada"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Clock className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-secondary)]">Última Visita</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {formatDate(selectedOwner.last_visit)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pets Section */}
            <div className="bg-white rounded-xl shadow-sm border border-[var(--border-color)] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <PawPrint className="w-5 h-5 text-[var(--primary)]" />
                  Mascotas ({selectedOwner.pets.length})
                </h3>
                <Link
                  href={`/${clinic}/dashboard/pets/new?owner=${selectedOwner.id}`}
                  className="text-sm text-[var(--primary)] hover:underline font-medium"
                >
                  + Agregar Mascota
                </Link>
              </div>

              {selectedOwner.pets.length === 0 ? (
                <div className="text-center py-8">
                  <PawPrint className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-[var(--text-secondary)]">
                    Este propietario no tiene mascotas registradas
                  </p>
                  <Link
                    href={`/${clinic}/dashboard/pets/new?owner=${selectedOwner.id}`}
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Registrar Primera Mascota
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedOwner.pets.map((pet) => (
                    <Link
                      key={pet.id}
                      href={`/${clinic}/portal/pets/${pet.id}`}
                      className="group flex items-start gap-4 p-4 bg-[var(--bg-subtle)] rounded-xl hover:shadow-md transition-all border border-transparent hover:border-[var(--primary)]"
                    >
                      {/* Pet Photo */}
                      <div className="relative">
                        {pet.photo_url ? (
                          <img
                            src={pet.photo_url}
                            alt={pet.name}
                            className="w-20 h-20 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-[var(--primary)] bg-opacity-10 flex items-center justify-center">
                            <span className="text-3xl">{getSpeciesEmoji(pet.species)}</span>
                          </div>
                        )}
                      </div>

                      {/* Pet Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                            {pet.name}
                          </h4>
                          {pet.sex && (
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              pet.sex === "male"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-pink-100 text-pink-700"
                            }`}>
                              {pet.sex === "male" ? "♂" : "♀"}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] capitalize mb-2">
                          {pet.species} {pet.breed && `• ${pet.breed}`}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-md text-[var(--text-secondary)]">
                            <Calendar className="w-3 h-3" />
                            {calculateAge(pet.date_of_birth)}
                          </span>
                          {pet.neutered && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-md text-[var(--text-secondary)]">
                              <Activity className="w-3 h-3" />
                              Esterilizado
                            </span>
                          )}
                          {pet.microchip_id && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-md text-[var(--text-secondary)]" title={pet.microchip_id}>
                              <span className="w-3 h-3 flex items-center justify-center">📍</span>
                              Chip
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/${clinic}/dashboard/appointments/new?pet=${pet.id}`}
                          className="p-1.5 bg-white rounded-lg hover:bg-[var(--primary)] hover:text-white transition-colors"
                          title="Nueva Cita"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Calendar className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/${clinic}/portal/pets/${pet.id}/vaccines`}
                          className="p-1.5 bg-white rounded-lg hover:bg-[var(--primary)] hover:text-white transition-colors"
                          title="Vacunas"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Syringe className="w-4 h-4" />
                        </Link>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white rounded-xl shadow-sm border border-[var(--border-color)]">
            <div className="text-center p-8">
              <User className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-[var(--text-primary)] mb-2">
                Selecciona un propietario
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                Elige un propietario de la lista para ver sus mascotas
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
