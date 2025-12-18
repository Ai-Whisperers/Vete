import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

interface SearchResult {
  id: string;
  type: "pet" | "appointment" | "product" | "client";
  title: string;
  subtitle?: string;
  icon?: string;
  url?: string;
}

// GET /api/search?q=query&clinic=clinic_slug
export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const clinic = searchParams.get("clinic");

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  if (!clinic) {
    return NextResponse.json({ error: "Falta parámetro clinic" }, { status: 400 });
  }

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Apply rate limiting for search endpoints (30 requests per minute)
  const rateLimitResult = await rateLimit(request, 'search', user.id);
  if (!rateLimitResult.success) {
    return rateLimitResult.response;
  }

  // Get user profile to verify tenant access
  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.tenant_id !== clinic) {
    return NextResponse.json({ error: "Sin acceso a esta clínica" }, { status: 403 });
  }

  const results: SearchResult[] = [];
  const searchPattern = `%${query}%`;

  try {
    // Search pets
    const { data: pets } = await supabase
      .from("pets")
      .select("id, name, species, breed, owner_id")
      .eq("tenant_id", clinic)
      .or(`name.ilike.${searchPattern},breed.ilike.${searchPattern},microchip_id.ilike.${searchPattern}`)
      .limit(5);

    if (pets) {
      for (const pet of pets) {
        results.push({
          id: pet.id,
          type: "pet",
          title: pet.name,
          subtitle: `${pet.species === "dog" ? "Perro" : "Gato"}${pet.breed ? ` • ${pet.breed}` : ""}`,
          icon: pet.species,
          url: `/${clinic}/portal/pets/${pet.id}`,
        });
      }
    }

    // Search appointments (staff only)
    if (["vet", "admin"].includes(profile.role)) {
      const { data: appointments } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          appointment_time,
          status,
          service_id,
          pets!inner(name, species)
        `)
        .eq("clinic_slug", clinic)
        .or(`notes.ilike.${searchPattern}`)
        .order("appointment_date", { ascending: false })
        .limit(5);

      if (appointments) {
        for (const apt of appointments) {
          const petData = apt.pets as unknown as { name: string; species: string };
          const date = new Date(apt.appointment_date).toLocaleDateString("es-PY", {
            day: "numeric",
            month: "short",
          });
          results.push({
            id: apt.id,
            type: "appointment",
            title: petData?.name || "Cita",
            subtitle: `${date} • ${apt.appointment_time || ""} • ${apt.status}`,
            icon: "calendar",
            url: `/${clinic}/portal/appointments/${apt.id}`,
          });
        }
      }

      // Search clients (staff only)
      const { data: clients } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone")
        .eq("tenant_id", clinic)
        .eq("role", "owner")
        .or(`full_name.ilike.${searchPattern},email.ilike.${searchPattern},phone.ilike.${searchPattern}`)
        .limit(5);

      if (clients) {
        for (const client of clients) {
          results.push({
            id: client.id,
            type: "client",
            title: client.full_name || client.email || "Cliente",
            subtitle: client.phone || client.email,
            icon: "user",
            url: `/${clinic}/portal/clients/${client.id}`,
          });
        }
      }
    }

    // Search products
    const { data: products } = await supabase
      .from("store_products")
      .select("id, name, description, category, price")
      .eq("tenant_id", clinic)
      .eq("is_active", true)
      .or(`name.ilike.${searchPattern},description.ilike.${searchPattern},sku.ilike.${searchPattern}`)
      .limit(5);

    if (products) {
      for (const product of products) {
        results.push({
          id: product.id,
          type: "product",
          title: product.name,
          subtitle: `${product.category} • ${product.price?.toLocaleString("es-PY")} Gs`,
          icon: "package",
          url: `/${clinic}/store/products/${product.id}`,
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Error en búsqueda" }, { status: 500 });
  }
}
