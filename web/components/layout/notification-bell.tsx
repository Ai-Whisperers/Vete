"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  subject: string | null;
  body: string;
  notification_type: string;
  status: "queued" | "delivered" | "read" | "failed";
  created_at: string;
  read_at: string | null;
}

interface NotificationBellProps {
  clinic: string;
}

export function NotificationBell({ clinic }: Readonly<NotificationBellProps>) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      if (!response.ok) {
        throw new Error("Error al cargar notificaciones");
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Error fetching notifications - silently fail and show empty state
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationIds: string[]) => {
    if (notificationIds.length === 0) return;

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationIds }),
      });

      if (!response.ok) {
        throw new Error("Error al marcar notificaciones como leídas");
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notificationIds.includes(notif.id)
            ? { ...notif, status: "read" as const, read_at: new Date().toISOString() }
            : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - notificationIds.length));
    } catch {
      // Error marking as read - silently fail
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Error al marcar todas las notificaciones como leídas");
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.status === "queued" || notif.status === "delivered"
            ? { ...notif, status: "read" as const, read_at: new Date().toISOString() }
            : notif
        )
      );
      setUnreadCount(0);
    } catch {
      // Error marking all as read - silently fail
    }
  };

  const handleNotificationClick = async (notificationId: string, status: string) => {
    // Mark as read if not already read
    if (status !== "read") {
      await markAsRead([notificationId]);
    }
  };

  const handleDropdownToggle = () => {
    setIsOpen(!isOpen);
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Hace unos segundos";
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Hace ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Hace ${hours} ${hours === 1 ? "hora" : "horas"}`;
    }
    const days = Math.floor(diffInSeconds / 86400);
    if (days === 1) return "Hace 1 día";
    if (days < 7) return `Hace ${days} días`;
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      return `Hace ${weeks} ${weeks === 1 ? "semana" : "semanas"}`;
    }
    const months = Math.floor(days / 30);
    return `Hace ${months} ${months === 1 ? "mes" : "meses"}`;
  };

  // Get recent 5 notifications for dropdown
  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon with Badge */}
      <button
        onClick={handleDropdownToggle}
        className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
        aria-label="Notificaciones"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[var(--status-error,#dc2626)] text-white text-xs font-bold min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-[var(--bg-paper)] rounded-3xl shadow-xl border border-[var(--border-light,#f3f4f6)] z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[var(--primary)] text-white px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Notificaciones</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Marcar todas como leídas
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="px-6 py-8 text-center text-[var(--text-secondary)]">
                  Cargando...
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="px-6 py-8 text-center text-[var(--text-secondary)]">
                  No tienes notificaciones
                </div>
              ) : (
                <ul className="divide-y divide-[var(--border-light,#f3f4f6)]">
                  {recentNotifications.map((notification) => {
                    const isUnread = notification.status === "queued" || notification.status === "delivered";
                    return (
                      <li
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.id, notification.status)}
                        className={`px-6 py-4 hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer ${
                          isUnread ? "bg-[var(--primary)]/5" : ""
                        }`}
                      >
                        <div className="flex flex-col gap-1">
                          {/* Subject or Type */}
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm text-[var(--text-primary)] ${isUnread ? "font-bold" : "font-semibold"}`}>
                              {notification.subject ||
                                notification.notification_type
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </h4>
                            {isUnread && (
                              <span className="flex-shrink-0 w-2 h-2 bg-[var(--primary)] rounded-full mt-1"></span>
                            )}
                          </div>

                          {/* Body Preview */}
                          <p className={`text-sm ${isUnread ? "text-[var(--text-primary)] font-medium" : "text-[var(--text-secondary)]"}`}>
                            {truncateText(notification.body, 80)}
                          </p>

                          {/* Time Ago */}
                          <p className="text-xs text-[var(--text-muted)] mt-1">
                            {formatTimeAgo(notification.created_at)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer - "Ver todas" link */}
            {recentNotifications.length > 0 && (
              <div className="border-t border-[var(--border-light,#f3f4f6)] bg-[var(--bg-subtle)]">
                <Link
                  href={`/${clinic}/portal/notifications`}
                  onClick={() => setIsOpen(false)}
                  className="block px-6 py-3 text-center text-sm font-semibold text-[var(--primary)] hover:bg-[var(--bg-subtle)] transition-colors"
                >
                  Ver todas
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
