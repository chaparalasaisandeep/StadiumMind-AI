import React, { useState } from "react";
import { 
  Bell, 
  AlertOctagon, 
  DoorClosed, 
  Users, 
  Clock, 
  CloudSun, 
  Check, 
  Trash2, 
  Filter, 
  X,
  BellRing
} from "lucide-react";
import { AppNotification } from "../types";

interface NotificationCenterProps {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

type FilterType = "all" | "unread" | "emergency" | "gate" | "crowd" | "shuttle" | "weather";

export const NotificationCenter = React.memo(function NotificationCenter({
  notifications,
  onDismiss,
  onDismissAll,
  onMarkAsRead,
  onMarkAllAsRead
}: NotificationCenterProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [isOpen, setIsOpen] = useState(true); // Toggle the view of the notification center panel

  // Categorized counts for UI stats
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === "unread") return !n.isRead;
    if (activeFilter === "all") return true;
    return n.type === activeFilter;
  });

  // Icon & style helpers
  const getNotificationConfig = (type: AppNotification["type"]) => {
    switch (type) {
      case "emergency":
        return {
          icon: AlertOctagon,
          bg: "bg-rose-500/10 border-rose-500/20 text-rose-400",
          badge: "bg-rose-950 text-rose-400 border-rose-500/30",
          label: "Emergency"
        };
      case "gate":
        return {
          icon: DoorClosed,
          bg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
          badge: "bg-amber-950 text-amber-400 border-amber-500/30",
          label: "Gate Closure"
        };
      case "crowd":
        return {
          icon: Users,
          bg: "bg-sky-500/10 border-sky-500/20 text-sky-400",
          badge: "bg-sky-950 text-sky-400 border-sky-500/30",
          label: "Crowd Control"
        };
      case "shuttle":
        return {
          icon: Clock,
          bg: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
          badge: "bg-indigo-950 text-indigo-400 border-indigo-500/30",
          label: "Transit Delay"
        };
      case "weather":
        return {
          icon: CloudSun,
          bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
          badge: "bg-emerald-950 text-emerald-400 border-emerald-500/30",
          label: "Weather Update"
        };
    }
  };

  const filterButtons: { type: FilterType; label: string }[] = [
    { type: "all", label: "All" },
    { type: "unread", label: `Unread (${unreadCount})` },
    { type: "emergency", label: "Emergency" },
    { type: "gate", label: "Gate Closures" },
    { type: "crowd", label: "Crowd Alerts" },
    { type: "shuttle", label: "Shuttles" },
    { type: "weather", label: "Weather" }
  ];

  return (
    <div id="stadium-notification-center" className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl transition-all duration-300 overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 bg-slate-950/70 border-b border-slate-850 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl relative">
            <Bell className={`h-4.5 w-4.5 ${unreadCount > 0 ? "animate-swing" : ""}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse border border-slate-900">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              Live Dispatch Notification Hub
              {unreadCount > 0 && (
                <span className="text-[9px] font-bold bg-rose-500/15 border border-rose-500/30 text-rose-400 px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                  Unread Alerts
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">
              Authorized emergency broadcast feeds, mass transit status, gate management protocols, and local ambient alerts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <>
              <button
                onClick={onMarkAllAsRead}
                disabled={unreadCount === 0}
                className="px-2.5 py-1 text-[10px] font-semibold bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:text-indigo-400 text-slate-300 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                title="Mark all notifications as read"
              >
                <Check className="h-3 w-3" />
                Mark All Read
              </button>
              <button
                onClick={onDismissAll}
                className="px-2.5 py-1 text-[10px] font-semibold bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:text-rose-400 text-slate-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                title="Dismiss and purge active log"
              >
                <Trash2 className="h-3 w-3" />
                Clear All
              </button>
            </>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors text-xs cursor-pointer"
          >
            {isOpen ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 space-y-4">
          {/* Quick Filters - Horizontal Scrolling list on smaller screens */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800 select-none">
            <div className="flex items-center gap-1.5 pr-2 border-r border-slate-800 shrink-0">
              <Filter className="h-3 w-3 text-slate-500" />
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Filters</span>
            </div>
            {filterButtons.map((btn) => (
              <button
                key={btn.type}
                onClick={() => setActiveFilter(btn.type)}
                className={`px-3 py-1 text-[11px] font-medium rounded-xl border shrink-0 transition-all cursor-pointer ${
                  activeFilter === btn.type
                    ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-300 font-bold"
                    : "bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-800"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Notifications Log Stack */}
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => {
                const config = getNotificationConfig(notif.type);
                const Icon = config.icon;
                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition-all relative group ${
                      notif.isRead 
                        ? "bg-slate-950/20 border-slate-900 text-slate-400" 
                        : "bg-slate-950/70 border-slate-850 text-slate-200"
                    }`}
                  >
                    {/* Unread indicator dot */}
                    {!notif.isRead && (
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 bg-indigo-400 rounded-full animate-ping"></span>
                    )}

                    {/* Left Icon Panel */}
                    <div className={`p-2 rounded-lg border flex items-center justify-center shrink-0 ${config.bg}`}>
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Main text box */}
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase border ${config.badge}`}>
                          {config.label}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {notif.timestamp}
                        </span>
                      </div>
                      <p className={`text-[11px] mt-1.5 leading-relaxed break-words ${notif.isRead ? "text-slate-400" : "text-slate-200 font-medium"}`}>
                        {notif.message}
                      </p>
                    </div>

                    {/* Actions Panel */}
                    <div className="flex items-center gap-1 shrink-0">
                      {!notif.isRead && (
                        <button
                          onClick={() => onMarkAsRead(notif.id)}
                          className="p-1 hover:bg-slate-900 border border-slate-850 hover:text-indigo-400 text-slate-500 rounded-lg transition-all cursor-pointer"
                          title="Mark as Read"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onDismiss(notif.id)}
                        className="p-1 hover:bg-slate-900 border border-slate-850 hover:text-rose-400 text-slate-500 rounded-lg transition-all cursor-pointer"
                        title="Dismiss Alert"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 bg-slate-950/10 border border-dashed border-slate-850 rounded-xl space-y-2">
                <BellRing className="h-7 w-7 text-slate-600 mx-auto animate-bounce" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-400">No active alerts match this filter</h4>
                  <p className="text-[10px] text-slate-500 mt-1">New alerts will broadcast dynamically from simulated events.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default NotificationCenter;
