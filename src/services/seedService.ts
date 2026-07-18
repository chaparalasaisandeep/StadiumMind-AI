import { doc } from "firebase/firestore";
import { executeBatch } from "../firebase/firestore";
import { STADIUMS, INITIAL_STADIUM_STATE, DEFAULT_VOLUNTEER_TASKS } from "../constants";

let isSeedingActive = false;

/**
 * Seeds default tournament datasets (stadiums, parking, shuttles, sustainability indexes, incident alerts, and volunteer tasks)
 * into Cloud Firestore in a single unified transactional batch if the collections are empty.
 */
export async function seedInitialFirestoreData(): Promise<void> {
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
}
