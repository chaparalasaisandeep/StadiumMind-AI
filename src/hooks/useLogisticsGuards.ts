import { useState, useCallback } from "react";
import { AppNotification } from "../types";

export interface GuardItem {
  id: string;
  name: string;
  role: "security" | "medical" | "usher" | "vip_escort";
  status: "on_patrol" | "stationary" | "dispatched" | "rest_break";
  sector: string;
  radioChannel: string;
  avatar: string;
}

export function useLogisticsGuards(onNewNotification?: (notif: AppNotification) => void) {
  const [guards, setGuards] = useState<GuardItem[]>([
    { id: "SEC-04", name: "Officer Reynolds", role: "security", status: "on_patrol", sector: "Concourse Sect 104", radioChannel: "CH-1 Main Sec", avatar: "👮‍♂️" },
    { id: "MED-02", name: "Paramedic Lopez", role: "medical", status: "stationary", sector: "Medical Station 2", radioChannel: "CH-2 Medics", avatar: "👩‍⚕️" },
    { id: "SEC-11", name: "Supervisor Geller", role: "security", status: "dispatched", sector: "Gate C Entryway", radioChannel: "CH-1 Main Sec", avatar: "🕵️‍♂️" },
    { id: "USH-19", name: "Usher Lead Chen", role: "usher", status: "on_patrol", sector: "Main Concourse B", radioChannel: "CH-4 Ushers", avatar: "🙋" },
    { id: "ESC-08", name: "Specialist Vance", role: "vip_escort", status: "rest_break", sector: "VIP Suite Lobby", radioChannel: "CH-3 Executive", avatar: "🕴️" },
    { id: "SEC-09", name: "Officer Barnes", role: "security", status: "on_patrol", sector: "East Parking Corridors", radioChannel: "CH-1 Main Sec", avatar: "👮‍♀️" },
    { id: "MED-05", name: "Paramedic Ross", role: "medical", status: "on_patrol", sector: "West Stand Access", radioChannel: "CH-2 Medics", avatar: "👨‍⚕️" },
    { id: "USH-03", name: "Usher Wright", role: "usher", status: "stationary", sector: "Disabled Seating West", radioChannel: "CH-4 Ushers", avatar: "💁‍♀️" },
  ]);

  const [bulletinText, setBulletinText] = useState("");
  const [bulletinAudience, setBulletinAudience] = useState<"all" | "security" | "medical" | "staff">("all");
  const [selectedGuard, setSelectedGuard] = useState<GuardItem | null>(null);
  
  // Modal or inline states for guard editing
  const [isReassigning, setIsReassigning] = useState(false);
  const [newSector, setNewSector] = useState("");
  const [newStatus, setNewStatus] = useState<GuardItem["status"]>("on_patrol");

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const handleBroadcastBulletin = useCallback(() => {
    if (!bulletinText.trim()) return;

    const notifObj: AppNotification = {
      id: `notif-bulletin-${Date.now()}`,
      type: "weather", // standard type for operational announcements
      message: `Logistics Broadcast [To: ${bulletinAudience.toUpperCase()}]: "${bulletinText}"`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isRead: false
    };

    if (onNewNotification) {
      onNewNotification(notifObj);
    }

    setNotificationMsg(`Bulletin successfully broadcasted to ${bulletinAudience} personnel on radio channels.`);
    setBulletinText("");
    setTimeout(() => setNotificationMsg(null), 3000);
  }, [bulletinText, bulletinAudience, onNewNotification]);

  const handleReassign = useCallback((guardId: string) => {
    if (!newSector) return;

    setGuards((prev) =>
      prev.map((g) => {
        if (g.id === guardId) {
          return {
            ...g,
            sector: newSector,
            status: newStatus
          };
        }
        return g;
      })
    );

    const target = guards.find(g => g.id === guardId);
    if (target && onNewNotification) {
      onNewNotification({
        id: `notif-reassign-${Date.now()}`,
        type: "crowd",
        message: `Personnel Deployment: ${target.name} (${target.id}) reassigned to ${newSector} with status: ${newStatus.toUpperCase().replace("_", " ")}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        isRead: false
      });
    }

    setIsReassigning(false);
    setNewSector("");
    setSelectedGuard((prev) => prev ? { ...prev, sector: newSector, status: newStatus } : null);
  }, [newSector, newStatus, guards, onNewNotification]);

  const handleRequestBackup = useCallback((sector: string, role: string) => {
    const notifObj: AppNotification = {
      id: `notif-backup-${Date.now()}`,
      type: "emergency",
      message: `DISPATCH ALERT: Localized support backup requested at ${sector} for ${role} assistance. Units responding.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isRead: false
    };

    if (onNewNotification) {
      onNewNotification(notifObj);
    }

    setGuards((prev) => {
      let dispatched = false;
      return prev.map((g) => {
        if (!dispatched && g.role === role && g.status !== "dispatched") {
          dispatched = true;
          return { ...g, status: "dispatched", sector: sector };
        }
        return g;
      });
    });

    setNotificationMsg(`Backup requested. Tactical dispatcher routed nearest available ${role} unit to ${sector}.`);
    setTimeout(() => setNotificationMsg(null), 3000);
  }, [onNewNotification]);

  const totalPersonnel = guards.length;
  const activePatrols = guards.filter(g => g.status === "on_patrol").length;
  const activeDispatched = guards.filter(g => g.status === "dispatched").length;
  const breakCount = guards.filter(g => g.status === "rest_break").length;

  return {
    guards,
    setGuards,
    bulletinText,
    setBulletinText,
    bulletinAudience,
    setBulletinAudience,
    selectedGuard,
    setSelectedGuard,
    isReassigning,
    setIsReassigning,
    newSector,
    setNewSector,
    newStatus,
    setNewStatus,
    notificationMsg,
    handleBroadcastBulletin,
    handleReassign,
    handleRequestBackup,
    totalPersonnel,
    activePatrols,
    activeDispatched,
    breakCount
  };
}
