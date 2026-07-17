import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL as getFbDownloadURL, 
  deleteObject 
} from "firebase/storage";
import { firebaseApp } from "./config";

let storage: ReturnType<typeof getStorage>;
try {
  if (firebaseApp) {
    storage = getStorage(firebaseApp);
  } else {
    storage = null as any;
  }
} catch (error) {
  console.warn("Could not retrieve standard Firebase Storage handle, using fallback media:", error);
  storage = null as any;
}

export { storage };
export default storage;

/**
 * Uploads a file to Firebase Storage and returns its download URL.
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  if (!storage) {
    console.warn("Firebase Storage is not initialized. Simulating local file upload.");
    return URL.createObjectURL(file);
  }
  try {
    const fileRef = ref(storage, path);
    const snapshot = await uploadBytes(fileRef, file);
    const downloadUrl = await getFbDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.error(`Firebase Storage upload failure for path ${path}:`, error);
    throw error;
  }
}

/**
 * Retrieves the public download URL of an object in Firebase Storage.
 */
export async function getDownloadURL(path: string): Promise<string> {
  if (!storage) {
    console.warn("Firebase Storage is not initialized. Returning path placeholder.");
    return `https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600`;
  }
  try {
    const fileRef = ref(storage, path);
    const downloadUrl = await getFbDownloadURL(fileRef);
    return downloadUrl;
  } catch (error) {
    console.error(`Firebase Storage download URL lookup failure for path ${path}:`, error);
    throw error;
  }
}

/**
 * Deletes an object from Firebase Storage.
 */
export async function deleteFile(path: string): Promise<void> {
  if (!storage) {
    console.warn("Firebase Storage is not initialized. Bypass deletion.");
    return;
  }
  try {
    const fileRef = ref(storage, path);
    await deleteObject(fileRef);
  } catch (error) {
    console.error(`Firebase Storage deletion failure for path ${path}:`, error);
    throw error;
  }
}

