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
    const { data: categories, error } = await supabase
      .from("store_categories")
      .select("id, name, slug, description, icon, image_url, sort_order")
      .eq("tenant_id", clinic)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ categories: categories || [] });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Error al cargar categorías" }, { status: 500 });
  }
}
