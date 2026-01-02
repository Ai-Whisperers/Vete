import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

/**
 * GET /api/notifications
 * Fetch in-app notifications for the authenticated user
 *
 * NOTE: The in-app notifications table is not yet created.
 * Currently returns empty list. When the table is created, this will work.
 *
 * Expected schema: notifications table
 * - user_id: UUID (auth user ID)
 * - type: notification type
 * - title, message: content
 * - read_at: NULL = unread, timestamp = read
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

    // 3. Check if notifications table exists and query it
    const { data: notifications, error: notificationsError } = await supabase
      .from("notifications")
      .select("id, title, message, type, priority, reference_type, reference_id, action_url, read_at, dismissed_at, created_at")
      .eq("user_id", user.id)
      .is("dismissed_at", null)
      .order("created_at", { ascending: false })
      .limit(50);

    // Handle table not existing (PGRST205) - return empty list gracefully
    if (notificationsError) {
      if (notificationsError.code === 'PGRST205') {
        // Table doesn't exist yet - return empty notifications (not an error)
        return NextResponse.json({
          notifications: [],
          unreadCount: 0,
        });
      }
      logger.error("Error fetching notifications", {
        error: notificationsError.message,
        userId: user.id
      });
      return NextResponse.json(
        { error: "Error al cargar notificaciones" },
        { status: 500 }
      );
    }

    // 4. Filter by status if provided
    let filteredNotifications = notifications || [];
    if (statusFilter === 'read') {
      filteredNotifications = filteredNotifications.filter(n => n.read_at !== null);
    } else if (statusFilter === 'unread') {
      filteredNotifications = filteredNotifications.filter(n => n.read_at === null);
    }

    // 5. Count unread
    const unreadCount = (notifications || []).filter(n => n.read_at === null).length;

    // 6. Return response (map to consistent format)
    return NextResponse.json({
      notifications: filteredNotifications.map(n => ({
        ...n,
        status: n.read_at ? 'read' : 'unread',
      })),
      unreadCount,
    });
  } catch (error) {
    logger.error("Unexpected error fetching notifications", {
      error: error instanceof Error ? error.message : "Unknown",
      userId: user?.id
    });
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
        // Handle table not existing gracefully
        if (updateError.code === 'PGRST205') {
          return NextResponse.json({
            success: true,
            updated: 0,
            message: "No hay notificaciones",
          });
        }
        logger.error("Error marking all notifications as read", {
          error: updateError.message,
          userId: user.id
        });
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
      // Handle table not existing gracefully
      if (updateError.code === 'PGRST205') {
        return NextResponse.json({
          success: true,
          updated: 0,
          message: "No hay notificaciones",
        });
      }
      logger.error("Error updating notifications", {
        error: updateError.message,
        userId: user.id,
        notificationIds
      });
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
    logger.error("Unexpected error updating notifications", {
      error: error instanceof Error ? error.message : "Unknown",
      userId: user?.id
    });
    return NextResponse.json(
      { error: "Error inesperado al actualizar notificaciones" },
      { status: 500 }
    );
  }
}
