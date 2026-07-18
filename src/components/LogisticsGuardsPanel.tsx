import React from "react";
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
import { useLogisticsGuards, GuardItem } from "../hooks/useLogisticsGuards";

interface LogisticsGuardsPanelProps {
  stadiumName: string;
  onNewNotification?: (notif: AppNotification) => void;
}

export default function LogisticsGuardsPanel({ stadiumName, onNewNotification }: LogisticsGuardsPanelProps) {
  const {
    guards,
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
  } = useLogisticsGuards(onNewNotification);

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
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleReassign(selectedGuard.id)}
                        className="flex-1 py-1.5 bg-emerald-650 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer"
                      >
                        SUBMIT REASSIGNMENT
                      </button>
                      <button
                        onClick={() => setIsReassigning(false)}
                        className="px-2 py-1.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-lg text-[10px] font-mono font-bold hover:text-white transition-colors cursor-pointer"
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 pt-1 border-t border-slate-900">
                    <button
                      onClick={() => {
                        setNewSector(selectedGuard.sector);
                        setNewStatus(selectedGuard.status);
                        setIsReassigning(true);
                      }}
                      className="flex-1 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white rounded-lg text-[10px] font-mono font-bold tracking-wider transition-colors cursor-pointer"
                    >
                      REDEPLOY RESPONDER
                    </button>
                    <button
                      onClick={() => handleRequestBackup(selectedGuard.sector, selectedGuard.role)}
                      className="py-2 px-3 bg-slate-900 hover:bg-rose-950/20 border border-slate-800 hover:border-rose-900/20 text-slate-400 hover:text-rose-400 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      title="Request local assistance back-up"
                    >
                      <AlertOctagon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-2">
                <Users className="h-7 w-7 text-slate-700 animate-pulse mb-2" />
                <h4 className="text-xs font-semibold text-slate-400">Comms Inspector Offline</h4>
                <p className="text-[10px] text-slate-500 max-w-xs mt-1 leading-relaxed">
                  Select any registered officer or medical responder on the left grid to open encrypted telemetry and push sector reassignment mandates.
                </p>
              </div>
            )}
          </div>

          {/* Broadcast Terminal */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                  Tactical Radio Broadcaster
                </h3>
                <span className="text-[8px] font-mono text-slate-500 uppercase">Perimeter-Wide</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                Transmit instant orders directly into the audio receivers and tactical HUDs of on-duty stadium responders.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex gap-2">
                <select
                  value={bulletinAudience}
                  onChange={(e) => setBulletinAudience(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-mono font-bold p-1 text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="all">ALL UNITS</option>
                  <option value="security">SECURITY ONLY</option>
                  <option value="medical">MEDICS ONLY</option>
                  <option value="staff">STEWARDS/USHERS</option>
                </select>
                <div className="text-[8px] font-mono text-slate-500 flex items-center bg-slate-900/50 px-2 rounded border border-slate-900">
                  FREQ: 462.56 MHz
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Type broadcast bulletin message..."
                  value={bulletinText}
                  onChange={(e) => setBulletinText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleBroadcastBulletin();
                  }}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl pl-3 pr-9 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button
                  onClick={handleBroadcastBulletin}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 bg-emerald-550/10 border border-emerald-500/20 hover:bg-emerald-550/20 text-emerald-400 rounded-lg transition-colors cursor-pointer"
                >
                  <Send className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
