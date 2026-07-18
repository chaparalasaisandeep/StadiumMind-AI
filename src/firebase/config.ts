import { initializeApp, getApps, getApp } from "firebase/app";

// Support both Vite's import.meta.env and Node/bundled process.env for maximum compatibility.
const meta = (typeof import.meta !== "undefined" ? import.meta : {}) as any;
const proc = (typeof process !== "undefined" ? process : { env: {} }) as any;

const firebaseConfig = {
  apiKey: meta.env?.VITE_FIREBASE_API_KEY || proc.env?.VITE_FIREBASE_API_KEY || "AIzaSyAzS43eGvwJqZkAIH9eH2uYeCvk0GAkOwA",
  authDomain: meta.env?.VITE_FIREBASE_AUTH_DOMAIN || proc.env?.VITE_FIREBASE_AUTH_DOMAIN || "stadiummind-ai-2c542.firebaseapp.com",
  projectId: meta.env?.VITE_FIREBASE_PROJECT_ID || proc.env?.VITE_FIREBASE_PROJECT_ID || "stadiummind-ai-2c542",
  storageBucket: meta.env?.VITE_FIREBASE_STORAGE_BUCKET || proc.env?.VITE_FIREBASE_STORAGE_BUCKET || "stadiummind-ai-2c542.firebasestorage.app",
  messagingSenderId: meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || proc.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "99155882761",
  appId: meta.env?.VITE_FIREBASE_APP_ID || proc.env?.VITE_FIREBASE_APP_ID || "1:99155882761:web:df8eb458b5d0d1c2bf19d8",
  measurementId: meta.env?.VITE_FIREBASE_MEASUREMENT_ID || proc.env?.VITE_FIREBASE_MEASUREMENT_ID || "G-NLFQ4PMFDH"
};

// Check if Firebase is already initialized
let firebaseApp;
try {
  firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.error("Firebase initialization failed. Mocking setup parameters for safety:", error);
}

export { firebaseApp };

