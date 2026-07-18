import { useState, useCallback } from "react";
import { AppNotification } from "../types";

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: "notif-1",
      type: "emergency",
      message: "Emergency response team dispatched: Field medics addressing minor heat fatigue reports around concourse level Section 104.",
      timestamp: "21:11:00",
      isRead: false
    },
    {
      id: "notif-2",
      type: "gate",
      message: "Gate closure protocol: Gate C scanners suspended temporarily for 5 mins to balance heavy gate entry velocity.",
      timestamp: "21:05:12",
      isRead: false
    },
    {
      id: "notif-3",
      type: "crowd",
      message: "Ingress Flow Spike warning: Congestion index has crossed 80% around North-West parking access corridors.",
      timestamp: "21:02:44",
      isRead: false
    },
    {
      id: "notif-4",
      type: "shuttle",
      message: "Shuttle Route delay: Express Link Shuttle Fleet reporting transit slowdown of approx 6 mins due to outer perimeter gridlock.",
      timestamp: "20:58:15",
      isRead: true
    },
    {
      id: "notif-5",
      type: "weather",
      message: "Weather alert: Ambient temperature exceeds index threshold. Outer misters and hydration terminals fully engaged.",
      timestamp: "20:45:00",
      isRead: true
    }
  ]);

  const handleDismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleDismissAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const handleMarkAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const handleNewNotification = useCallback((notif: AppNotification) => {
    setNotifications((prev) => [notif, ...prev]);
  }, []);

  return {
    notifications,
    setNotifications,
    handleDismissNotification,
    handleDismissAllNotifications,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleNewNotification
  };
}
