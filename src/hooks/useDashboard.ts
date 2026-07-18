import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { 
  UserRole, 
  StadiumState, 
  StadiumLocation, 
  SustainabilityMetric, 
  VolunteerTask, 
  AppNotification 
} from "../types";
import { 
  STADIUMS, 
  INITIAL_STADIUM_STATE, 
  DEFAULT_VOLUNTEER_TASKS 
} from "../constants";
import { 
  firestoreServices, 
  executeBatch 
} from "../firebase/firestore";
import { doc, where, limit } from "firebase/firestore";
import { seedInitialFirestoreData } from "../services/seedService";


export function useDashboard(onLogout: () => void) {
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
  const seedInitialData = useCallback(async () => {
    await seedInitialFirestoreData();
  }, []);

  // Helper to process fetched Firestore datasets and safely bind them to the local states
  const applyDataToState = useCallback((
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
  }, [selectedStadium]);

  // Main setup function to initialize realtime listeners for active dashboard states
  const setupFirestoreListeners = useCallback(() => {
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
    const initTimer = setTimeout(async () => {
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
      clearTimeout(initTimer);
      unsubCrowd();
      unsubParking();
      unsubTransport();
      unsubAlerts();
      unsubSust();
      unsubVolunteers();
    };
  }, [selectedStadium.id, seedInitialData, applyDataToState]);

  // Initialize realtime listeners on active stadium selection change
  useEffect(() => {
    const cleanup = setupFirestoreListeners();
    return () => {
      cleanup();
    };
  }, [setupFirestoreListeners]);

  // Log a new incident securely to Firestore and populate the Notification Center
  const handleAddIncident = useCallback(async (newInc: {
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
  }, [selectedStadium]);

  // Dispatch volunteers/responders to incident and update Firestore & Notification Center
  const handleDispatchIncident = useCallback(async (incidentId: string) => {
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
  const handleResolveIncident = useCallback(async (incidentId: string) => {
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
  const handleApplySimParams = useCallback(async () => {
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
  }, [selectedStadium, customGatePressure, customQueueTime]);

  const handleSimulationTriggered = useCallback(async (newNotification?: AppNotification) => {
    if (newNotification) {
      setNotifications((prev) => [newNotification, ...prev]);
    }
  }, []);

  const handleResetSimulation = useCallback(async () => {
    await seedInitialData();
  }, [seedInitialData]);

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
  
  const handleRoleChange = useCallback((r: UserRole) => {
    switchRole(r);
  }, [switchRole]);

  return {
    selectedStadium,
    setSelectedStadium,
    stadiumState,
    volunteerTasks,
    searchQuery,
    setSearchQuery,
    activeConsole,
    setActiveConsole,
    sustainabilityData,
    isDataLoading,
    dbStatus,
    dbError,
    customGatePressure,
    setCustomGatePressure,
    customQueueTime,
    setCustomQueueTime,
    notifications,
    currentRole,
    handleDismissNotification,
    handleDismissAllNotifications,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleNewNotification,
    handleRoleChange,
    handleAddIncident,
    handleDispatchIncident,
    handleResolveIncident,
    handleSimulationTriggered,
    handleResetSimulation,
    handleApplySimParams
  };
}
