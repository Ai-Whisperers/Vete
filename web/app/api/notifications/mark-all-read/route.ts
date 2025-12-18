import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // Mark all unread notifications as read for this user
    const { data, error } = await supabase
      .from("notification_queue")
      .update({
        status: "read",
        read_at: new Date().toISOString()
      })
      .eq("client_id", user.id)
      .eq("channel_type", "in_app")
      .in("status", ["queued", "delivered"])
      .select();

    if (error) {
      console.error("Error marking notifications as read:", error);
      return NextResponse.json(
        { error: "Error al marcar las notificaciones" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updated: data?.length || 0,
      message: "Todas las notificaciones marcadas como leídas"
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Error del servidor" },
      { status: 500 }
    );
  }
}
