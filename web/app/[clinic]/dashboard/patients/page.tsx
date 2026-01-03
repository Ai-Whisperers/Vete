import { getClinicData } from "@/lib/clinics";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { PawPrint, Users, ArrowLeft } from "lucide-react";
import { PetsByOwner } from "@/components/dashboard/pets-by-owner";

interface Props {
  params: Promise<{ clinic: string }>;
}

export async function generateStaticParams(): Promise<Array<{ clinic: string }>> {
  return [{ clinic: "adris" }, { clinic: "petlife" }];
}

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

interface RawOwnerData {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  created_at: string;
  pets: Pet[];
  appointments: Array<{ appointment_date: string }>;
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

export default async function PatientsPage({ params }: Props): Promise<React.ReactElement> {
  const { clinic } = await params;
  const clinicData = await getClinicData(clinic);

  if (!clinicData) {
    notFound();
  }

  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${clinic}/portal/login`);
  }

  // Check staff role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile || !["vet", "admin"].includes(profile.role)) {
    redirect(`/${clinic}/portal/dashboard`);
  }

  // Fetch all owners with their pets
  const { data: rawOwners, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      email,
      phone,
      address,
      created_at,
      pets (
        id,
        name,
        species,
        breed,
        date_of_birth,
        photo_url,
        sex,
        neutered,
        microchip_id
      ),
      appointments (
        appointment_date
      )
    `
    )
    .eq("tenant_id", profile.tenant_id)
    .eq("role", "owner")
    .order("full_name", { ascending: true });

  if (error) {
    console.error("Error fetching owners:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg p-4" style={{ backgroundColor: "var(--status-error-bg)", border: "1px solid var(--status-error-light)" }}>
          <p style={{ color: "var(--status-error-dark)" }}>Error al cargar los datos. Por favor, intente nuevamente.</p>
        </div>
      </div>
    );
  }

  // Transform data to get last visit
  const owners: Owner[] = (rawOwners as unknown as RawOwnerData[] || []).map((owner) => {
    const appointments = Array.isArray(owner.appointments) ? owner.appointments : [];
    const lastVisit =
      appointments.length > 0
        ? appointments.sort(
            (a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
          )[0]?.appointment_date
        : null;

    const pets = Array.isArray(owner.pets) ? owner.pets : [];

    return {
      id: owner.id,
      full_name: owner.full_name || "Sin nombre",
      email: owner.email,
      phone: owner.phone,
      address: owner.address,
      created_at: owner.created_at,
      last_visit: lastVisit,
      pets: pets.map((pet) => ({
        id: pet.id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        date_of_birth: pet.date_of_birth,
        photo_url: pet.photo_url,
        sex: pet.sex,
        neutered: pet.neutered,
        microchip_id: pet.microchip_id,
      })),
    };
  });

  // Calculate stats
  const totalPets = owners.reduce((sum, owner) => sum + owner.pets.length, 0);
  const ownersWithPets = owners.filter((o) => o.pets.length > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/${clinic}/dashboard/clients`}
          className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Clientes
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--primary)] bg-opacity-10 rounded-lg">
              <PawPrint className="h-6 w-6 text-[var(--primary)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                Pacientes por Propietario
              </h1>
              <p className="text-sm text-[var(--text-secondary)]">
                Vista agrupada de mascotas por cada propietario
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-[var(--border-color)]">
              <Users className="w-5 h-5 text-[var(--primary)]" />
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Propietarios</p>
                <p className="font-bold text-[var(--text-primary)]">{ownersWithPets}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-[var(--border-color)]">
              <PawPrint className="w-5 h-5 text-[var(--primary)]" />
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Mascotas</p>
                <p className="font-bold text-[var(--text-primary)]">{totalPets}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <PetsByOwner clinic={clinic} owners={owners} />
    </div>
  );
}
