import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const clinic = searchParams.get("clinic");

  if (!clinic) {
    return NextResponse.json({ error: "Clinic parameter required" }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    // Note: Column is display_order not sort_order in schema
    // Note: icon column doesn't exist in schema
    const { data: categories, error } = await supabase
      .from("store_categories")
      .select("id, name, slug, description, display_order")
      .eq("tenant_id", clinic)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ categories: categories || [] });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Error al cargar categorías" }, { status: 500 });
  }
}
