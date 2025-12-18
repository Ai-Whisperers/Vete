"use client";

import type { JSX } from 'react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, X, AlertCircle, XCircle } from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  date_of_birth: string;
  weight: number;
  owner: {
    full_name: string;
    phone: string;
  };
}

interface Kennel {
  id: string;
  kennel_number: string;
  kennel_type: string;
  size: string;
  location: string;
}

interface AdmissionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AdmissionForm({ onSuccess, onCancel }: AdmissionFormProps): JSX.Element {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pets, setPets] = useState<Pet[]>([]);
  const [kennels, setKennels] = useState<Kennel[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  // TICKET-FORM-002: Replace alert() with proper error state
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    pet_id: '',
    kennel_id: '',
    hospitalization_type: 'medical',
    admission_diagnosis: '',
    treatment_plan: '',
    diet_instructions: '',
    acuity_level: 'routine',
    estimated_discharge_date: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [selectedKennel, setSelectedKennel] = useState<Kennel | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchAvailableKennels();
  }, []);

  const fetchAvailableKennels = async (): Promise<void> => {
    try {
      const response = await fetch('/api/kennels?status=available');
      if (!response.ok) throw new Error('Error al cargar jaulas');
      const data = await response.json();
      setKennels(data);
    } catch {
      // Error fetching kennels - silently fail
    }
  };

  const searchPets = async (): Promise<void> => {
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autorizado');

      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      const { data, error } = await supabase
        .from('pets')
        .select(`
          id, name, species, breed, date_of_birth, weight,
          owner:profiles!pets_owner_id_fkey(full_name, phone)
        `)
        .eq('tenant_id', profile?.tenant_id)
        .or(`name.ilike.%${searchQuery}%,microchip_number.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      setPets(data || []);
    } catch {
      // Error searching pets - silently fail
    } finally {
      setSearchLoading(false);
    }
  };

  const handlePetSelect = (pet: Pet): void => {
    setSelectedPet(pet);
    setFormData({ ...formData, pet_id: pet.id });

    // Auto-fill emergency contact from owner
    if (pet.owner) {
      setFormData(prev => ({
        ...prev,
        pet_id: pet.id,
        emergency_contact_name: pet.owner.full_name,
        emergency_contact_phone: pet.owner.phone,
      }));
    }
  };

  const handleKennelSelect = (kennel: Kennel): void => {
    setSelectedKennel(kennel);
    setFormData({ ...formData, kennel_id: kennel.id });
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    // TICKET-FORM-002: Clear previous errors
    setFormError(null);

    try {
      const response = await fetch('/api/hospitalizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear hospitalización');
      }

      onSuccess();
    } catch (error) {
      // TICKET-FORM-002: Use error state instead of alert()
      setFormError(error instanceof Error ? error.message : 'Error al crear hospitalización');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string): string => {
    const birth = new Date(dateOfBirth);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();

    if (years > 0) {
      return `${years} año${years > 1 ? 's' : ''}`;
    }
    return `${months} mes${months !== 1 ? 'es' : ''}`;
  };

  return (
    <div className="bg-[var(--bg-default)] rounded-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          Nueva Admisión
        </h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* TICKET-FORM-002, TICKET-A11Y-004: Error Display with accessibility */}
      {formError && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center gap-3 text-red-700">
            <XCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <p className="font-medium">{formError}</p>
            <button
              type="button"
              onClick={() => setFormError(null)}
              className="ml-auto hover:opacity-70"
              aria-label="Cerrar mensaje de error"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="flex items-center gap-4 mb-8">
        <div className={`flex-1 h-2 rounded ${step >= 1 ? 'bg-[var(--primary)]' : 'bg-gray-300'}`} />
        <div className={`flex-1 h-2 rounded ${step >= 2 ? 'bg-[var(--primary)]' : 'bg-gray-300'}`} />
        <div className={`flex-1 h-2 rounded ${step >= 3 ? 'bg-[var(--primary)]' : 'bg-gray-300'}`} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Select Pet */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              Seleccionar Paciente
            </h3>

            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchPets())}
                  placeholder="Buscar por nombre o microchip..."
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-default)] text-[var(--text-primary)]"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-secondary)]" />
              </div>
              <button
                type="button"
                onClick={searchPets}
                disabled={searchLoading}
                className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                Buscar
              </button>
            </div>

            {selectedPet ? (
              <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border-2 border-[var(--primary)]">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-[var(--text-primary)]">
                      {selectedPet.name}
                    </h4>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {selectedPet.species} - {selectedPet.breed}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {calculateAge(selectedPet.date_of_birth)} • {selectedPet.weight} kg
                    </p>
                    <p className="text-sm text-[var(--text-secondary)] mt-2">
                      <strong>Dueño:</strong> {selectedPet.owner?.full_name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPet(null);
                      setFormData({ ...formData, pet_id: '' });
                    }}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    Cambiar
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-2 max-h-96 overflow-y-auto">
                {pets.map((pet) => (
                  <button
                    key={pet.id}
                    type="button"
                    onClick={() => handlePetSelect(pet)}
                    className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] hover:border-[var(--primary)] text-left transition-colors"
                  >
                    <div className="font-medium text-[var(--text-primary)]">
                      {pet.name}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">
                      {pet.species} - {pet.breed} • {calculateAge(pet.date_of_birth)}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">
                      Dueño: {pet.owner?.full_name}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!selectedPet}
              className="w-full py-3 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuar
            </button>
          </div>
        )}

        {/* Step 2: Select Kennel & Basic Info */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              Asignar Jaula y Detalles
            </h3>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Tipo de Hospitalización *
              </label>
              <select
                required
                value={formData.hospitalization_type}
                onChange={(e) => setFormData({ ...formData, hospitalization_type: e.target.value })}
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-default)] text-[var(--text-primary)]"
              >
                <option value="medical">Médica</option>
                <option value="surgical">Quirúrgica</option>
                <option value="icu">Cuidados Intensivos</option>
                <option value="isolation">Aislamiento</option>
                <option value="boarding">Pensión</option>
                <option value="observation">Observación</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Nivel de Acuidad
              </label>
              <select
                value={formData.acuity_level}
                onChange={(e) => setFormData({ ...formData, acuity_level: e.target.value })}
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-default)] text-[var(--text-primary)]"
              >
                <option value="routine">Rutina</option>
                <option value="urgent">Urgente</option>
                <option value="critical">Crítico</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Seleccionar Jaula *
              </label>
              {selectedKennel ? (
                <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border-2 border-[var(--primary)]">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-[var(--text-primary)]">
                        Jaula {selectedKennel.kennel_number}
                      </div>
                      <div className="text-sm text-[var(--text-secondary)]">
                        {selectedKennel.kennel_type} - {selectedKennel.size}
                      </div>
                      <div className="text-sm text-[var(--text-secondary)]">
                        {selectedKennel.location}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedKennel(null);
                        setFormData({ ...formData, kennel_id: '' });
                      }}
                      className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      Cambiar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {kennels.length === 0 ? (
                    <div className="col-span-full p-4 text-center text-[var(--text-secondary)]">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      No hay jaulas disponibles
                    </div>
                  ) : (
                    kennels.map((kennel) => (
                      <button
                        key={kennel.id}
                        type="button"
                        onClick={() => handleKennelSelect(kennel)}
                        className="p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] hover:border-[var(--primary)] text-left transition-colors"
                      >
                        <div className="font-semibold text-[var(--text-primary)]">
                          {kennel.kennel_number}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)]">
                          {kennel.kennel_type}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)]">
                          {kennel.size}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)]">
                          {kennel.location}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Diagnóstico de Admisión *
              </label>
              <textarea
                required
                rows={3}
                value={formData.admission_diagnosis}
                onChange={(e) => setFormData({ ...formData, admission_diagnosis: e.target.value })}
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-default)] text-[var(--text-primary)]"
                placeholder="Ingrese el diagnóstico o razón de admisión..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-[var(--border)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-secondary)]"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!selectedKennel || !formData.admission_diagnosis}
                className="flex-1 py-3 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Treatment Plan & Emergency Contact */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              Plan de Tratamiento y Contacto
            </h3>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Plan de Tratamiento
              </label>
              <textarea
                rows={4}
                value={formData.treatment_plan}
                onChange={(e) => setFormData({ ...formData, treatment_plan: e.target.value })}
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-default)] text-[var(--text-primary)]"
                placeholder="Describa el plan de tratamiento..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Instrucciones de Dieta
              </label>
              <textarea
                rows={3}
                value={formData.diet_instructions}
                onChange={(e) => setFormData({ ...formData, diet_instructions: e.target.value })}
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-default)] text-[var(--text-primary)]"
                placeholder="Instrucciones de alimentación..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Fecha Estimada de Alta
              </label>
              <input
                type="date"
                value={formData.estimated_discharge_date}
                onChange={(e) => setFormData({ ...formData, estimated_discharge_date: e.target.value })}
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-default)] text-[var(--text-primary)]"
              />
            </div>

            <div className="border-t border-[var(--border)] pt-4 mt-4">
              <h4 className="font-medium text-[var(--text-primary)] mb-3">
                Contacto de Emergencia
              </h4>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-default)] text-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-default)] text-[var(--text-primary)]"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-3 border border-[var(--border)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-secondary)]"
              >
                Atrás
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Completar Admisión'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
