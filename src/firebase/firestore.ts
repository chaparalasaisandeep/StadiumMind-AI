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
  QueryConstraint,
  enableIndexedDbPersistence,
  writeBatch,
  runTransaction,
  onSnapshot,
  getDocsFromCache,
  getDocFromCache,
  getDocsFromServer
} from "firebase/firestore";
import { firebaseApp } from "./config";
import { auth } from "./auth";
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
  SustainabilityMetric,
  OperationalLog
} from "../types";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function isPermissionError(error: any): boolean {
  if (!error) return false;
  const errMsg = String(error.message || error).toLowerCase();
  const code = String(error.code || "").toLowerCase();
  return code === "permission-denied" || errMsg.includes("permission") || errMsg.includes("insufficient");
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

let firestore: ReturnType<typeof getFirestore>;
try {
  if (firebaseApp) {
    firestore = getFirestore(firebaseApp);
    
    // Enable multi-tab offline caching persistence for browser environments safely.
    if (typeof window !== "undefined" && firestore) {
      enableIndexedDbPersistence(firestore).catch((err) => {
        if (err.code === "failed-precondition") {
          console.warn("[Firestore Cache] Multi-tab conflict: Offline persistence enabled in another active tab.");
        } else if (err.code === "unimplemented") {
          console.warn("[Firestore Cache] Offline persistence is unsupported by the current browser client.");
        } else {
          console.error("[Firestore Cache] Failed to configure local disk storage:", err);
        }
      });
    }
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
    if (isPermissionError(error)) {
      handleFirestoreError(error, OperationType.GET, `${collectionName}/${docId}`);
    } else {
      console.error(`Error fetching document from ${collectionName}/${docId}:`, error);
    }
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
    if (isPermissionError(error)) {
      handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${docId}`);
    } else {
      console.error(`Error saving document to ${collectionName}/${docId}:`, error);
      throw error;
    }
  }
}

export async function addDocData<T = DocumentData>(collectionName: string, data: T): Promise<string | null> {
  if (!firestore) return null;
  try {
    const colRef = collection(firestore, collectionName);
    const docRef = await addDoc(colRef, data as DocumentData);
    return docRef.id;
  } catch (error) {
    if (isPermissionError(error)) {
      handleFirestoreError(error, OperationType.WRITE, collectionName);
    } else {
      console.error(`Error adding document to collection ${collectionName}:`, error);
      throw error;
    }
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
    if (isPermissionError(error)) {
      handleFirestoreError(error, OperationType.LIST, collectionName);
    } else {
      console.error(`Error retrieving collection ${collectionName}:`, error);
    }
  }
  return [];
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
    if (isPermissionError(error)) {
      handleFirestoreError(error, OperationType.LIST, collectionName);
    } else {
      console.error(`Error querying collection ${collectionName}:`, error);
    }
  }
  return [];
}

export async function deleteDocData(collectionName: string, docId: string): Promise<void> {
  if (!firestore) return;
  try {
    const docRef = doc(firestore, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    if (isPermissionError(error)) {
      handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${docId}`);
    } else {
      console.error(`Error deleting document ${collectionName}/${docId}:`, error);
      throw error;
    }
  }
}

// Strongly typed service interfaces for specified collections

export async function executeBatch(operations: (batch: ReturnType<typeof writeBatch>, db: ReturnType<typeof getFirestore>) => void): Promise<void> {
  if (!firestore) return;
  const batch = writeBatch(firestore);
  operations(batch, firestore);
  await batch.commit();
}

export async function executeTransaction<T>(operation: (transaction: any, db: ReturnType<typeof getFirestore>) => Promise<T>): Promise<T | null> {
  if (!firestore) return null;
  return await runTransaction(firestore, (transaction) => operation(transaction, firestore));
}


export function subscribeCollectionDocs<T = DocumentData>(
  collectionName: string,
  onUpdate: (data: T[]) => void,
  onError?: (error: any) => void,
  ...queryConstraints: QueryConstraint[]
): () => void {
  if (!firestore) return () => {};
  const colRef = collection(firestore, collectionName);
  const q = query(colRef, ...queryConstraints);
  
  return onSnapshot(q, (snapshot) => {
    const items: T[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() } as T);
    });
    onUpdate(items);
  }, (error) => {
    console.error(`Error subscribing to ${collectionName}:`, error);
    if (onError) onError(error);
  });
}

export function subscribeDocData<T = DocumentData>(
  collectionName: string,
  docId: string,
  onUpdate: (data: T | null) => void,
  onError?: (error: any) => void
): () => void {
  if (!firestore) return () => {};
  const docRef = doc(firestore, collectionName, docId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate({ id: docSnap.id, ...docSnap.data() } as T);
    } else {
      onUpdate(null);
    }
  }, (error) => {
    console.error(`Error subscribing to ${collectionName}/${docId}:`, error);
    if (onError) onError(error);
  });
}

import { firestoreServices } from "../services/dbServices";
export { firestoreServices };


