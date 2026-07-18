import DashboardSidebar from "../components/DashboardSidebar";
import React, { useState, useEffect, lazy, Suspense } from "react";
import { useAuth } from "../contexts/AuthContext";
import { UserRole, StadiumState, StadiumLocation, SustainabilityMetric, VolunteerTask, AppNotification } from "../types";
import { STADIUMS, INITIAL_STADIUM_STATE, DEFAULT_VOLUNTEER_TASKS } from "../constants";
import RoleSelector from "../components/RoleSelector";
import AICommandCenter from "../components/AICommandCenter";
import AIRecommendationsPanel from "../components/AIRecommendationsPanel";
import OperationalMetrics from "../components/OperationalMetrics";
import EmergencyIncidentLogger from "../components/EmergencyIncidentLogger";
import NotificationCenter from "../components/NotificationCenter";
import OperationsSimulator from "../components/OperationsSimulator";
import { Skeleton, SkeletonCard } from "../components/ui/Skeleton";
import { motion, AnimatePresence } from "motion/react";

// Route sub-panels loaded lazily to optimize bundle size and TTI
const StadiumMap = lazy(() => import("../components/StadiumMap"));
const AccessibilitySuite = lazy(() => import("../components/AccessibilitySuite"));
const SensorTelemetryPanel = lazy(() => import("../components/SensorTelemetryPanel"));
const LogisticsGuardsPanel = lazy(() => import("../components/LogisticsGuardsPanel"));

import { firestoreServices, executeBatch } from "../firebase/firestore";
import { writeBatch, getFirestore, doc } from "firebase/firestore";
import { where, limit, orderBy } from "firebase/firestore";
import { 
  Building2, 
  MapPin, 
  Tv2, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Sliders,
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  Bell,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Info,
  Leaf,
  Zap,
  Droplet,
  RefreshCw
} from "lucide-react";

// Module-level lock to prevent concurrent seeding race conditions across multiple components or hooks
let isSeedingActive = false;

interface DashboardPageProps {
  onLogout: () => void;
}

export default function DashboardPage({ onLogout }: DashboardPageProps) {
  const { user, switchRole } = useAuth();
  const currentRole = user?.role || "Fan";

  const [selectedStadium, setSelectedStadium] = useState<StadiumLocation>(STADIUMS[1]); // SoFi Stadium as default
  const [stadiumState, setStadiumState] = useState<StadiumState>(INITIAL_STADIUM_STATE);
  const [volunteerTasks, setVolunteerTasks] = useState<VolunteerTask[]>(DEFAULT_VOLUNTEER_TASKS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeConsole, setActiveConsole] = useState<"operations" | "telemetry" | "logistics">("operations");
  
  // Sustainability Metric State
  const [sustainabilityData, setSustainabilityData] = useState<SustainabilityMetric>({
    id: `sust_sofi`,
    stadiumId: "sofi",
    wasteRecycledKg: 4850,
    energySavedKwh: 12400,
    waterSavedLitres: 85300,
    timestamp: new Date().toISOString()
  });

  // DB Sync and Loading states
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<"connected" | "fallback" | "syncing">("connected");
  const [dbError, setDbError] = useState<string | null>(null);

  // Simulation parameter states
  const [customGatePressure, setCustomGatePressure] = useState<"low" | "medium" | "high">("high");
  const [customQueueTime, setCustomQueueTime] = useState(25);

  // Comprehensive notification feeds representing multiple operational channels
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

  // Seeding helper to pre-fill the database if it is empty
  const seedInitialData = React.useCallback(async () => {
    if (isSeedingActive) {
      console.log("Seeding already in progress, skipping concurrent duplicate attempt.");
      return;
    }
    isSeedingActive = true;
    try {
      console.log("Seeding initial data into Firestore...");
      await executeBatch((batch, db) => {

      STADIUMS.forEach(stadium => {
        // 1. Seed crowd metrics for this stadium's gates
        INITIAL_STADIUM_STATE.activeGates.forEach(gate => {
          const crowdId = `${gate.id}_${stadium.id}`;
          batch.set(doc(db, "crowd", crowdId), {
              id: crowdId,
              stadiumId: stadium.id,
              gateId: gate.id,
              pressure: gate.pressure,
              flowRate: gate.flowRate,
              congestionIndex: gate.pressure === "high" ? 85 : gate.pressure === "medium" ? 50 : 20,
              timestamp: new Date().toISOString()
            }, { merge: true });
        });

        // 2. Seed parking lot for this stadium
        const lotId = `park_1_${stadium.id}`;
        batch.set(doc(db, "parking", lotId), {
            id: lotId,
            stadiumId: stadium.id,
            lotName: "Lot A (North Terminal)",
            occupancyPercentage: stadium.id === "sofi" ? 92 : stadium.id === "metlife" ? 84 : 75,
            status: stadium.id === "sofi" ? "busy" : "available",
            accessibilitySpotsFree: 15
          }, { merge: true });

        // 3. Seed transit / shuttle for this stadium
        const transportId = `shut_1_${stadium.id}`;
        batch.set(doc(db, "transport", transportId), {
            id: transportId,
            stadiumId: stadium.id,
            route: "Express Metro Link",
            type: "shuttle",
            activeUnits: stadium.id === "sofi" ? 12 : 8,
            waitTimeMinutes: stadium.id === "sofi" ? 6 : 10,
            status: "normal"
          }, { merge: true });

        // 4. Seed sustainability for this stadium
        const sustId = `sust_1_${stadium.id}`;
        batch.set(doc(db, "sustainability", sustId), {
            id: sustId,
            stadiumId: stadium.id,
            wasteRecycledKg: stadium.id === "sofi" ? 4850 : 3120,
            energySavedKwh: stadium.id === "sofi" ? 12400 : 9100,
            waterSavedLitres: stadium.id === "sofi" ? 85300 : 54200,
            timestamp: new Date().toISOString()
          }, { merge: true });

        // 5. Seed incidents for this stadium
        INITIAL_STADIUM_STATE.incidents.forEach((inc, idx) => {
          const incId = `inc_${idx + 1}_${stadium.id}`;
          batch.set(doc(db, "alerts", incId), {
              id: incId,
              title: inc.title,
              type: inc.type,
              severity: inc.severity,
              location: inc.location,
              lat: stadium.lat + (idx === 0 ? 0.0007 : idx === 1 ? -0.0012 : 0.0008),
              lng: stadium.lng + (idx === 0 ? -0.0005 : idx === 1 ? 0.0008 : -0.0011),
              status: inc.status,
              timestamp: inc.timestamp
            }, { merge: true });
        });
      });

      // 6. Seed volunteer tasks
      DEFAULT_VOLUNTEER_TASKS.forEach((task, idx) => {
        const taskId = `task_${idx + 1}`;
        batch.set(doc(db, "volunteers", taskId), {
            id: taskId,
            title: task.title,
            description: task.description,
            assignedTo: task.assignedTo,
            section: task.section,
            status: task.status
          }, { merge: true });
      });

      });
      console.log("Successfully completed seeding initial Firestore records!");
    } catch (err) {
      console.error("Failed to seed initial data to Firestore. Ensure internet connection is stable:", err);
    } finally {
      isSeedingActive = false;
    }
  }, [selectedStadium.id]);

  // Main setup function to initialize realtime listeners for active dashboard states
  const setupFirestoreListeners = React.useCallback(() => {
    setIsDataLoading(true);
    setDbError(null);
    setDbStatus("syncing");
    
    let isInitialized = false;
    let localCrowd: any[] = [];
    let localParking: any[] = [];
    let localTransport: any[] = [];
    let localAlerts: any[] = [];
    let localSust: any[] = [];
    let localVolunteers: any[] = [];
    
    const updateState = () => {
      applyDataToState(localCrowd, localParking, localTransport, localAlerts, localSust, localVolunteers);
    };

    const unsubCrowd = firestoreServices.crowd.subscribe((docs) => {
      localCrowd = docs;
      if (isInitialized) updateState();
    }, where("stadiumId", "==", selectedStadium.id));

    const unsubParking = firestoreServices.parking.subscribe((docs) => {
      localParking = docs;
      if (isInitialized) updateState();
    }, where("stadiumId", "==", selectedStadium.id));

    const unsubTransport = firestoreServices.transport.subscribe((docs) => {
      localTransport = docs;
      if (isInitialized) updateState();
    }, where("stadiumId", "==", selectedStadium.id));

    const unsubAlerts = firestoreServices.alerts.subscribe((docs) => {
      localAlerts = docs;
      if (isInitialized) updateState();
    }, limit(100));

    const unsubSust = firestoreServices.sustainability.subscribe((docs) => {
      localSust = docs;
      if (isInitialized) updateState();
    }, where("stadiumId", "==", selectedStadium.id));

    const unsubVolunteers = firestoreServices.volunteers.subscribe((docs) => {
      localVolunteers = docs;
      if (isInitialized) updateState();
    }, limit(100));

    // Check if initial seeding is needed after brief delay to allow first snapshot
    setTimeout(async () => {
      const totalDocs = localCrowd.length + localParking.length + localTransport.length + localSust.length;
      if (totalDocs === 0) {
        await seedInitialData();
      }
      isInitialized = true;
      updateState();
      setDbStatus("connected");
      setIsDataLoading(false);
    }, 1500);

    return () => {
      unsubCrowd();
      unsubParking();
      unsubTransport();
      unsubAlerts();
      unsubSust();
      unsubVolunteers();
    };
  }, [selectedStadium.id]);

  // Helper to process fetched Firestore datasets and safely bind them to the local states
  const applyDataToState = React.useCallback((
    crowdDocs: any[],
    parkingDocs: any[],
    transportDocs: any[],
    alertsDocs: any[],
    sustDocs: any[],
    volunteerDocs: any[]
  ) => {
    // 1. Filter by the currently active stadium venue
    const venueCrowd = crowdDocs.filter(d => d.stadiumId === selectedStadium.id);
    const venueParking = parkingDocs.filter(d => d.stadiumId === selectedStadium.id);
    const venueTransport = transportDocs.filter(d => d.stadiumId === selectedStadium.id);
    const venueSust = sustDocs.filter(d => d.stadiumId === selectedStadium.id);
    const venueAlerts = alertsDocs.filter(d => d.id?.includes(selectedStadium.id) || d.stadiumId === selectedStadium.id || d.id?.startsWith("inc_") || d.id?.startsWith("inc-"));

    // 2. Bind Volunteer tasks
    if (volunteerDocs && volunteerDocs.length > 0) {
      setVolunteerTasks(volunteerDocs);
    }

    // 3. Bind Sustainability data
    if (venueSust && venueSust.length > 0) {
      setSustainabilityData(venueSust[0]);
    } else {
      setSustainabilityData({
        id: `sust_${selectedStadium.id}`,
        stadiumId: selectedStadium.id,
        wasteRecycledKg: selectedStadium.id === "sofi" ? 4850 : 3120,
        energySavedKwh: selectedStadium.id === "sofi" ? 12400 : 9100,
        waterSavedLitres: selectedStadium.id === "sofi" ? 85300 : 54200,
        timestamp: new Date().toISOString()
      });
    }

    // 4. Update core StadiumState variables
    setStadiumState((prev) => {
      // Map gates data if available
      const activeGates = prev.activeGates.map(gate => {
        const match = venueCrowd.find(c => c.gateId === gate.id);
        if (match) {
          return {
            ...gate,
            pressure: match.pressure,
            flowRate: match.flowRate,
            status: match.pressure === "high" ? ("congested" as const) : ("open" as const)
          };
        }
        return gate;
      });

      // Map transit state elements
      const shuttle = venueTransport.find(t => t.type === "shuttle");
      const parkingLot = venueParking[0];

      const transit = {
        ...prev.transit,
        shuttles: shuttle ? {
          id: shuttle.id,
          route: shuttle.route,
          active: shuttle.activeUnits,
          waitTime: shuttle.waitTimeMinutes
        } : prev.transit.shuttles,
        parkingLots: parkingLot ? {
          id: parkingLot.id,
          occupancy: parkingLot.occupancyPercentage,
          status: parkingLot.status === "full" ? "At Capacity" : parkingLot.status === "busy" ? "Near Capacity" : "Spaces Available"
        } : prev.transit.parkingLots
      };

      // Map alert incidents
      const mappedIncidents = venueAlerts.map(a => ({
        id: a.id,
        title: a.title,
        type: a.type,
        severity: a.severity,
        location: a.location,
        lat: a.lat || selectedStadium.lat,
        lng: a.lng || selectedStadium.lng,
        status: a.status || "reported",
        timestamp: a.timestamp || "01:00"
      }));

      return {
        ...prev,
        activeGates,
        transit,
        incidents: mappedIncidents.length > 0 ? mappedIncidents : prev.incidents
      };
    });
  }, [selectedStadium.id]);

  // Initialize realtime listeners on active stadium selection change
  useEffect(() => {
    const cleanup = setupFirestoreListeners();
    return () => {
      cleanup();
    };
  }, [setupFirestoreListeners]);

  // Log a new incident securely to Firestore and populate the Notification Center
  const handleAddIncident = React.useCallback(async (newInc: {
    title: string;
    type: "security" | "medical" | "congestion" | "maintenance";
    severity: "low" | "medium" | "high";
    location: string;
  }) => {
    const incId = `inc-${Date.now()}`;
    const freshIncident = {
      id: incId,
      stadiumId: selectedStadium.id,
      title: newInc.title,
      type: newInc.type,
      severity: newInc.severity,
      location: newInc.location,
      lat: selectedStadium.lat + (Math.random() - 0.5) * 0.0015,
      lng: selectedStadium.lng + (Math.random() - 0.5) * 0.0015,
      status: "reported" as const,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const notifType = newInc.type === "congestion" ? "crowd" : "emergency";
    const notifObj: AppNotification = {
      id: `notif-inc-${Date.now()}`,
      type: notifType,
      message: `Emergency Alert: [${newInc.severity.toUpperCase()}] ${newInc.title} logged at ${newInc.location}. Dispatch status: PENDING.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isRead: false
    };

    // Save to Firestore alert collection first
    try {
      await firestoreServices.alerts.save(incId, freshIncident);
      setNotifications((prev) => [notifObj, ...prev]);
      
    } catch (err) {
      console.warn("Could not save to remote Firestore. Logging locally:", err);
      // Fallback to local state if offline/unconfigured
      setStadiumState((prev) => ({
        ...prev,
        incidents: [freshIncident, ...prev.incidents]
      }));
      setNotifications((prev) => [notifObj, ...prev]);
    }
  }, [selectedStadium.id]);

  // Dispatch volunteers/responders to incident and update Firestore & Notification Center
  const handleDispatchIncident = React.useCallback(async (incidentId: string) => {
    const targetIncident = stadiumState.incidents.find(inc => inc.id === incidentId);
    if (!targetIncident) return;

    const updatedIncident = { ...targetIncident, status: "dispatched" as const };
    const newTask = {
      id: `vtask-${Date.now()}`,
      title: `Respond to: ${targetIncident.title}`,
      description: `Dispatch requested at ${targetIncident.location}. Coordinate directly with command hub.`,
      assignedTo: "Volunteer #" + Math.floor(Math.random() * 20 + 1),
      section: targetIncident.location,
      status: "in-progress" as const
    };

    const notifObj: AppNotification = {
      id: `notif-disp-${Date.now()}`,
      type: "emergency",
      message: `Dispatcher Update: Authorized responders routed to ${targetIncident.location} for '${targetIncident.title}'.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isRead: false
    };

    try {
      // Save updated status and the new volunteer task to Firestore
      await executeBatch((batch, db) => {
        batch.set(doc(db, "alerts", incidentId), updatedIncident, { merge: true });
        batch.set(doc(db, "volunteers", newTask.id), newTask, { merge: true });
      });
      setNotifications((prev) => [notifObj, ...prev]);
      
    } catch (err) {
      console.warn("Could not save dispatch status to Firestore. Fallback to local execution:", err);
      setStadiumState((prev) => ({
        ...prev,
        incidents: prev.incidents.map((inc) => 
          inc.id === incidentId ? { ...inc, status: "dispatched" as const } : inc
        )
      }));
      setVolunteerTasks((prev) => [newTask, ...prev]);
      setNotifications((prev) => [notifObj, ...prev]);
    }
  }, [stadiumState.incidents]);

  // Resolve an incident and save status to Firestore & Notification Center
  const handleResolveIncident = React.useCallback(async (incidentId: string) => {
    const targetIncident = stadiumState.incidents.find(inc => inc.id === incidentId);
    if (!targetIncident) return;

    const notifObj: AppNotification = {
      id: `notif-res-${Date.now()}`,
      type: "crowd",
      message: `Incident Resolved: Crisis event '${targetIncident.title}' at ${targetIncident.location} has been marked complete and cleared.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isRead: false
    };

    try {
      await firestoreServices.alerts.save(incidentId, { ...targetIncident, status: "resolved" as const });
      setNotifications((prev) => [notifObj, ...prev]);
      
    } catch (err) {
      console.warn("Could not write resolution status to Firestore, resolving locally:", err);
      setStadiumState((prev) => ({
        ...prev,
        incidents: prev.incidents.map((inc) => 
          inc.id === incidentId ? { ...inc, status: "resolved" as const } : inc
        )
      }));
      setNotifications((prev) => [notifObj, ...prev]);
    }
  }, [stadiumState.incidents]);

  // Apply crowd simulator stress factors to Firestore & Notification Center
  const handleApplySimParams = React.useCallback(async () => {
    const crowdId = `gate_a_${selectedStadium.id}`;
    const flowVal = customGatePressure === "high" ? 310 : customGatePressure === "medium" ? 160 : 50;
    const isHigh = customGatePressure === "high";

    const notifType = isHigh ? "gate" : "crowd";
    const notifObj: AppNotification = {
      id: `notif-sim-${Date.now()}`,
      type: notifType,
      message: `Simulator Trigger: Gate A sensor pressure set to [${customGatePressure.toUpperCase()}] with concessions Section 3 queue delays calculated at ${customQueueTime} mins.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isRead: false
    };

    try {
      await firestoreServices.crowd.save(crowdId, {
        id: crowdId,
        stadiumId: selectedStadium.id,
        gateId: "gate_a",
        pressure: customGatePressure,
        flowRate: flowVal,
        congestionIndex: isHigh ? 95 : customGatePressure === "medium" ? 60 : 25,
        timestamp: new Date().toISOString()
      });

      setNotifications((prev) => [notifObj, ...prev]);
      
    } catch (err) {
      console.warn("Could not update simulator parameters in Firestore. Updating locally:", err);
      setStadiumState((prev) => ({
        ...prev,
        activeGates: prev.activeGates.map(gate => 
          gate.id === "gate_a" ? { ...gate, pressure: customGatePressure, flowRate: flowVal, status: isHigh ? "congested" : "open" } : gate
        ),
        concessions: prev.concessions.map(conc => 
          conc.id === "conc_3" ? { ...conc, queueTime: customQueueTime, status: customQueueTime > 30 ? "overloaded" : customQueueTime > 15 ? "busy" : "clear" } : conc
        )
      }));
      setNotifications((prev) => [notifObj, ...prev]);
    }
  }, [selectedStadium.id, customGatePressure, customQueueTime]);

  const handleSimulationTriggered = React.useCallback(async (newNotification?: AppNotification, customMessage?: string) => {
    if (newNotification) {
      setNotifications((prev) => [newNotification, ...prev]);
    }
    
  }, []);

  const handleResetSimulation = React.useCallback(async () => {
    await seedInitialData();
    
  }, [seedInitialData]);

  const handleDismissNotification = React.useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleDismissAllNotifications = React.useCallback(() => {
    setNotifications([]);
  }, []);

  const handleMarkAsRead = React.useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const handleMarkAllAsRead = React.useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const handleNewNotification = React.useCallback((notif: AppNotification) => {
    setNotifications((prev) => [notif, ...prev]);
  }, []);
  
  const handleRoleChange = React.useCallback((r: UserRole) => {
    switchRole(r);
  }, [switchRole]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-[#6EB8E1]/30 antialiased flex">
      
      <DashboardSidebar activeConsole={activeConsole} setActiveConsole={setActiveConsole} onLogout={onLogout} />

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP NAVBAR */}
        <header className="bg-slate-950/80 border-b border-slate-900 sticky top-0 z-30 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#6EB8E1]" />
                <select
                  id="stadium-select-input"
                  value={selectedStadium.id}
                  onChange={(e) => {
                    const target = STADIUMS.find((s) => s.id === e.target.value);
                    if (target) setSelectedStadium(target);
                  }}
                  aria-label="Select Stadium" className="bg-transparent text-xs font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer border-b border-slate-800 rounded-sm"
                >
                  {STADIUMS.map((stadium) => (
                    <option key={stadium.id} value={stadium.id} className="bg-slate-950 text-white">
                      {stadium.name} ({stadium.city})
                    </option>
                  ))}
                </select>
              </div>
              <button onClick={onLogout} className="lg:hidden p-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-400">
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search sectors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search sectors" className="w-full bg-slate-900/60 border border-slate-850 rounded-xl pl-8 pr-3 py-1 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                {dbStatus === "connected" && (
                  <div className="px-3 py-1 bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[9px] font-mono text-emerald-400">FIRESTORE LIVE</span>
                  </div>
                )}
                {dbStatus === "syncing" && (
                  <div className="px-3 py-1 bg-amber-950/20 border border-amber-500/20 rounded-xl flex items-center gap-1.5">
                    <RefreshCw className="h-2.5 w-2.5 text-amber-400 animate-spin" />
                    <span className="text-[9px] font-mono text-amber-400">SYNCING</span>
                  </div>
                )}
                {dbStatus === "fallback" && (
                  <div className="group relative px-3 py-1 bg-rose-950/20 border border-rose-500/20 rounded-xl flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                    <span className="text-[9px] font-mono text-rose-400 cursor-help">OFFLINE FALLBACK</span>
                    {/* Tooltip on hover */}
                    <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 text-slate-200 text-[10px] p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      {dbError || "Lost connection to live datastore."}
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => {}}
                  disabled={isDataLoading}
                  className="p-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                  title="Force Refresh Data"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isDataLoading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* WORKSPACE AREA */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 w-full">
          
          {/* Advanced Notification Hub */}
          <NotificationCenter
            notifications={notifications}
            onDismiss={handleDismissNotification}
            onDismissAll={handleDismissAllNotifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
          />

          {/* Core Role Selector Switch */}
          <RoleSelector currentRole={currentRole} onChangeRole={handleRoleChange} />

          {/* Mobile Console Tab Switcher (Visible only on mobile/tablet screens where sidebar is hidden) */}
          <div className="flex lg:hidden bg-slate-950 p-1 border border-slate-900 rounded-xl gap-1" id="mobile-console-switcher">
            <button
              onClick={() => setActiveConsole("operations")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeConsole === "operations" 
                  ? "bg-slate-900 border border-slate-800 text-white shadow-sm" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Operations
            </button>
            <button
              onClick={() => setActiveConsole("telemetry")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeConsole === "telemetry" 
                  ? "bg-slate-900 border border-slate-800 text-white shadow-sm" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              Telemetry
            </button>
            <button
              onClick={() => setActiveConsole("logistics")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeConsole === "logistics" 
                  ? "bg-slate-900 border border-slate-800 text-white shadow-sm" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Logistics
            </button>
          </div>

          {/* Conditional Console Panels */}
          {activeConsole === "operations" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="operations-bento-grid">
              
              {/* Column 1 & 2: Maps and Analytics */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* AI Recommendations Panel */}
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}><AIRecommendationsPanel stadiumState={stadiumState} stadiumId={selectedStadium.id} /></motion.div>
                
                {/* Stadium Map */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                        <Activity className="h-4.5 w-4.5 text-[#6EB8E1]" />
                        Interactive Perimeter Node Map
                      </h3>
                      <p className="text-xs text-slate-400">Simulated world cup venue geofence. Select incident pins to dispatch first responders.</p>
                    </div>
                  </div>

                  <Suspense fallback={
                    <div className="h-[450px] w-full flex flex-col gap-4 p-4 bg-slate-900/30 border border-slate-800 rounded-xl">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-1/3 bg-slate-800" />
                        <Skeleton className="h-3 w-2/3 bg-slate-800" />
                      </div>
                      <div className="flex-1 w-full bg-slate-850/50 rounded-lg animate-pulse flex items-center justify-center">
                        <span className="text-xs text-slate-500 font-mono">Loading Perimeter OSM Map...</span>
                      </div>
                    </div>
                  }>
                    <StadiumMap 
                      stadium={selectedStadium}
                      stadiumState={stadiumState}
                      onSelectIncident={handleDispatchIncident}
                    />
                  </Suspense>
                </div>

                {/* Specific Sub Panels based on Role */}
                {currentRole === "Volunteer" && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
                    <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
                      <CheckCircle className="h-4.5 w-4.5 text-teal-400" />
                      Active Volunteer Missions & Hydration Units
                    </h3>
                    <div className="space-y-3">
                      {volunteerTasks.map((task) => (
                        <div key={task.id} className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex justify-between items-center">
                          <div>
                            <h4 className="text-xs font-semibold text-slate-200">{task.title}</h4>
                            <p className="text-[11px] text-slate-400 mt-1">{task.description}</p>
                            <div className="flex gap-4 text-[10px] text-slate-500 mt-2 font-mono">
                              <span>SECTOR: {task.section}</span>
                              <span>ASSIGNED_TO: {task.assignedTo}</span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/40 text-amber-400 border border-amber-500/20">
                            {task.status.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentRole === "Accessibility" && (
                  <Suspense fallback={<SkeletonCard />}>
                    <AccessibilitySuite stadiumName={selectedStadium.name} />
                  </Suspense>
                )}

                {currentRole === "Transport" && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-amber-400" />
                      Transit Capacity & Wait Time Monitors
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 text-center">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">Shuttle Queue</span>
                        <h4 className="text-lg font-bold text-white mt-1">{stadiumState.transit.shuttles.waitTime} Mins Wait</h4>
                        <p className="text-[10px] text-slate-500 mt-1">{stadiumState.transit.shuttles.active} Shuttles Active</p>
                      </div>
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 text-center">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">Parking Lot load</span>
                        <h4 className="text-lg font-bold text-amber-400 mt-1">{stadiumState.transit.parkingLots.occupancy}% Load</h4>
                        <p className="text-[10px] text-slate-500 mt-1">{stadiumState.transit.parkingLots.status}</p>
                      </div>
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 text-center">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">Central Rail wait</span>
                        <h4 className="text-lg font-bold text-rose-400 mt-1">{stadiumState.transit.trainStation.congestion} Traffic</h4>
                        <p className="text-[10px] text-slate-500 mt-1">{stadiumState.transit.trainStation.waitTime} Mins queue</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Statistics & Recharts charts */}
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}><OperationalMetrics stadiumState={stadiumState} /></motion.div>

                {/* Sustainability Metric Card */}
                <div className="bg-gradient-to-br from-[#061a15]/40 to-slate-950/90 border border-emerald-950/50 rounded-2xl p-4 shadow-xl">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-900 mb-3.5">
                    <div>
                      <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
                        <Leaf className="h-4 w-4 text-emerald-400 animate-pulse" />
                        Green Footprint & Environmental Sustainability
                      </h3>
                      <p className="text-xs text-slate-400">
                        Live venue resource recovery metrics compiled from localized water reclamation sensors, solar inverter nodes, and organic composting centers.
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 uppercase shrink-0">
                      ISO 14001 COMPLIANT
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Waste Recycled */}
                    <div className="bg-slate-950/50 border border-slate-900 p-3 rounded-xl flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                        <Leaf className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Waste Composted</span>
                        <h4 className="text-sm font-bold text-white mt-0.5">
                          {sustainabilityData.wasteRecycledKg ? `${sustainabilityData.wasteRecycledKg.toLocaleString()} kg` : "0 kg"}
                        </h4>
                        <span className="text-[8px] text-emerald-500 block font-medium">94.2% compost efficiency</span>
                      </div>
                    </div>

                    {/* Energy Saved */}
                    <div className="bg-slate-950/50 border border-slate-900 p-3 rounded-xl flex items-center gap-3">
                      <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg">
                        <Zap className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Energy Saved</span>
                        <h4 className="text-sm font-bold text-white mt-0.5">
                          {sustainabilityData.energySavedKwh ? `${sustainabilityData.energySavedKwh.toLocaleString()} kWh` : "0 kWh"}
                        </h4>
                        <span className="text-[8px] text-amber-500 block font-medium">Solar microgrid contribution</span>
                      </div>
                    </div>

                    {/* Water Saved */}
                    <div className="bg-slate-950/50 border border-slate-900 p-3 rounded-xl flex items-center gap-3">
                      <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-lg">
                        <Droplet className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Water Reclaimed</span>
                        <h4 className="text-sm font-bold text-white mt-0.5">
                          {sustainabilityData.waterSavedLitres ? `${sustainabilityData.waterSavedLitres.toLocaleString()} Litres` : "0 Litres"}
                        </h4>
                        <span className="text-[8px] text-sky-500 block font-medium">Rainwater harvesting active</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Column 3: AI Copilot and Crisis Dispatch Center */}
              <div className="space-y-6">
                
                {/* Operations Simulator */}
                <OperationsSimulator
                  currentRole={currentRole}
                  stadium={selectedStadium}
                  onSimulationTriggered={handleSimulationTriggered}
                  onResetSimulation={handleResetSimulation}
                  onChangeRole={switchRole}
                />

                {/* Gemini Conversational Assistant */}
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="lg:col-span-2"><AICommandCenter 
                  currentRole={currentRole}
                  stadiumState={stadiumState}
                  onDispatchIncident={handleDispatchIncident}
                  stadiumName={selectedStadium.name}
                />

                </motion.div>
                {/* Incident Logging panel */}
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}><EmergencyIncidentLogger 
                  currentRole={currentRole}
                  stadiumState={stadiumState}
                  onAddIncident={handleAddIncident}
                  onDispatchIncident={handleDispatchIncident}
                  onResolveIncident={handleResolveIncident}
                />
                </motion.div>

              </div>

            </div>
          )}

          {activeConsole === "telemetry" && (
            <Suspense fallback={<SkeletonCard />}>
              <SensorTelemetryPanel 
                stadiumName={selectedStadium.name}
                onNewNotification={handleNewNotification}
              />
            </Suspense>
          )}

          {activeConsole === "logistics" && (
            <Suspense fallback={<SkeletonCard />}>
              <LogisticsGuardsPanel 
                stadiumName={selectedStadium.name}
                onNewNotification={handleNewNotification}
              />
            </Suspense>
          )}

        </main>
      </div>

    </div>
  );
}
