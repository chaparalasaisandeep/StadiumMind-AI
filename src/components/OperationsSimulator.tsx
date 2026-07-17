import React, { useState } from "react";
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
  Play,
  RotateCcw,
  CheckCircle,
  Lock,
  ArrowRight
} from "lucide-react";
import { firestoreServices } from "../firebase/firestore";
import { StadiumLocation, AppNotification, AlertIncident } from "../types";

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

export default function OperationsSimulator({
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

  const triggerSimulation = async (type: string, name: string) => {
    if (!isAdmin) return;
    setLoadingAction(type);
    setSuccessMessage(null);

    try {
      const now = new Date();
      const timestamp = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      const simpleTimestamp = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      
      let notifObj: AppNotification | undefined;
      let msg = "";

      switch (type) {
        case "crowd_increase": {
          // 1. Update Firestore crowd state
          const crowdId = `gate_a_${stadium.id}`;
          await firestoreServices.crowd.save(crowdId, {
            id: crowdId,
            stadiumId: stadium.id,
            gateId: "gate_a",
            pressure: "high",
            flowRate: 345,
            congestionIndex: 96,
            timestamp: now.toISOString()
          });

          // 2. Formulate Notification
          notifObj = {
            id: `sim-crowd-${Date.now()}`,
            type: "crowd",
            message: `⚠️ SIMULATION: Surge alert registered for Gate A. Sensor reads Critical Congestion (96% Ingress Pressure / 345 ppm flow rate).`,
            timestamp,
            isRead: false,
            stadiumId: stadium.id
          };
          msg = "Simulated high crowd surge at Gate A.";
          break;
        }

        case "parking_full": {
          // 1. Update Firestore parking lot state
          const lotId = `park_1_${stadium.id}`;
          await firestoreServices.parking.save(lotId, {
            id: lotId,
            stadiumId: stadium.id,
            lotName: "Lot A (North Terminal)",
            occupancyPercentage: 100,
            status: "full",
            accessibilitySpotsFree: 0
          });

          notifObj = {
            id: `sim-park-${Date.now()}`,
            type: "shuttle",
            message: `⚠️ SIMULATION: Parking Terminal Lot A is reported at 100% capacity. Status altered to At Capacity.`,
            timestamp,
            isRead: false,
            stadiumId: stadium.id
          };
          msg = "Simulated Parking Lot A saturation to 100%.";
          break;
        }

        case "gate_closure": {
          // 1. Update Firestore crowd to high/closed
          const crowdId = `gate_b_${stadium.id}`;
          await firestoreServices.crowd.save(crowdId, {
            id: crowdId,
            stadiumId: stadium.id,
            gateId: "gate_b",
            pressure: "high",
            flowRate: 15, // near zero because closed/blocked
            congestionIndex: 99,
            timestamp: now.toISOString()
          });

          // 2. Save a specific congestion alert incident
          const incId = `inc-gate-close-${Date.now()}`;
          await firestoreServices.alerts.save(incId, {
            id: incId,
            title: "Gate B Scanner Core Down",
            type: "congestion",
            severity: "high",
            location: "Gate B Inbound",
            lat: stadium.lat - 0.0004,
            lng: stadium.lng + 0.0006,
            status: "reported",
            timestamp: simpleTimestamp
          });

          notifObj = {
            id: `sim-gate-${Date.now()}`,
            type: "gate",
            message: `⚠️ SIMULATION: Gate B electronic turnstiles offline. Inbound crowd diverted to adjacent channels immediately.`,
            timestamp,
            isRead: false,
            stadiumId: stadium.id
          };
          msg = "Simulated urgent scanner offline event / Gate closure.";
          break;
        }

        case "medical_incident": {
          // 1. Save high severity medical incident to alerts collection
          const incId = `inc-med-${Date.now()}`;
          const newIncident: AlertIncident = {
            id: incId,
            title: "Spectator Collapse (Heat Stroke)",
            type: "medical",
            severity: "high",
            location: "Concourse Section 112",
            lat: stadium.lat + 0.0008,
            lng: stadium.lng - 0.0004,
            status: "reported",
            timestamp: simpleTimestamp
          };
          await firestoreServices.alerts.save(incId, newIncident);

          notifObj = {
            id: `sim-med-${Date.now()}`,
            type: "emergency",
            message: `⚠️ SIMULATION: Medical Alert - Spectator down with heat stroke symptoms at Upper Concourse Section 112. Medic squad requested.`,
            timestamp,
            isRead: false,
            stadiumId: stadium.id
          };
          msg = "Simulated critical medical incident at Section 112.";
          break;
        }

        case "security_incident": {
          // 1. Save high severity security incident to alerts collection
          const incId = `inc-sec-${Date.now()}`;
          const newIncident: AlertIncident = {
            id: incId,
            title: "Suspicious Package / Unattended Bag",
            type: "security",
            severity: "high",
            location: "Gate D Outer Gatehouse",
            lat: stadium.lat - 0.0007,
            lng: stadium.lng - 0.0006,
            status: "reported",
            timestamp: simpleTimestamp
          };
          await firestoreServices.alerts.save(incId, newIncident);

          notifObj = {
            id: `sim-sec-${Date.now()}`,
            type: "emergency",
            message: `⚠️ SIMULATION: Security Alert - Unattended baggage reported near Gate D secure perimeter. K9 unit dispatched.`,
            timestamp,
            isRead: false,
            stadiumId: stadium.id
          };
          msg = "Simulated security hazard near Gate D.";
          break;
        }

        case "weather_warning": {
          // 1. Save high severity weather incident to alerts
          const incId = `inc-weather-${Date.now()}`;
          const newIncident: AlertIncident = {
            id: incId,
            title: "Severe Lightning Storm Cell",
            type: "maintenance",
            severity: "high",
            location: "Open Air Canopy",
            lat: stadium.lat + 0.0002,
            lng: stadium.lng + 0.0001,
            status: "reported",
            timestamp: simpleTimestamp
          };
          await firestoreServices.alerts.save(incId, newIncident);

          notifObj = {
            id: `sim-weather-${Date.now()}`,
            type: "weather",
            message: `⚠️ SIMULATION: Lightning Strike Risk active. Ground maintenance team advising stadium roof closure procedures.`,
            timestamp,
            isRead: false,
            stadiumId: stadium.id
          };
          msg = "Simulated severe convective weather threat.";
          break;
        }

        case "shuttle_delay": {
          // 1. Update transit schedule wait times
          const transportId = `shut_1_${stadium.id}`;
          await firestoreServices.transport.save(transportId, {
            id: transportId,
            stadiumId: stadium.id,
            route: "Express Metro Link",
            type: "shuttle",
            activeUnits: 3, // drop active units
            waitTimeMinutes: 40, // high wait time
            status: "delayed"
          });

          notifObj = {
            id: `sim-shuttle-${Date.now()}`,
            type: "shuttle",
            message: `⚠️ SIMULATION: Mass transit alert - Metro shuttle delays have exceeded 40 minutes due to heavy gridlock at intersection 5.`,
            timestamp,
            isRead: false,
            stadiumId: stadium.id
          };
          msg = "Simulated severe Express Link shuttle delays.";
          break;
        }

        default:
          break;
      }

      // Notify parent to fetch data and log simulation action
      await onSimulationTriggered(notifObj, msg);
      setActiveSimulation(type);
      setSuccessMessage(`Simulation Active: ${name}`);
    } catch (err: any) {
      console.error("Simulation failed:", err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReset = async () => {
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
  };

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
            <h4 className="text-xs font-bold text-white">Administrator Access Restricton</h4>
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
}
