import { doc } from "firebase/firestore";
import { firestoreServices, executeBatch } from "../firebase/firestore";
import { StadiumLocation, AppNotification, AlertIncident } from "../types";

/**
 * Executes a simulated crisis injection by mutating live Firestore metrics.
 * Returns the generated live UI notification and high-level summary log message.
 */
export async function injectSimulationState(
  type: string, 
  stadium: StadiumLocation, 
  now: Date, 
  timestamp: string, 
  simpleTimestamp: string
): Promise<{ notifObj: AppNotification; msg: string }> {
  let notifObj: AppNotification;
  let msg = "";

  switch (type) {
    case "crowd_increase": {
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
      const crowdId = `gate_b_${stadium.id}`;
      const incId = `inc-gate-close-${Date.now()}`;

      await executeBatch((batch, db) => {
        batch.set(doc(db, "crowd", crowdId), {
          id: crowdId,
          stadiumId: stadium.id,
          gateId: "gate_b",
          pressure: "high",
          flowRate: 15,
          congestionIndex: 99,
          timestamp: now.toISOString()
        }, { merge: true });
        
        batch.set(doc(db, "alerts", incId), {
          id: incId,
          title: "Gate B Scanner Core Down",
          type: "congestion",
          severity: "high",
          location: "Gate B Inbound",
          lat: stadium.lat - 0.0004,
          lng: stadium.lng + 0.0006,
          status: "reported",
          timestamp: simpleTimestamp
        }, { merge: true });
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
      const transportId = `shut_1_${stadium.id}`;
      await firestoreServices.transport.save(transportId, {
        id: transportId,
        stadiumId: stadium.id,
        route: "Express Metro Link",
        type: "shuttle",
        activeUnits: 3,
        waitTimeMinutes: 40,
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
      throw new Error(`Unknown simulation injection type: ${type}`);
  }

  return { notifObj, msg };
}
