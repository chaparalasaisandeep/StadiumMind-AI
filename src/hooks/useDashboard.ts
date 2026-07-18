import { useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { 
  UserRole, 
  StadiumLocation, 
  AppNotification 
} from "../types";
import { STADIUMS } from "../constants";
import { useNotifications } from "./useNotifications";
import { useDashboardRealtime } from "./useDashboardRealtime";
import { 
  createIncidentInDb, 
  dispatchIncidentInDb, 
  resolveIncidentInDb, 
  applySimulationParamsInDb 
} from "../services/stadiumOperationsService";

export function useDashboard(onLogout: () => void) {
  const { user, switchRole } = useAuth();
  const currentRole = user?.role || "Fan";

  const [selectedStadium, setSelectedStadium] = useState<StadiumLocation>(STADIUMS[1]); // SoFi Stadium as default
  const [searchQuery, setSearchQuery] = useState("");
  const [activeConsole, setActiveConsole] = useState<"operations" | "telemetry" | "logistics">("operations");

  // Custom Notifications Hook
  const {
    notifications,
    setNotifications,
    handleDismissNotification,
    handleDismissAllNotifications,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleNewNotification
  } = useNotifications();

  // Custom Dashboard Realtime Hook
  const {
    stadiumState,
    setStadiumState,
    volunteerTasks,
    setVolunteerTasks,
    sustainabilityData,
    isDataLoading,
    dbStatus,
    dbError,
    seedInitialData
  } = useDashboardRealtime(selectedStadium);

  // Simulation parameter states
  const [customGatePressure, setCustomGatePressure] = useState<"low" | "medium" | "high">("high");
  const [customQueueTime, setCustomQueueTime] = useState(25);

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

    try {
      await createIncidentInDb(incId, freshIncident);
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
  }, [selectedStadium, setNotifications, setStadiumState]);

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
      await dispatchIncidentInDb(incidentId, updatedIncident, newTask.id, newTask);
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
  }, [stadiumState.incidents, setNotifications, setStadiumState, setVolunteerTasks]);

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
      await resolveIncidentInDb(incidentId, { ...targetIncident, status: "resolved" as const });
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
  }, [stadiumState.incidents, setNotifications, setStadiumState]);

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
      await applySimulationParamsInDb(
        crowdId, 
        selectedStadium.id, 
        customGatePressure, 
        flowVal, 
        isHigh ? 95 : customGatePressure === "medium" ? 60 : 25
      );
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
  }, [selectedStadium, customGatePressure, customQueueTime, setNotifications, setStadiumState]);

  const handleSimulationTriggered = useCallback(async (newNotification?: AppNotification) => {
    if (newNotification) {
      setNotifications((prev) => [newNotification, ...prev]);
    }
  }, [setNotifications]);

  const handleResetSimulation = useCallback(async () => {
    await seedInitialData();
  }, [seedInitialData]);

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
