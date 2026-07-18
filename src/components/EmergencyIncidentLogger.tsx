import React, { useState, useCallback } from "react";
import { StadiumState, UserRole } from "../types";
import { 
  ShieldAlert, 
  Plus, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Send,
  AlertTriangle,
  Stethoscope
} from "lucide-react";

interface EmergencyIncidentLoggerProps {
  currentRole: UserRole;
  stadiumState: StadiumState;
  onAddIncident: (incident: {
    title: string;
    type: "security" | "medical" | "congestion" | "maintenance";
    severity: "low" | "medium" | "high";
    location: string;
  }) => void;
  onDispatchIncident: (incidentId: string) => void;
  onResolveIncident: (incidentId: string) => void;
}

const EmergencyIncidentLogger = React.memo(function EmergencyIncidentLogger({
  currentRole,
  stadiumState,
  onAddIncident,
  onDispatchIncident,
  onResolveIncident
}: EmergencyIncidentLoggerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"security" | "medical" | "congestion" | "maintenance">("security");
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium");
  const [location, setLocation] = useState("");

  const hasWritePermission = ["Security", "Medical", "Organizer", "Admin"].includes(currentRole);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) return;

    onAddIncident({ title, type, severity, location });
    setTitle("");
    setLocation("");
    setShowAddForm(false);
  }, [title, type, severity, location, onAddIncident]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-[520px]">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
            <ShieldAlert className="h-4.5 w-4.5 text-rose-500 animate-pulse" />
            Active Tactical Incidents
          </h3>
          <p className="text-[11px] text-slate-400">Live triage, coordination, and rapid emergency dispatch ledger.</p>
        </div>

        {hasWritePermission && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            id="log-incident-trigger"
            className="px-2.5 py-1.5 bg-rose-950/50 hover:bg-rose-900/50 border border-rose-500/30 text-rose-400 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Log Alert
          </button>
        )}
      </div>

      {showAddForm ? (
        <form onSubmit={handleSubmit} className="space-y-3 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl">
            <span className="text-[11px] font-mono text-rose-400">NEW_ALERT_REGISTRATION</span>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-slate-500 hover:text-slate-300 text-xs"
            >
              Cancel
            </button>
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1">INCIDENT TITLE / NATURE</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g. Intoxicated fan blocking row 12"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">ALARM TYPE</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none"
              >
                <option value="security">🛡️ Security</option>
                <option value="medical">🚑 Medical</option>
                <option value="congestion">🚶 Congestion</option>
                <option value="maintenance">🔧 Maintenance</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">SEVERITY LEVEL</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none"
              >
                <option value="low">🟡 Low</option>
                <option value="medium">🟠 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1">SECTOR LOCATION</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="E.g. Section 112 Lobby / Gate B Perimeter"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              required
            />
          </div>

          <button
            type="submit"
            id="incident-submit-btn"
            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
            Broadcast Alert Coordinates
          </button>
        </form>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
          {stadiumState.incidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 py-10">
              <CheckCircle className="h-8 w-8 text-emerald-500 mb-2 animate-bounce" />
              <p className="text-xs">Stadium secure. No active incidents recorded.</p>
            </div>
          ) : (
            stadiumState.incidents.map((inc) => {
              const typeLabels = {
                security: { label: "Security", color: "text-red-400 bg-red-950/40 border-red-500/20" },
                medical: { label: "Medical", color: "text-rose-400 bg-rose-950/40 border-rose-500/20" },
                congestion: { label: "Crowd Flow", color: "text-amber-400 bg-amber-950/40 border-amber-500/20" },
                maintenance: { label: "Facilities", color: "text-slate-400 bg-slate-950/40 border-slate-800/20" }
              };

              const statusColors = {
                reported: "text-amber-500 border-amber-500/30 bg-amber-500/5",
                dispatched: "text-sky-500 border-sky-500/30 bg-sky-500/5",
                resolved: "text-emerald-500 border-emerald-500/30 bg-emerald-500/5"
              };

              const severityColors = {
                low: "text-slate-400",
                medium: "text-orange-400",
                high: "text-red-500 font-bold"
              };

              return (
                <div
                  key={inc.id}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between hover:border-slate-700 transition-all group"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <span className={`text-[9px] uppercase px-2 py-0.5 rounded-full border ${typeLabels[inc.type].color}`}>
                        {typeLabels[inc.type].label}
                      </span>
                      <span className={`text-[9px] uppercase px-2 py-0.5 rounded-full border ${statusColors[inc.status]}`}>
                        {inc.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                      {inc.title}
                    </h4>

                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-slate-400 mt-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-500" />
                        {inc.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-500" />
                        {inc.timestamp}
                      </span>
                      <span className={`flex items-center gap-1 ${severityColors[inc.severity]}`}>
                        <AlertTriangle className="h-3 w-3" />
                        {inc.severity.toUpperCase()} Priority
                      </span>
                    </div>
                  </div>

                  {/* Dispatch and Resolve controls for specific personnel */}
                  {hasWritePermission && inc.status !== "resolved" && (
                    <div className="flex gap-2 mt-3 pt-2 border-t border-slate-850">
                      {inc.status === "reported" && (
                        <button
                          onClick={() => onDispatchIncident(inc.id)}
                          className="flex-1 py-1 px-2.5 bg-sky-950 hover:bg-sky-900 text-sky-400 border border-sky-500/20 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <Send className="h-3 w-3" />
                          Dispatch Units
                        </button>
                      )}
                      <button
                        onClick={() => onResolveIncident(inc.id)}
                        className="flex-1 py-1 px-2.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Resolve Alert
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
});
export default EmergencyIncidentLogger;
