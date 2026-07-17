import React, { useState } from "react";
import { 
  ShieldCheck, 
  Users, 
  MapPin, 
  Radio, 
  Send, 
  Plus, 
  AlertOctagon, 
  HeartHandshake, 
  Clock, 
  Sparkles,
  CheckCircle,
  BellRing
} from "lucide-react";
import { AppNotification } from "../types";

interface GuardItem {
  id: string;
  name: string;
  role: "security" | "medical" | "usher" | "vip_escort";
  status: "on_patrol" | "stationary" | "dispatched" | "rest_break";
  sector: string;
  radioChannel: string;
  avatar: string;
}

interface LogisticsGuardsPanelProps {
  stadiumName: string;
  onNewNotification?: (notif: AppNotification) => void;
}

export default function LogisticsGuardsPanel({ stadiumName, onNewNotification }: LogisticsGuardsPanelProps) {
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

  const handleBroadcastBulletin = () => {
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
  };

  const handleReassign = (guardId: string) => {
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

    // Reset editing
    setIsReassigning(false);
    setNewSector("");
    // Update active selection view
    setSelectedGuard((prev) => prev ? { ...prev, sector: newSector, status: newStatus } : null);
  };

  const handleRequestBackup = (sector: string, role: string) => {
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

    // Set any dispatched guard in break or patrol to dispatched to that sector
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
  };

  const totalPersonnel = guards.length;
  const activePatrols = guards.filter(g => g.status === "on_patrol").length;
  const activeDispatched = guards.filter(g => g.status === "dispatched").length;
  const breakCount = guards.filter(g => g.status === "rest_break").length;

  return (
    <div id="logistics-guards-panel" className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
            Logistics, Guards & Patrol Personnel Console
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time responder grid. Coordinate security sweeps, medical dispatch centers, and steward stations across {stadiumName}.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold rounded-full uppercase">
            CHANNELS ENCRYPTED
          </span>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-850/70">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Total On-Duty</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-bold text-white">{totalPersonnel}</span>
            <span className="text-[10px] text-emerald-400 font-mono">100% Comms link</span>
          </div>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-850/70">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Active Sweeps</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-bold text-emerald-400">{activePatrols}</span>
            <span className="text-[10px] text-slate-400 font-mono">On scheduled sector</span>
          </div>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-850/70">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Active Dispatch</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-lg font-bold ${activeDispatched > 0 ? "text-amber-400 animate-pulse" : "text-slate-400"}`}>{activeDispatched}</span>
            <span className="text-[10px] text-slate-500 font-mono">Addressing anomalies</span>
          </div>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-850/70">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Rest Rotation</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-bold text-sky-400">{breakCount}</span>
            <span className="text-[10px] text-slate-500 font-mono">Beds/Breakrooms</span>
          </div>
        </div>
      </div>

      {/* Broadcast System Alert */}
      {notificationMsg && (
        <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 text-xs font-mono text-emerald-400 rounded-xl flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Double Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Guard Grid */}
        <div className="lg:col-span-2 space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
          {guards.map((guard) => {
            const isSelected = selectedGuard?.id === guard.id;
            return (
              <div
                key={guard.id}
                onClick={() => {
                  setSelectedGuard(guard);
                  setIsReassigning(false);
                }}
                className={`p-3.5 border rounded-xl flex items-center justify-between transition-all duration-200 cursor-pointer ${
                  isSelected 
                    ? "bg-slate-800/40 border-emerald-500/50 shadow-md shadow-emerald-950/10" 
                    : "bg-slate-950/30 border-slate-850 hover:bg-slate-900/30 hover:border-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-lg shadow-inner">
                    {guard.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 uppercase">{guard.role}</span>
                      <h4 className="text-xs font-bold text-slate-200">{guard.name}</h4>
                    </div>
                    <div className="flex gap-3 text-[10px] text-slate-400 mt-1 font-mono">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-emerald-500" /> {guard.sector}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-500"><Radio className="h-3 w-3" /> {guard.radioChannel}</span>
                    </div>
                  </div>
                </div>

                <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded uppercase ${
                  guard.status === "on_patrol" 
                    ? "bg-emerald-950/30 text-emerald-400 border border-emerald-500/20" 
                    : guard.status === "stationary"
                    ? "bg-sky-950/30 text-sky-400 border border-sky-500/20"
                    : guard.status === "dispatched"
                    ? "bg-amber-950/30 text-amber-400 border border-amber-500/20"
                    : "bg-slate-900 text-slate-400 border border-slate-800"
                }`}>
                  {guard.status.replace("_", " ")}
                </span>
              </div>
            );
          })}
        </div>

        {/* Action Panel Column */}
        <div className="space-y-4">
          
          {/* Selected Personnel Details */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between min-h-[220px]">
            {selectedGuard ? (
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{selectedGuard.avatar}</span>
                    <div>
                      <h3 className="text-xs font-bold text-white">{selectedGuard.name}</h3>
                      <span className="text-[9px] font-mono text-slate-500 uppercase">{selectedGuard.id} // {selectedGuard.role}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded uppercase ${
                    selectedGuard.status === "on_patrol" 
                      ? "bg-emerald-950/30 text-emerald-400 border border-emerald-500/20" 
                      : selectedGuard.status === "stationary"
                      ? "bg-sky-950/30 text-sky-400 border border-sky-500/20"
                      : selectedGuard.status === "dispatched"
                      ? "bg-amber-950/30 text-amber-400 border border-amber-500/20"
                      : "bg-slate-900 text-slate-400 border border-slate-800"
                  }`}>
                    {selectedGuard.status.replace("_", " ")}
                  </span>
                </div>

                <div className="border-t border-slate-900 pt-2.5 text-[11px] font-mono space-y-1.5 text-slate-400">
                  <div className="flex justify-between">
                    <span>Active Zone</span>
                    <span className="text-slate-200">{selectedGuard.sector}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Comms Link</span>
                    <span className="text-slate-200">{selectedGuard.radioChannel}</span>
                  </div>
                </div>

                {isReassigning ? (
                  <div className="space-y-2 border-t border-slate-900 pt-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-slate-500 block uppercase">Target Sector</label>
                      <input
                        type="text"
                        placeholder="e.g. Gate B, Sect 110"
                        value={newSector}
                        onChange={(e) => setNewSector(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-850 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-slate-500 block uppercase">Deployment Status</label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as GuardItem["status"])}
                        className="w-full bg-slate-900 border border-slate-850 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                      >
                        <option value="on_patrol">On Patrol</option>
                        <option value="stationary">Stationary</option>
                        <option value="dispatched">Dispatched</option>
                        <option value="rest_break">Rest Break</option>
                      </select>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleReassign(selectedGuard.id)}
                        className="flex-1 py-1 bg-emerald-600 text-white rounded text-xs font-bold transition-colors cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsReassigning(false)}
                        className="flex-1 py-1 bg-slate-900 border border-slate-850 text-slate-400 rounded text-xs transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 pt-2 border-t border-slate-900">
                    <button
                      onClick={() => {
                        setNewSector(selectedGuard.sector);
                        setNewStatus(selectedGuard.status);
                        setIsReassigning(true);
                      }}
                      className="flex-1 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-850 text-slate-200 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                      Reassign Post
                    </button>
                    <button
                      onClick={() => handleRequestBackup(selectedGuard.sector, selectedGuard.role)}
                      className="flex-1 py-1 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-900/30 text-rose-400 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <AlertOctagon className="h-3.5 w-3.5 text-rose-500" />
                      Call Backup
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-6">
                <HeartHandshake className="h-8 w-8 text-slate-700 animate-pulse" />
                <h4 className="text-xs font-semibold text-slate-400 mt-2">No Responder Selected</h4>
                <p className="text-[10px] text-slate-500 mt-1 max-w-[170px]">Select any officer, medic, or steward to reassign posts or call for support backup.</p>
              </div>
            )}
          </div>

          {/* Broadcast General Bulletin */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <BellRing className="h-3.5 w-3.5 text-amber-400" />
              Tactical Broadcast bulletin
            </h3>
            <div className="space-y-2">
              <textarea
                placeholder="Broadcast operational mandate or emergency sweep orders to team radio networks..."
                value={bulletinText}
                onChange={(e) => setBulletinText(e.target.value)}
                className="w-full h-16 bg-slate-900 border border-slate-850 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
              />
              <div className="flex justify-between items-center">
                <select
                  value={bulletinAudience}
                  onChange={(e) => setBulletinAudience(e.target.value as any)}
                  className="bg-slate-900 border border-slate-850 text-[10px] rounded px-1.5 py-1 text-white focus:outline-none cursor-pointer"
                >
                  <option value="all">All Personnel</option>
                  <option value="security">Security Only</option>
                  <option value="medical">Medical Only</option>
                  <option value="staff">Ushers/Staff</option>
                </select>
                
                <button
                  onClick={handleBroadcastBulletin}
                  className="px-3 py-1 bg-sky-650 hover:bg-sky-600 text-white rounded text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="h-3 w-3" />
                  Broadcast
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
