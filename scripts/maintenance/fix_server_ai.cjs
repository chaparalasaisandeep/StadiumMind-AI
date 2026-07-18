const fs = require('fs');
let code = fs.readFileSync('server-ai.ts', 'utf8');

// Replace ensureServerAuthenticated block
const startEnsure = code.indexOf('export async function ensureServerAuthenticated() {');
const endEnsure = code.indexOf('interface LiveContextData {');
if (startEnsure !== -1 && endEnsure !== -1) {
  const newEnsure = `export async function ensureServerAuthenticated() {
  if (isAuthInit) return;
  try {
    if (getApps().length === 0) {
      initializeApp({
        credential: applicationDefault()
      });
    }
    console.log("[Server Auth] Successfully initialized Firebase Admin SDK via applicationDefault.");
    isAuthInit = true;
  } catch (error) {
    console.error("[Server Auth] Failed to initialize Firebase Admin SDK:", error);
  }
}

async function getAdminDocs(collectionName: string) {
  try {
    const db = getFirestore();
    const snapshot = await db.collection(collectionName).get();
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.warn(\`[Firestore Admin] Failed to fetch \${collectionName}\`, e);
    return [];
  }
}

`;
  code = code.substring(0, startEnsure) + newEnsure + code.substring(endEnsure);
}

// Replace Promise.all block
const pAllStr = `    const [stadiums, matches, parking, transport, incidents, crowd, volunteers] = await Promise.all([
      firestoreServices.stadiums.list().catch(() => []),
      firestoreServices.matches.list().catch(() => []),
      firestoreServices.parking.list().catch(() => []),
      firestoreServices.transport.list().catch(() => []),
      firestoreServices.alerts.list().catch(() => []),
      firestoreServices.crowd.list().catch(() => []),
      firestoreServices.volunteers.list().catch(() => [])
    ]);`;

const newPAllStr = `    const [stadiums, matches, parking, transport, incidents, crowd, volunteers] = await Promise.all([
      getAdminDocs("stadiums"),
      getAdminDocs("matches"),
      getAdminDocs("parking"),
      getAdminDocs("transport"),
      getAdminDocs("alerts"),
      getAdminDocs("crowd"),
      getAdminDocs("volunteers")
    ]);`;
code = code.replace(pAllStr, newPAllStr);

// Let's also check if there's any imports from firebase-admin, and add them if not.
if (!code.includes("firebase-admin")) {
  code = 'import { initializeApp, applicationDefault, getApps } from "firebase-admin/app";\nimport { getFirestore } from "firebase-admin/firestore";\n' + code;
}

fs.writeFileSync('server-ai.ts', code);
