"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { getClinicServices, getClinicPets } from "@/app/actions/invoices";

interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  photo_url?: string;
  owner?: {
    id: string;
    full_name: string;
    phone?: string;
    email?: string;
  };
}

interface Service {
  id: string;
  name: string;
  base_price: number;
  category?: string;
}

interface InvoiceFormWrapperProps {
  clinic: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function InvoiceFormWrapper({
  clinic,
  onSuccess,
  onCancel,
}: InvoiceFormWrapperProps): React.ReactElement {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const [servicesResult, petsResult] = await Promise.all([
          getClinicServices(clinic),
          getClinicPets(clinic),
        ]);

        if ("error" in servicesResult && servicesResult.error) {
          setError(servicesResult.error);
          return;
        }

        if ("error" in petsResult && petsResult.error) {
          setError(petsResult.error);
          return;
        }

        setPets(("data" in petsResult ? petsResult.data : []) as Pet[]);
        setServices(("data" in servicesResult ? servicesResult.data : []) as Service[]);
      } catch (err) {
        setError("Error al cargar datos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clinic]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="invoice-form-wrapper">
      <InvoiceForm
        clinic={clinic}
        pets={pets}
        services={services}
        mode="create"
      />
      {onCancel && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="w-full px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
