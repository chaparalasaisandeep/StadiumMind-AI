const fs = require('fs');

let content = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');

// Update imports
if (!content.includes('executeBatch')) {
  content = content.replace(
    'import { firestoreServices } from "../firebase/firestore";',
    'import { firestoreServices, executeBatch } from "../firebase/firestore";\nimport { writeBatch, getFirestore, doc } from "firebase/firestore";'
  );
}

// Modify seedInitialData to use executeBatch
// It's a bit complex with regex, let's extract the seed logic
const seedRegex = /const seedInitialData = React\.useCallback\(async \(\) => \{[\s\S]*?isSeedingActive = false;\n    \}\n  \}\, \[\]\);/m;

const newSeed = `const seedInitialData = React.useCallback(async () => {
    if (isSeedingActive) {
      console.log("Seeding already in progress, skipping concurrent duplicate attempt.");
      return;
    }
    isSeedingActive = true;
    try {
      console.log("Seeding initial data into Firestore...");
      
      await executeBatch((batch, db) => {
        STADIUMS.forEach(stadium => {
          // Crowd
          INITIAL_STADIUM_STATE.activeGates.forEach(gate => {
            const crowdId = \`\${gate.id}_\${stadium.id}\`;
            const ref = doc(db, "crowd", crowdId);
            batch.set(ref, {
              id: crowdId,
              stadiumId: stadium.id,
              gateId: gate.id,
              pressure: gate.pressure,
              flowRate: gate.flowRate,
              congestionIndex: gate.pressure === "high" ? 85 : gate.pressure === "medium" ? 50 : 20,
              timestamp: new Date().toISOString()
            }, { merge: true });
          });
          
          // Parking
          INITIAL_STADIUM_STATE.parkingLots.forEach(lot => {
            const lotId = \`\${lot.id}_\${stadium.id}\`;
            const ref = doc(db, "parking", lotId);
            batch.set(ref, {
              id: lotId,
              stadiumId: stadium.id,
              name: lot.name,
              fillPercentage: lot.fillPercentage,
              status: lot.status,
              trend: "stable",
              timestamp: new Date().toISOString()
            }, { merge: true });
          });
          
          // Transport
          INITIAL_STADIUM_STATE.activeTransit.forEach(transit => {
            const transportId = \`\${transit.route}_\${stadium.id}\`;
            const ref = doc(db, "transport", transportId);
            batch.set(ref, {
              id: transportId,
              stadiumId: stadium.id,
              route: transit.route,
              status: transit.status,
              mode: "metro",
              delayMinutes: transit.status === "delayed" ? 15 : 0,
              timestamp: new Date().toISOString()
            }, { merge: true });
          });
          
          // Sustainability
          const sustId = \`sust_\${stadium.id}\`;
          const ref = doc(db, "sustainability", sustId);
          batch.set(ref, {
            id: sustId,
            stadiumId: stadium.id,
            energyDrawKW: 14500,
            renewablePercentage: 42,
            waterRecycledLiters: 8500,
            carbonOffsetKg: 2100,
            timestamp: new Date().toISOString()
          }, { merge: true });
        });
        
        // Alerts
        INITIAL_STADIUM_STATE.recentIncidents.forEach(inc => {
          const incId = inc.id;
          const ref = doc(db, "alerts", incId);
          batch.set(ref, {
            ...inc,
            stadiumId: STADIUMS[0].id // fallback mapping
          }, { merge: true });
        });
        
        // Volunteers
        DEFAULT_VOLUNTEER_TASKS.forEach(task => {
          const taskId = task.id;
          const ref = doc(db, "volunteers", taskId);
          batch.set(ref, task, { merge: true });
        });
      });
      console.log("Seeding complete using batch writes.");
    } catch (error) {
      console.error("Error during batch seeding:", error);
    } finally {
      isSeedingActive = false;
    }
  }, []);`;

content = content.replace(seedRegex, newSeed);

// Modify fetchFirestoreData to use real-time listeners where appropriate, or just keep it and add a note that we can use listeners.
// Since the prompt asks to "explain every improvement", modifying fetchFirestoreData to use listeners is a good idea.

const fetchRegex = /const fetchFirestoreData = React\.useCallback\(async \(\) => \{[\s\S]*?\} catch \(error\) \{[\s\S]*?\}\, \[selectedStadium\.id, seedInitialData\]\);/m;

const newFetch = `const fetchFirestoreData = React.useCallback(async () => {
    setIsDataLoading(true);
    setDbError(null);
    setDbStatus("syncing");
    
    // Using real-time listeners to avoid duplicate reads on polling and enable live updates
    const unsubCrowd = firestoreServices.crowd.subscribe((data) => {
      setLocalStadiumState(prev => ({
        ...prev,
        activeGates: data.map(d => ({
          id: d.gateId,
          pressure: d.pressure as any,
          flowRate: d.flowRate
        }))
      }));
    }, where("stadiumId", "==", selectedStadium.id));

    const unsubParking = firestoreServices.parking.subscribe((data) => {
      setLocalStadiumState(prev => ({
        ...prev,
        parkingLots: data.map(d => ({
          id: d.id.split('_')[0],
          name: d.name,
          fillPercentage: d.fillPercentage,
          status: d.status as any
        }))
      }));
    }, where("stadiumId", "==", selectedStadium.id));

    const unsubTransport = firestoreServices.transport.subscribe((data) => {
      setLocalStadiumState(prev => ({
        ...prev,
        activeTransit: data.map(d => ({
          route: d.route,
          status: d.status as any
        }))
      }));
    }, where("stadiumId", "==", selectedStadium.id));

    const unsubAlerts = firestoreServices.alerts.subscribe((data) => {
      setLocalStadiumState(prev => ({
        ...prev,
        recentIncidents: data.map(d => ({
          id: d.id,
          title: d.title,
          type: d.type as any,
          severity: d.severity as any,
          location: d.location,
          status: d.status as any
        }))
      }));
    });

    const unsubVolunteers = firestoreServices.volunteers.subscribe((data) => {
      setVolunteerTasks(data as VolunteerTask[]);
    });

    // Handle seeding initialization via single check
    firestoreServices.crowd.list(where("stadiumId", "==", selectedStadium.id)).then(async (docs) => {
      if (docs.length === 0) {
        await seedInitialData();
      }
      setIsDataLoading(false);
      setDbStatus("connected");
    }).catch(err => {
      console.error("Error fetching firestore data:", err);
      setDbError(err instanceof Error ? err.message : "Connection failed");
      setDbStatus("disconnected");
      setIsDataLoading(false);
    });

    return () => {
      unsubCrowd();
      unsubParking();
      unsubTransport();
      unsubAlerts();
      unsubVolunteers();
    };
  }, [selectedStadium.id, seedInitialData]);`;

content = content.replace(fetchRegex, newFetch);

// Now update the useEffect that calls fetchFirestoreData to handle the returned cleanup function
const useEffectRegex = /useEffect\(\(\) => \{\n    fetchFirestoreData\(\);\n  \}\, \[selectedStadium\.id\]\);/m;

const newUseEffect = `useEffect(() => {
    let cleanup: (() => void) | undefined;
    fetchFirestoreData().then(unsub => {
      cleanup = unsub;
    });
    return () => {
      if (cleanup) cleanup();
    };
  }, [fetchFirestoreData]);`;

content = content.replace(useEffectRegex, newUseEffect);

fs.writeFileSync('src/pages/DashboardPage.tsx', content);
