import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/notifications
 * Fetch in-app notifications for the authenticated user
 * Returns latest 50 notifications with unread count
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // 1. Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // 2. Fetch notifications for this user (in-app only)
    const { data: notifications, error: notificationsError } = await supabase
      .from("notification_queue")
      .select("*")
      .eq("channel_type", "in_app")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (notificationsError) {
      console.error("Error fetching notifications:", notificationsError);
      return NextResponse.json(
        { error: "Error al cargar notificaciones" },
        { status: 500 }
      );
    }

    // 3. Count unread notifications
    const unreadCount = notifications?.filter(
      (n) => n.status === "queued"
    ).length || 0;

    // 4. Return response
    return NextResponse.json({
      notifications: notifications || [],
      unreadCount,
    });
  } catch (error) {
    console.error("Unexpected error fetching notifications:", error);
    return NextResponse.json(
      { error: "Error inesperado al cargar notificaciones" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications
 * Mark notifications as read (delivered)
 * Expects: { notificationIds: string[] }
 */
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();

  // 1. Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // 2. Parse request body
    const body = await request.json();
    const { notificationIds } = body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: "Se requiere un array de IDs de notificaciones" },
        { status: 400 }
      );
    }

    if (notificationIds.length === 0) {
      return NextResponse.json(
        { error: "El array de IDs no puede estar vacío" },
        { status: 400 }
      );
    }

    // 3. Update notifications to delivered status
    // Only update notifications that belong to the current user
    const { data, error: updateError } = await supabase
      .from("notification_queue")
      .update({
        status: "delivered",
        delivered_at: new Date().toISOString(),
      })
      .in("id", notificationIds)
      .eq("client_id", user.id) // Security: only update own notifications
      .select();

    if (updateError) {
      console.error("Error updating notifications:", updateError);
      return NextResponse.json(
        { error: "Error al marcar notificaciones como leídas" },
        { status: 500 }
      );
    }

    // 4. Return success response
    return NextResponse.json({
      success: true,
      updated: data?.length || 0,
      message: "Notificaciones marcadas como leídas",
    });
  } catch (error) {
    console.error("Unexpected error updating notifications:", error);
    return NextResponse.json(
      { error: "Error inesperado al actualizar notificaciones" },
      { status: 500 }
    );
  }
}
