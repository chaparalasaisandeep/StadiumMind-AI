import { getFirestore, collection, addDoc } from "firebase/firestore";
import { firebaseApp } from "../firebase/config";

// Initialize and export the Firestore db instance
export const db = getFirestore(firebaseApp);

/**
 * Utility function to write a sample operational data document 
 * to the 'stadium_operations' collection to verify the connection.
 */
export async function writeSampleOperationalData() {
  try {
    const docRef = await addDoc(collection(db, "stadium_operations"), {
      type: "security_alert",
      title: "Sample Security Alert",
      description: "Test alert to verify Firestore connection and operational logging.",
      severity: "low",
      location: "Gate B",
      timestamp: new Date().toISOString(),
      status: "open",
    });
    console.log("Successfully wrote sample operational data with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error writing sample operational data: ", error);
    throw error;
  }
}

/**
 * Utility function to allow authorized admin users to post new
 * security alerts or medical reports to the 'stadium_operations' collection.
 */
export async function postOperationalAlert(
  type: "security_alert" | "medical_report",
  title: string,
  description: string,
  severity: "low" | "medium" | "high" | "critical",
  location: string,
  reporterId: string
) {
  try {
    const docRef = await addDoc(collection(db, "stadium_operations"), {
      type,
      title,
      description,
      severity,
      location,
      reporterId,
      timestamp: new Date().toISOString(),
      status: "open",
    });
    console.log(`Successfully posted ${type} with ID: `, docRef.id);
    return docRef.id;
  } catch (error) {
    console.error(`Error posting ${type}: `, error);
    throw error;
  }
}

