import { getClinicData } from "@/lib/clinics";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { logger } from "@/lib/logger";
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
  birth_date: string | null;
  photo_url: string | null;
  sex: string | null;
  is_neutered: boolean | null;
  microchip_number: string | null;
}

interface RawPetData extends Pet {
  owner_id: string;
  appointments: Array<{ start_time: string }>;
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

  // Fetch owners and pets separately (Supabase can't infer profiles→pets reverse relationship)
  const [ownersResult, petsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, phone, address, created_at")
      .eq("tenant_id", profile.tenant_id)
      .eq("role", "owner")
      .order("full_name", { ascending: true }),
    supabase
      .from("pets")
      .select(`
        id,
        owner_id,
        name,
        species,
        breed,
        birth_date,
        photo_url,
        sex,
        is_neutered,
        microchip_number,
        appointments (
          start_time
        )
      `)
      .eq("tenant_id", profile.tenant_id)
      .is("deleted_at", null)
  ]);

  if (ownersResult.error) {
    logger.error("Error fetching owners", { error: ownersResult.error.message });
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg p-4" style={{ backgroundColor: "var(--status-error-bg)", border: "1px solid var(--status-error-light)" }}>
          <p style={{ color: "var(--status-error-dark)" }}>Error al cargar los datos. Por favor, intente nuevamente.</p>
        </div>
      </div>
    );
  }

  const rawOwners = ownersResult.data || [];
  const rawPets = (petsResult.data || []) as RawPetData[];

  // Group pets by owner and calculate last visit
  const petsByOwner = new Map<string, RawPetData[]>();
  for (const pet of rawPets) {
    const ownerPets = petsByOwner.get(pet.owner_id) || [];
    ownerPets.push(pet);
    petsByOwner.set(pet.owner_id, ownerPets);
  }

  // Transform data
  const owners: Owner[] = rawOwners.map((owner) => {
    const ownerPets = petsByOwner.get(owner.id) || [];

    // Collect all appointments from all pets to find the last visit
    const allAppointments: Array<{ start_time: string }> = [];
    for (const pet of ownerPets) {
      const petAppointments = Array.isArray(pet.appointments) ? pet.appointments : [];
      allAppointments.push(...petAppointments);
    }

    const lastVisit =
      allAppointments.length > 0
        ? allAppointments.sort(
            (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
          )[0]?.start_time
        : null;

    return {
      id: owner.id,
      full_name: owner.full_name || "Sin nombre",
      email: owner.email,
      phone: owner.phone,
      address: owner.address,
      created_at: owner.created_at,
      last_visit: lastVisit,
      pets: ownerPets.map((pet) => ({
        id: pet.id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        birth_date: pet.birth_date,
        photo_url: pet.photo_url,
        sex: pet.sex,
        is_neutered: pet.is_neutered,
        microchip_number: pet.microchip_number,
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
