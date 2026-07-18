import { initializeApp, getApps, getApp } from "firebase/app";

// Support both Vite's import.meta.env and Node/bundled process.env for maximum compatibility.
const meta = (typeof import.meta !== "undefined" ? import.meta : {}) as any;
const proc = (typeof process !== "undefined" ? process : { env: {} }) as any;

const firebaseConfig = {
  apiKey: meta.env?.VITE_FIREBASE_API_KEY || proc.env?.VITE_FIREBASE_API_KEY || "",
  authDomain: meta.env?.VITE_FIREBASE_AUTH_DOMAIN || proc.env?.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: meta.env?.VITE_FIREBASE_PROJECT_ID || proc.env?.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: meta.env?.VITE_FIREBASE_STORAGE_BUCKET || proc.env?.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || proc.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: meta.env?.VITE_FIREBASE_APP_ID || proc.env?.VITE_FIREBASE_APP_ID || ""
};

// Check if Firebase is already initialized
let firebaseApp;
try {
  firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.error("Firebase initialization failed. Mocking setup parameters for safety:", error);
}

export { firebaseApp };

