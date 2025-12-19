import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const clinic = searchParams.get("clinic");

  if (!clinic) {
    return NextResponse.json({ error: "Clinic parameter required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // Get loyalty points balance
    const { data: loyalty, error: loyaltyError } = await supabase
      .from("loyalty_points")
      .select("balance, lifetime_earned")
      .eq("user_id", id)
      .eq("tenant_id", clinic)
      .single();

    // Get recent transactions
    const { data: transactions, error: txError } = await supabase
      .from("loyalty_transactions")
      .select("id, points, description, type, created_at")
      .eq("user_id", id)
      .eq("clinic_id", clinic)
      .order("created_at", { ascending: false })
      .limit(20);

    return NextResponse.json({
      balance: loyalty?.balance || 0,
      lifetime_earned: loyalty?.lifetime_earned || 0,
      transactions: transactions || [],
    });
  } catch (error) {
    console.error("Error fetching loyalty data:", error);
    return NextResponse.json({ error: "Error al cargar puntos" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  const body = await request.json();
  const { clinic, points, description, type } = body;

  if (!clinic || points === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Check staff role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile || !["vet", "admin"].includes(profile.role) || profile.tenant_id !== clinic) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    // Get or create loyalty record
    const { data: existing } = await supabase
      .from("loyalty_points")
      .select("id, balance, lifetime_earned")
      .eq("user_id", id)
      .eq("tenant_id", clinic)
      .single();

    const currentBalance = existing?.balance || 0;
    const currentLifetime = existing?.lifetime_earned || 0;
    const newBalance = currentBalance + points;

    if (existing) {
      // Update existing record
      const { error: updateError } = await supabase
        .from("loyalty_points")
        .update({
          balance: newBalance,
          lifetime_earned: points > 0 ? currentLifetime + points : currentLifetime,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) throw updateError;
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from("loyalty_points")
        .insert({
          user_id: id,
          tenant_id: clinic,
          balance: points,
          lifetime_earned: points > 0 ? points : 0,
        });

      if (insertError) throw insertError;
    }

    // Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from("loyalty_transactions")
      .insert({
        clinic_id: clinic,
        user_id: id,
        points,
        description: description || (points > 0 ? "Puntos agregados" : "Puntos canjeados"),
        type: type || (points > 0 ? "earned" : "redeemed"),
        created_by: user.id,
      })
      .select()
      .single();

    if (txError) throw txError;

    return NextResponse.json({
      newBalance,
      transaction,
    });
  } catch (error) {
    console.error("Error updating loyalty points:", error);
    return NextResponse.json({ error: "Error al actualizar puntos" }, { status: 500 });
  }
}
