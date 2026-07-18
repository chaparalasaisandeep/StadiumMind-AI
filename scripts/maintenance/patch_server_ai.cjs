const fs = require('fs');
let code = fs.readFileSync('server-ai.ts', 'utf8');

// Replace imports
code = code.replace(/import \{ firestoreServices \} from ".\/src\/firebase\/firestore";/g, 'import { initializeApp, applicationDefault, getApps } from "firebase-admin/app";\nimport { getFirestore } from "firebase-admin/firestore";');
code = code.replace(/import \{ signInWithEmailAndPassword, createUserWithEmailAndPassword \} from "firebase\/auth";\n/g, '');
code = code.replace(/import \{ auth \} from ".\/src\/firebase\/auth";\n/g, '');
code = code.replace(/import \{ doc, setDoc \} from "firebase\/firestore";\n/g, '');
code = code.replace(/import \{ firestore \} from ".\/src\/firebase\/firestore";\n/g, '');

// Replace ensureServerAuthenticated
const oldAuth = `let isAuthInit = false;
export async function ensureServerAuthenticated() {
  if (isAuthInit) return;
  if (!auth) {
    console.warn("[Server Auth] Firebase Auth is not configured/available. Operating in offline/fallback mode.");
    return;
  }
  const email = "system-server@fifa.org";
  const password = "SystemServerPassword123!";
  try {
    // Try to sign in
    await signInWithEmailAndPassword(auth, email, password);
    console.log("[Server Auth] Successfully authenticated system server session.");
    isAuthInit = true;
  } catch (error: any) {
    // If user does not exist, create user
    const errStr = String(error?.code || error?.message || error).toLowerCase();
    if (errStr.includes("not-found") || errStr.includes("invalid-credential") || errStr.includes("user-not-found")) {
      console.log("[Server Auth] System server user not found. Registering system server account...");
      try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        
        // Also create the profile document in Firestore
        if (firestore) {
          const userDocRef = doc(firestore, "users", userCred.user.uid);
          await setDoc(userDocRef, {
            uid: userCred.user.uid,
            email: email,
            displayName: "System Server Agent",
            role: "Admin",
            assignedSector: "System Operations",
            createdAt: new Date().toISOString()
          });
        }
        console.log("[Server Auth] Successfully registered and authenticated system server session.");
        isAuthInit = true;
      } catch (regError) {
        console.error("[Server Auth] Failed to register system server session:", regError);
      }
    } else {
      console.error("[Server Auth] Failed to authenticate system server session:", error);
    }
  }
}`;

const newAuth = `let isAuthInit = false;
export async function ensureServerAuthenticated() {
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
}`;

code = code.replace(oldAuth, newAuth);

// Replace firestoreServices.[col].list()
code = code.replace(/firestoreServices\.stadiums\.list\(\)\.catch\(\(\) => \[\]\)/g, 'getAdminDocs("stadiums")');
code = code.replace(/firestoreServices\.matches\.list\(\)\.catch\(\(\) => \[\]\)/g, 'getAdminDocs("matches")');
code = code.replace(/firestoreServices\.parking\.list\(\)\.catch\(\(\) => \[\]\)/g, 'getAdminDocs("parking")');
code = code.replace(/firestoreServices\.transport\.list\(\)\.catch\(\(\) => \[\]\)/g, 'getAdminDocs("transport")');
code = code.replace(/firestoreServices\.alerts\.list\(\)\.catch\(\(\) => \[\]\)/g, 'getAdminDocs("alerts")');
code = code.replace(/firestoreServices\.crowd\.list\(\)\.catch\(\(\) => \[\]\)/g, 'getAdminDocs("crowd")');
code = code.replace(/firestoreServices\.volunteers\.list\(\)\.catch\(\(\) => \[\]\)/g, 'getAdminDocs("volunteers")');

fs.writeFileSync('server-ai.ts', code);
console.log("Patched server-ai.ts");
