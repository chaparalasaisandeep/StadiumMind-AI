import { doc } from "firebase/firestore";
import { firestoreServices, executeBatch } from "../firebase/firestore";
import { AlertIncident, VolunteerTask, StadiumLocation } from "../types";

export async function createIncidentInDb(
  incidentId: string, 
  freshIncident: AlertIncident
): Promise<void> {
  await firestoreServices.alerts.save(incidentId, freshIncident);
}

export async function dispatchIncidentInDb(
  incidentId: string, 
  updatedIncident: AlertIncident, 
  newTaskId: string, 
  newTask: VolunteerTask
): Promise<void> {
  await executeBatch((batch, db) => {
    batch.set(doc(db, "alerts", incidentId), updatedIncident, { merge: true });
    batch.set(doc(db, "volunteers", newTaskId), newTask, { merge: true });
  });
}

export async function resolveIncidentInDb(
  incidentId: string, 
  updatedIncident: AlertIncident
): Promise<void> {
  await firestoreServices.alerts.save(incidentId, updatedIncident);
}

export async function applySimulationParamsInDb(
  crowdId: string, 
  stadiumId: string, 
  pressure: "low" | "medium" | "high", 
  flowRate: number, 
  congestionIndex: number
): Promise<void> {
  await firestoreServices.crowd.save(crowdId, {
    id: crowdId,
    stadiumId,
    gateId: "gate_a",
    pressure,
    flowRate,
    congestionIndex,
    timestamp: new Date().toISOString()
  });
}
