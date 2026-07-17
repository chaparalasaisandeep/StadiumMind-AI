import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  getDocs, 
  query, 
  collection, 
  deleteDoc,
  DocumentData,
  QueryConstraint
} from "firebase/firestore";
import { firebaseApp } from "./config";
import { 
  UserProfile, 
  Stadium, 
  Match, 
  VolunteerTask, 
  AlertIncident, 
  TransitSchedule, 
  Announcement, 
  CrowdMetrics, 
  ParkingState, 
  SustainabilityMetric 
} from "../types";

let firestore: ReturnType<typeof getFirestore>;
try {
  if (firebaseApp) {
    firestore = getFirestore(firebaseApp);
  } else {
    // Failover
    firestore = null as any;
  }
} catch (error) {
  console.warn("Could not retrieve standard Firestore handle, using fallback storage:", error);
  firestore = null as any;
}

export { firestore };
export default firestore;

// Strongly typed generic helper functions for Firestore operations
export async function getDocData<T = DocumentData>(collectionName: string, docId: string): Promise<T | null> {
  if (!firestore) return null;
  try {
    const docRef = doc(firestore, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
  } catch (error) {
    console.error(`Error fetching document from ${collectionName}/${docId}:`, error);
  }
  return null;
}

export async function setDocData<T = DocumentData>(
  collectionName: string, 
  docId: string, 
  data: Partial<T>, 
  merge: boolean = true
): Promise<void> {
  if (!firestore) return;
  try {
    const docRef = doc(firestore, collectionName, docId);
    await setDoc(docRef, data, { merge });
  } catch (error) {
    console.error(`Error saving document to ${collectionName}/${docId}:`, error);
    throw error;
  }
}

export async function addDocData<T = DocumentData>(collectionName: string, data: T): Promise<string | null> {
  if (!firestore) return null;
  try {
    const colRef = collection(firestore, collectionName);
    const docRef = await addDoc(colRef, data as DocumentData);
    return docRef.id;
  } catch (error) {
    console.error(`Error adding document to collection ${collectionName}:`, error);
    throw error;
  }
}

export async function getCollectionDocs<T = DocumentData>(collectionName: string): Promise<T[]> {
  if (!firestore) return [];
  try {
    const colRef = collection(firestore, collectionName);
    const querySnapshot = await getDocs(colRef);
    const items: T[] = [];
    querySnapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() } as T);
    });
    return items;
  } catch (error) {
    console.error(`Error retrieving collection ${collectionName}:`, error);
    return [];
  }
}

export async function queryCollectionDocs<T = DocumentData>(
  collectionName: string, 
  ...queryConstraints: QueryConstraint[]
): Promise<T[]> {
  if (!firestore) return [];
  try {
    const colRef = collection(firestore, collectionName);
    const q = query(colRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);
    const items: T[] = [];
    querySnapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() } as T);
    });
    return items;
  } catch (error) {
    console.error(`Error querying collection ${collectionName}:`, error);
    return [];
  }
}

export async function deleteDocData(collectionName: string, docId: string): Promise<void> {
  if (!firestore) return;
  try {
    const docRef = doc(firestore, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document ${collectionName}/${docId}:`, error);
    throw error;
  }
}

// Strongly typed service interfaces for specified collections
export const firestoreServices = {
  users: {
    get: (uid: string) => getDocData<UserProfile>("users", uid),
    save: (uid: string, profile: Partial<UserProfile>) => setDocData<UserProfile>("users", uid, profile),
    delete: (uid: string) => deleteDocData("users", uid),
    list: () => getCollectionDocs<UserProfile>("users")
  },
  stadiums: {
    get: (stadiumId: string) => getDocData<Stadium>("stadiums", stadiumId),
    save: (stadiumId: string, stadium: Partial<Stadium>) => setDocData<Stadium>("stadiums", stadiumId, stadium),
    list: () => getCollectionDocs<Stadium>("stadiums")
  },
  matches: {
    get: (matchId: string) => getDocData<Match>("matches", matchId),
    save: (matchId: string, match: Partial<Match>) => setDocData<Match>("matches", matchId, match),
    list: () => getCollectionDocs<Match>("matches")
  },
  volunteers: {
    get: (taskId: string) => getDocData<VolunteerTask>("volunteers", taskId),
    save: (taskId: string, task: Partial<VolunteerTask>) => setDocData<VolunteerTask>("volunteers", taskId, task),
    add: (task: Omit<VolunteerTask, "id">) => addDocData<Omit<VolunteerTask, "id">>("volunteers", task),
    list: () => getCollectionDocs<VolunteerTask>("volunteers")
  },
  alerts: {
    get: (alertId: string) => getDocData<AlertIncident>("alerts", alertId),
    save: (alertId: string, alert: Partial<AlertIncident>) => setDocData<AlertIncident>("alerts", alertId, alert),
    add: (alert: Omit<AlertIncident, "id">) => addDocData<Omit<AlertIncident, "id">>("alerts", alert),
    list: () => getCollectionDocs<AlertIncident>("alerts")
  },
  transport: {
    get: (routeId: string) => getDocData<TransitSchedule>("transport", routeId),
    save: (routeId: string, route: Partial<TransitSchedule>) => setDocData<TransitSchedule>("transport", routeId, route),
    list: () => getCollectionDocs<TransitSchedule>("transport")
  },
  announcements: {
    get: (announcementId: string) => getDocData<Announcement>("announcements", announcementId),
    save: (announcementId: string, announcement: Partial<Announcement>) => setDocData<Announcement>("announcements", announcementId, announcement),
    add: (announcement: Omit<Announcement, "id">) => addDocData<Omit<Announcement, "id">>("announcements", announcement),
    list: () => getCollectionDocs<Announcement>("announcements")
  },
  crowd: {
    get: (metricId: string) => getDocData<CrowdMetrics>("crowd", metricId),
    save: (metricId: string, metric: Partial<CrowdMetrics>) => setDocData<CrowdMetrics>("crowd", metricId, metric),
    list: () => getCollectionDocs<CrowdMetrics>("crowd")
  },
  parking: {
    get: (lotId: string) => getDocData<ParkingState>("parking", lotId),
    save: (lotId: string, lot: Partial<ParkingState>) => setDocData<ParkingState>("parking", lotId, lot),
    list: () => getCollectionDocs<ParkingState>("parking")
  },
  sustainability: {
    get: (metricId: string) => getDocData<SustainabilityMetric>("sustainability", metricId),
    save: (metricId: string, metric: Partial<SustainabilityMetric>) => setDocData<SustainabilityMetric>("sustainability", metricId, metric),
    list: () => getCollectionDocs<SustainabilityMetric>("sustainability")
  }
};

