const fs = require('fs');

let code = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');

code = code.replace(/firestoreServices\.alerts\.subscribe\(\(docs\) => {[^}]+}\);/, `firestoreServices.alerts.subscribe((docs) => {
      localAlerts = docs;
      if (isInitialized) updateState();
    }, limit(100));`);

code = code.replace(/firestoreServices\.volunteers\.subscribe\(\(docs\) => {[^}]+}\);/, `firestoreServices.volunteers.subscribe((docs) => {
      localVolunteers = docs;
      if (isInitialized) updateState();
    }, limit(100));`);

fs.writeFileSync('src/pages/DashboardPage.tsx', code);
