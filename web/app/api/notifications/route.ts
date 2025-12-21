import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/notifications
 * Fetch in-app notifications for the authenticated user
 * Query params:
 *   - status: filter by status (optional, e.g., 'read', 'unread')
 * Returns latest 50 notifications with unread count
 *
 * Schema: notifications table
 * - user_id: UUID (auth user ID)
 * - type: notification type
 * - title, message: content
 * - read_at: NULL = unread, timestamp = read
 * - channels: TEXT[] (in_app, email, push, sms)
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // 1. Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // 2. Parse query params
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    // 3. Build query for notifications (use correct table and columns)
    let query = supabase
      .from("notifications")
      .select("id, title, message, type, priority, reference_type, reference_id, action_url, read_at, dismissed_at, created_at")
      .eq("user_id", user.id)
      .is("dismissed_at", null); // Don't show dismissed notifications

    // Apply status filter if provided
    if (statusFilter === 'read') {
      query = query.not("read_at", "is", null);
    } else if (statusFilter === 'unread') {
      query = query.is("read_at", null);
    }

    const { data: notifications, error: notificationsError } = await query
      .order("created_at", { ascending: false })
      .limit(50);

    if (notificationsError) {
      console.error("Error fetching notifications:", notificationsError);
      return NextResponse.json(
        { error: "Error al cargar notificaciones" },
        { status: 500 }
      );
    }

    // 4. Count unread notifications (read_at IS NULL)
    const { count: unreadCount, error: countError } = await supabase
      .from("notifications")
      .select("id", { count: 'exact', head: true })
      .eq("user_id", user.id)
      .is("read_at", null)
      .is("dismissed_at", null);

    if (countError) {
      console.error("Error counting unread notifications:", countError);
    }

    // 5. Return response (map to consistent format)
    return NextResponse.json({
      notifications: (notifications || []).map(n => ({
        ...n,
        status: n.read_at ? 'read' : 'unread',
      })),
      unreadCount: unreadCount || 0,
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
 * Mark notifications as read
 * Expects:
 *   - { notificationIds: string[] } - mark specific notifications
 *   - { markAllRead: true } - mark all unread notifications as read
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
    const { notificationIds, markAllRead } = body;

    // 3. Handle mark all read
    if (markAllRead === true) {
      const { data, error: updateError } = await supabase
        .from("notifications")
        .update({
          read_at: new Date().toISOString(),
        })
        .eq("user_id", user.id) // Security: only update own notifications
        .is("read_at", null) // Only mark unread ones
        .select();

      if (updateError) {
        console.error("Error marking all notifications as read:", updateError);
        return NextResponse.json(
          { error: "Error al marcar todas las notificaciones como leídas" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        updated: data?.length || 0,
        message: "Todas las notificaciones marcadas como leídas",
      });
    }

    // 4. Handle specific notification IDs
    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: "Se requiere 'notificationIds' (array) o 'markAllRead' (boolean)" },
        { status: 400 }
      );
    }

    if (notificationIds.length === 0) {
      return NextResponse.json(
        { error: "El array de IDs no puede estar vacío" },
        { status: 400 }
      );
    }

    // 5. Update specific notifications to read status
    // Only update notifications that belong to the current user
    const { data, error: updateError } = await supabase
      .from("notifications")
      .update({
        read_at: new Date().toISOString(),
      })
      .in("id", notificationIds)
      .eq("user_id", user.id) // Security: only update own notifications
      .select();

    if (updateError) {
      console.error("Error updating notifications:", updateError);
      return NextResponse.json(
        { error: "Error al marcar notificaciones como leídas" },
        { status: 500 }
      );
    }

    // 6. Return success response
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
