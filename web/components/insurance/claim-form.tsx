"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { Plus, Trash2, FileText } from 'lucide-react';

interface ClaimFormProps {
  petId?: string;
  invoiceId?: string;
  onSuccess?: (claimId: string) => void;
}

interface Policy {
  id: string;
  policy_number: string;
  plan_name: string;
  insurance_providers: {
    name: string;
  };
}

interface Pet {
  id: string;
  name: string;
  species: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  total: number;
  invoice_items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    line_total: number;
  }>;
}

interface ClaimItem {
  service_date: string;
  service_code: string;
  description: string;
  quantity: number;
  unit_price: number;
  invoice_item_id?: string;
}

export default function ClaimForm({ petId, invoiceId, onSuccess }: ClaimFormProps) {
  const supabase = createClient();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [selectedPolicyId, setSelectedPolicyId] = useState('');
  const [selectedPetId, setSelectedPetId] = useState(petId || '');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(invoiceId || '');

  const [claimType, setClaimType] = useState('illness');
  const [dateOfService, setDateOfService] = useState(new Date().toISOString().split('T')[0]);
  const [diagnosis, setDiagnosis] = useState('');
  const [diagnosisCode, setDiagnosisCode] = useState('');
  const [treatmentDescription, setTreatmentDescription] = useState('');
  const [items, setItems] = useState<ClaimItem[]>([]);
  const [saveAsDraft, setSaveAsDraft] = useState(true);

  useEffect(() => {
    loadPets();
  }, []);

  useEffect(() => {
    if (selectedPetId) {
      loadPolicies(selectedPetId);
      loadInvoices(selectedPetId);
    }
  }, [selectedPetId]);

  useEffect(() => {
    if (selectedInvoiceId) {
      loadInvoiceItems(selectedInvoiceId);
    }
  }, [selectedInvoiceId]);

  const loadPets = async () => {
    const { data } = await supabase
      .from('pets')
      .select('id, name, species')
      .order('name');
    if (data) setPets(data);
  };

  const loadPolicies = async (petId: string) => {
    const { data } = await supabase
      .from('pet_insurance_policies')
      .select(`
        id, policy_number, plan_name,
        insurance_providers(name)
      `)
      .eq('pet_id', petId)
      .eq('status', 'active');
    if (data) setPolicies(data);
  };

  const loadInvoices = async (petId: string) => {
    const { data } = await supabase
      .from('invoices')
      .select(`
        id, invoice_number, total,
        invoice_items(id, description, quantity, unit_price, line_total)
      `)
      .eq('pet_id', petId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setInvoices(data);
  };

  const loadInvoiceItems = async (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice && invoice.invoice_items) {
      const mappedItems = invoice.invoice_items.map(item => ({
        service_date: dateOfService,
        service_code: '',
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        invoice_item_id: item.id
      }));
      setItems(mappedItems);
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        service_date: dateOfService,
        service_code: '',
        description: '',
        quantity: 1,
        unit_price: 0
      }
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // TICKET-TYPE-004: Use union type instead of any
  const updateItem = (index: number, field: keyof ClaimItem, value: string | number | undefined) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPolicyId || !selectedPetId || !diagnosis || !treatmentDescription) {
      showToast('Complete todos los campos requeridos');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/insurance/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policy_id: selectedPolicyId,
          pet_id: selectedPetId,
          invoice_id: selectedInvoiceId || null,
          claim_type: claimType,
          date_of_service: dateOfService,
          diagnosis,
          diagnosis_code: diagnosisCode,
          treatment_description: treatmentDescription,
          items,
          status: saveAsDraft ? 'draft' : 'submitted'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear reclamo');
      }

      const claim = await response.json();
      showToast(saveAsDraft ? 'Reclamo guardado como borrador' : 'Reclamo enviado exitosamente');

      if (onSuccess) {
        onSuccess(claim.id);
      }
    } catch (error) {
      // TICKET-TYPE-004: Proper error handling without any
      showToast(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Pet and Policy Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            Mascota *
          </label>
          <select
            value={selectedPetId}
            onChange={(e) => setSelectedPetId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Seleccionar mascota</option>
            {pets.map(pet => (
              <option key={pet.id} value={pet.id}>
                {pet.name} ({pet.species})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            Póliza de Seguro *
          </label>
          <select
            value={selectedPolicyId}
            onChange={(e) => setSelectedPolicyId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
            disabled={!selectedPetId}
          >
            <option value="">Seleccionar póliza</option>
            {policies.map(policy => (
              <option key={policy.id} value={policy.id}>
                {policy.insurance_providers.name} - {policy.policy_number}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Invoice Selection (Optional) */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
          Factura Relacionada (Opcional)
        </label>
        <select
          value={selectedInvoiceId}
          onChange={(e) => setSelectedInvoiceId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          disabled={!selectedPetId}
        >
          <option value="">Sin factura</option>
          {invoices.map(invoice => (
            <option key={invoice.id} value={invoice.id}>
              {invoice.invoice_number} - Gs. {invoice.total.toLocaleString('es-PY')}
            </option>
          ))}
        </select>
      </div>

      {/* Claim Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            Tipo de Reclamo *
          </label>
          <select
            value={claimType}
            onChange={(e) => setClaimType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          >
            <option value="accident">Accidente</option>
            <option value="illness">Enfermedad</option>
            <option value="wellness">Bienestar</option>
            <option value="preventive">Preventivo</option>
            <option value="emergency">Emergencia</option>
            <option value="surgery">Cirugía</option>
            <option value="hospitalization">Hospitalización</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            Fecha de Servicio *
          </label>
          <input
            type="date"
            value={dateOfService}
            onChange={(e) => setDateOfService(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            Diagnóstico *
          </label>
          <input
            type="text"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Ej: Fractura de fémur"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            Código de Diagnóstico
          </label>
          <input
            type="text"
            value={diagnosisCode}
            onChange={(e) => setDiagnosisCode(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="VeNom/SNOMED (opcional)"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
          Descripción del Tratamiento *
        </label>
        <textarea
          value={treatmentDescription}
          onChange={(e) => setTreatmentDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={3}
          placeholder="Describa el tratamiento realizado"
          required
        />
      </div>

      {/* Line Items */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-[var(--text-primary)]">
            Servicios y Cargos
          </label>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-[var(--primary)] text-white rounded-md hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-start p-3 bg-gray-50 rounded-md">
              <input
                type="date"
                value={item.service_date}
                onChange={(e) => updateItem(index, 'service_date', e.target.value)}
                className="col-span-12 md:col-span-2 px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <input
                type="text"
                value={item.description}
                onChange={(e) => updateItem(index, 'description', e.target.value)}
                placeholder="Descripción"
                className="col-span-12 md:col-span-4 px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                placeholder="Cant."
                className="col-span-4 md:col-span-2 px-2 py-1 border border-gray-300 rounded text-sm"
                min="1"
              />
              <input
                type="number"
                value={item.unit_price}
                onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                placeholder="Precio"
                className="col-span-6 md:col-span-3 px-2 py-1 border border-gray-300 rounded text-sm"
                min="0"
                step="0.01"
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="col-span-2 md:col-span-1 p-1 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="mt-3 flex justify-end">
            <div className="text-right">
              <p className="text-sm text-[var(--text-secondary)]">Total Reclamado</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">
                Gs. {totalAmount.toLocaleString('es-PY')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Submit Actions */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="saveAsDraft"
            checked={saveAsDraft}
            onChange={(e) => setSaveAsDraft(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="saveAsDraft" className="text-sm text-[var(--text-secondary)]">
            Guardar como borrador
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-[var(--primary)] text-white rounded-md hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : saveAsDraft ? 'Guardar Borrador' : 'Enviar Reclamo'}
          </button>
        </div>
      </div>
    </form>
  );
}
