import React, { useState, useCallback } from "react";
import { 
  Users, 
  Car, 
  DoorClosed, 
  Heart, 
  ShieldAlert, 
  CloudLightning, 
  Clock, 
  Sparkles, 
  AlertCircle,
  RotateCcw,
  CheckCircle,
  Lock,
  ArrowRight
} from "lucide-react";
import { StadiumLocation, AppNotification } from "../types";
import { injectSimulationState } from "../services/simulatorService";

interface OperationsSimulatorProps {
  currentRole: string;
  stadium: StadiumLocation;
  onSimulationTriggered: (
    newNotification?: AppNotification, 
    customMessage?: string
  ) => Promise<void>;
  onResetSimulation: () => Promise<void>;
  onChangeRole: (role: any) => void;
}

const OperationsSimulator = React.memo(function OperationsSimulator({
  currentRole,
  stadium,
  onSimulationTriggered,
  onResetSimulation,
  onChangeRole
}: OperationsSimulatorProps) {
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isAdmin = currentRole.toLowerCase() === "admin";

  const triggerSimulation = useCallback(async (type: string, name: string) => {
    if (!isAdmin) return;
    setLoadingAction(type);
    setSuccessMessage(null);

    try {
      const now = new Date();
      const timestamp = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      const simpleTimestamp = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      
      const { notifObj, msg } = await injectSimulationState(
        type, 
        stadium, 
        now, 
        timestamp, 
        simpleTimestamp
      );

      // Notify parent to fetch data and log simulation action
      await onSimulationTriggered(notifObj, msg);
      setActiveSimulation(type);
      setSuccessMessage(`Simulation Active: ${name}`);
    } catch (err: any) {
      console.error("Simulation failed:", err);
    } finally {
      setLoadingAction(null);
    }
  }, [isAdmin, stadium, onSimulationTriggered]);

  const handleReset = useCallback(async () => {
    setLoadingAction("reset");
    setSuccessMessage(null);
    try {
      await onResetSimulation();
      setActiveSimulation(null);
      setSuccessMessage("All simulator variables reset to clean baseline.");
    } catch (err) {
      console.error("Reset simulation failed:", err);
    } finally {
      setLoadingAction(null);
    }
  }, [onResetSimulation]);

  const simulatorActions = [
    {
      type: "crowd_increase",
      name: "Crowd Surge",
      description: "Increase Gate A pressure to critical",
      icon: Users,
      color: "bg-sky-500/10 border-sky-500/20 text-sky-400 hover:bg-sky-500/20"
    },
    {
      type: "parking_full",
      name: "Parking Full",
      description: "Saturate Lot A to 100% capacity",
      icon: Car,
      color: "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
    },
    {
      type: "gate_closure",
      name: "Gate Closure",
      description: "Shut Gate B and offline scanners",
      icon: DoorClosed,
      color: "bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20"
    },
    {
      type: "medical_incident",
      name: "Medical Alert",
      description: "Register Heat Stroke at Section 112",
      icon: Heart,
      color: "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
    },
    {
      type: "security_incident",
      name: "Security Threat",
      description: "Log suspicious bag near outer Gate D",
      icon: ShieldAlert,
      color: "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
    },
    {
      type: "weather_warning",
      name: "Weather Threat",
      description: "Activate severe convective cell alert",
      icon: CloudLightning,
      color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
    },
    {
      type: "shuttle_delay",
      name: "Shuttle Delay",
      description: "Spike shuttle link wait to 40 mins",
      icon: Clock,
      color: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20"
    }
  ];

  return (
    <div id="operations-crisis-simulator" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header section */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <Sparkles className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              Live Operations & Stress Simulator
              {activeSimulation && (
                <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-amber-950/60 text-amber-400 border border-amber-500/20 animate-pulse">
                  SIM_ACTIVE
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Force state inject operations parameters directly to cloud Firestore and test real-time AI Recommendations response.
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={handleReset}
            disabled={loadingAction === "reset"}
            className="px-2.5 py-1 text-[10.5px] font-medium bg-slate-950 border border-slate-850 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1 hover:border-slate-700 disabled:opacity-40"
            title="Purge all simulated records and recover stable default baselines"
          >
            <RotateCcw className={`h-3 w-3 ${loadingAction === "reset" ? "animate-spin" : ""}`} />
            Reset Baseline
          </button>
        )}
      </div>

      {/* Role Restriction Guard */}
      {!isAdmin ? (
        <div className="p-6 bg-slate-950/65 border border-slate-850 rounded-xl text-center space-y-4">
          <div className="mx-auto w-10 h-10 bg-amber-500/10 border border-amber-500/25 text-amber-400 rounded-xl flex items-center justify-center">
            <Lock className="h-5 w-5" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h4 className="text-xs font-bold text-white">Administrator Access Restriction</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Stress simulator parameters write operations directly to Firestore, altering the active crowd maps and global dispatcher feeds. Change your role to Admin using the selector below to unlock simulations.
            </p>
          </div>
          <button
            onClick={() => onChangeRole("Admin")}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-all shadow-md cursor-pointer flex items-center gap-1.5 mx-auto hover:scale-[1.02]"
          >
            Switch to Admin Role
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Status Display Feed */}
          {successMessage && (
            <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-2 text-[11px] animate-fade-in">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400 animate-pulse" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {/* Quick Inject Action Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {simulatorActions.map((act) => {
              const ActionIcon = act.icon;
              const isSimActive = activeSimulation === act.type;
              const isActionLoading = loadingAction === act.type;

              return (
                <button
                  key={act.type}
                  onClick={() => triggerSimulation(act.type, act.name)}
                  disabled={!!loadingAction}
                  className={`border p-3.5 rounded-xl flex flex-col justify-between text-left transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                    isSimActive 
                      ? "bg-slate-950 border-indigo-500 shadow-md ring-1 ring-indigo-500/30" 
                      : act.color
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex justify-between items-start w-full">
                    <div className="p-1.5 bg-slate-950/45 rounded-lg border border-slate-800">
                      <ActionIcon className="h-4 w-4" />
                    </div>
                    {isSimActive && (
                      <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping"></span>
                    )}
                  </div>

                  <div className="mt-4">
                    <h4 className="text-xs font-bold text-white tracking-tight flex items-center gap-1">
                      {act.name}
                      {isActionLoading && <Clock className="h-2.5 w-2.5 animate-spin" />}
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-normal mt-0.5 font-medium">{act.description}</p>
                  </div>

                  {/* Active Card Indicator */}
                  {isSimActive && (
                    <div className="absolute right-0 bottom-0 px-2 py-0.5 bg-indigo-500 text-[8px] font-bold text-white uppercase rounded-tl-lg">
                      Active
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-slate-950/45 border border-slate-850 rounded-xl flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
            <div className="text-[10.5px] leading-relaxed text-slate-400">
              <span className="font-bold text-slate-300">Auto-propagation Loop:</span> Triggering any simulation saves the updated telemetry to Firestore. The local dashboard state, alert queues, maps, and Recharts metrics will immediately synchronize, and the <span className="text-[#6EB8E1] font-semibold">Executive AI</span> recommendations system will automatically trigger a new analysis based on the live simulation data.
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default OperationsSimulator;
