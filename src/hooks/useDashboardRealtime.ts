import { useState, useEffect, useCallback } from "react";
import { where, limit } from "firebase/firestore";
import { 
  StadiumLocation, 
  StadiumState, 
  SustainabilityMetric, 
  VolunteerTask 
} from "../types";
import { 
  INITIAL_STADIUM_STATE, 
  DEFAULT_VOLUNTEER_TASKS 
} from "../constants";
import { firestoreServices } from "../services/dbServices";
import { seedInitialFirestoreData } from "../services/seedService";

export function useDashboardRealtime(selectedStadium: StadiumLocation) {
  const [stadiumState, setStadiumState] = useState<StadiumState>(INITIAL_STADIUM_STATE);
  const [volunteerTasks, setVolunteerTasks] = useState<VolunteerTask[]>(DEFAULT_VOLUNTEER_TASKS);
  
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

  // Seeding helper to pre-fill the database if it is empty
  const seedInitialData = useCallback(async () => {
    await seedInitialFirestoreData();
  }, []);

  // Helper to process fetched Firestore datasets and safely bind them to local states
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
    const venueAlerts = alertsDocs.filter(d => 
      d.id?.includes(selectedStadium.id) || 
      d.stadiumId === selectedStadium.id || 
      d.id?.startsWith("inc_") || 
      d.id?.startsWith("inc-")
    );

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

  return {
    stadiumState,
    setStadiumState,
    volunteerTasks,
    setVolunteerTasks,
    sustainabilityData,
    isDataLoading,
    dbStatus,
    dbError,
    seedInitialData
  };
}
