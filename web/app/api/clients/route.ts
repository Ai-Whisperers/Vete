import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface Client {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
  pet_count: number;
  last_appointment: string | null;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ClientsResponse {
  clients: Client[];
  pagination: PaginationInfo;
}

export async function GET(request: NextRequest): Promise<NextResponse<ClientsResponse | { error: string }>> {
  const supabase = await createClient();

  // 1. Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // 2. Get user profile to check role and tenant
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Error al obtener perfil de usuario" }, { status: 500 });
  }

  // 3. Check if user is staff (vet or admin)
  if (!['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: "No autorizado. Solo personal autorizado puede acceder." }, { status: 403 });
  }

  // 4. Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
  const sortField = searchParams.get('sort') || 'created_at';
  const sortOrder = searchParams.get('order') === 'asc' ? 'asc' : 'desc';

  // Validate sort field to prevent SQL injection
  const allowedSortFields = ['full_name', 'email', 'created_at', 'pet_count', 'last_appointment'];
  const validSortField = allowedSortFields.includes(sortField) ? sortField : 'created_at';

  const offset = (page - 1) * limit;

  try {
    // 5. Build base query for clients (owners only, in this tenant)
    let query = supabase
      .from('profiles')
      .select('id, full_name, email, phone, created_at', { count: 'exact' })
      .eq('tenant_id', profile.tenant_id)
      .eq('role', 'owner');

    // 6. Apply search filter if provided
    if (search.trim()) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    // 7. Get total count for pagination
    const { count: totalCount, error: countError } = await query;

    if (countError) {
      console.error('Error counting clients:', countError);
      return NextResponse.json({ error: "Error al contar clientes" }, { status: 500 });
    }

    // 8. Apply sorting and pagination
    query = query.order(validSortField === 'pet_count' || validSortField === 'last_appointment' ? 'created_at' : validSortField, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    const { data: clients, error: clientsError } = await query;

    if (clientsError) {
      console.error('Error fetching clients:', clientsError);
      return NextResponse.json({ error: "Error al obtener clientes" }, { status: 500 });
    }

    if (!clients) {
      return NextResponse.json({ error: "No se encontraron clientes" }, { status: 404 });
    }

    // 9. For each client, get pet count and last appointment
    const clientIds = clients.map(c => c.id);

    // Get pet counts
    const { data: petCounts, error: petCountsError } = await supabase
      .from('pets')
      .select('owner_id')
      .in('owner_id', clientIds)
      .eq('tenant_id', profile.tenant_id);

    if (petCountsError) {
      console.error('Error fetching pet counts:', petCountsError);
    }

    // Count pets per owner
    const petCountMap = new Map<string, number>();
    if (petCounts) {
      petCounts.forEach(pet => {
        const count = petCountMap.get(pet.owner_id) || 0;
        petCountMap.set(pet.owner_id, count + 1);
      });
    }

    // Get last appointments
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('pet_id, appointment_date')
      .eq('tenant_id', profile.tenant_id)
      .order('appointment_date', { ascending: false });

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError);
    }

    // Get pets to map appointments to owners
    const { data: pets, error: petsError } = await supabase
      .from('pets')
      .select('id, owner_id')
      .in('owner_id', clientIds)
      .eq('tenant_id', profile.tenant_id);

    if (petsError) {
      console.error('Error fetching pets:', petsError);
    }

    // Create pet to owner mapping
    const petToOwnerMap = new Map<string, string>();
    if (pets) {
      pets.forEach(pet => {
        petToOwnerMap.set(pet.id, pet.owner_id);
      });
    }

    // Find last appointment per owner
    const lastAppointmentMap = new Map<string, string>();
    if (appointments && pets) {
      appointments.forEach(appointment => {
        const ownerId = petToOwnerMap.get(appointment.pet_id);
        if (ownerId && !lastAppointmentMap.has(ownerId)) {
          lastAppointmentMap.set(ownerId, appointment.appointment_date);
        }
      });
    }

    // 10. Combine data
    let enrichedClients: Client[] = clients.map(client => ({
      id: client.id,
      full_name: client.full_name || '',
      email: client.email || '',
      phone: client.phone || null,
      created_at: client.created_at,
      pet_count: petCountMap.get(client.id) || 0,
      last_appointment: lastAppointmentMap.get(client.id) || null
    }));

    // 11. Apply sorting for pet_count and last_appointment (can't do in SQL easily)
    if (validSortField === 'pet_count') {
      enrichedClients.sort((a, b) => {
        const diff = a.pet_count - b.pet_count;
        return sortOrder === 'asc' ? diff : -diff;
      });
    } else if (validSortField === 'last_appointment') {
      enrichedClients.sort((a, b) => {
        if (!a.last_appointment && !b.last_appointment) return 0;
        if (!a.last_appointment) return sortOrder === 'asc' ? 1 : -1;
        if (!b.last_appointment) return sortOrder === 'asc' ? -1 : 1;
        const diff = new Date(a.last_appointment).getTime() - new Date(b.last_appointment).getTime();
        return sortOrder === 'asc' ? diff : -diff;
      });
    }

    // 12. Calculate pagination info
    const total = totalCount || 0;
    const totalPages = Math.ceil(total / limit);

    const response: ClientsResponse = {
      clients: enrichedClients,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Unexpected error in clients API:', error);
    return NextResponse.json({ error: "Error inesperado al procesar la solicitud" }, { status: 500 });
  }
}
