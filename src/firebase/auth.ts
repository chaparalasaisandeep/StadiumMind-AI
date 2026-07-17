import { getAuth, connectAuthEmulator } from "firebase/auth";
import { firebaseApp } from "./config";

let auth;
try {
  if (firebaseApp) {
    auth = getAuth(firebaseApp);
    // Config emulator if in local testing
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      // connectAuthEmulator(auth, "http://localhost:9099");
    }
  }
} catch (error) {
  console.warn("Could not retrieve standard Firebase Auth handle, using fallback context:", error);
}

export { auth };
export default auth;
