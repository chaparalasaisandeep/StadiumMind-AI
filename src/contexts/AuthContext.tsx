import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { UserRole, UserProfile } from "../types";
import { auth } from "../firebase/auth";
import { firestore } from "../firebase/firestore";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password?: string, role?: UserRole) => Promise<void>;
  signup: (email: string, name: string, password?: string, role?: UserRole) => Promise<void>;
  loginWithGoogle: (role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Monitor auth state changes with Firebase
  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    if (!auth) {
      // Fallback if Firebase auth is not configured / initialized
      setLoading(false);
      return;
    }

    // Explicitly configure LOCAL persistence to ensure sessions are preserved
    setPersistence(auth, browserLocalPersistence)
      .catch((err) => {
        console.error("Error setting Firebase Auth persistence:", err);
      })
      .finally(() => {
        if (!active) return;
        
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (!active) return;
          
          if (firebaseUser) {
            setLoading(true);
            try {
              // Fetch user profile role from Firestore
              let role: UserRole = "Fan";
              let displayName = firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User";
              let assignedSector = "Sector General";

              const pendingRole = localStorage.getItem("pending_role") as UserRole | null;

              if (pendingRole) {
                role = pendingRole;
                localStorage.removeItem("pending_role");
                if (firestore) {
                  const userDocRef = doc(firestore, "users", firebaseUser.uid);
                  await setDoc(userDocRef, {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || "",
                    displayName,
                    role,
                    assignedSector: role === "Volunteer" ? "Volunteer Desk 3" : role === "Security" ? "Sector West-Gate 4" : "Sector General",
                    createdAt: new Date().toISOString()
                  }, { merge: true });
                }
              } else if (firestore) {
                const userDocRef = doc(firestore, "users", firebaseUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                  const data = userDoc.data();
                  if (data.role) role = data.role as UserRole;
                  if (data.displayName) displayName = data.displayName;
                  if (data.assignedSector) assignedSector = data.assignedSector;
                } else {
                  // Create user document if it doesn't exist yet
                  const newProfile: UserProfile = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || "",
                    displayName,
                    role,
                    assignedSector,
                    createdAt: new Date().toISOString()
                  };
                  await setDoc(userDocRef, newProfile);
                }
              }

              const profile: UserProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                displayName,
                role,
                assignedSector,
                createdAt: firebaseUser.metadata.creationTime || new Date().toISOString()
              };

              setUser(profile);
            } catch (err) {
              console.error("Error synchronizing user profile from Firestore:", err);
              // Safe baseline profile fallback
              const baselineProfile: UserProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                displayName: firebaseUser.displayName || "Authorized User",
                role: "Fan",
                createdAt: new Date().toISOString()
              };
              setUser(baselineProfile);
            }
          } else {
            setUser(null);
          }
          setLoading(false);
        });
      });

    return () => {
      active = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const login = useCallback(async (email: string, password?: string, role?: UserRole) => {
    setLoading(true);
    try {
      if (role) {
        localStorage.setItem("pending_role", role);
      }
      if (!auth) {
        // Fallback for offline/unprovisioned flow
        const dummyProfile: UserProfile = {
          uid: `local-uid-${Date.now()}`,
          email,
          displayName: email.split("@")[0].toUpperCase(),
          role: role || "Fan",
          assignedSector: "Sector North-Alpha",
          createdAt: new Date().toISOString()
        };
        setUser(dummyProfile);
        localStorage.removeItem("pending_role");
        setLoading(false);
        return;
      }

      if (!password) {
        throw new Error("Password field is required for standard terminal login.");
      }

      const credential = await signInWithEmailAndPassword(auth, email, password);
      
      // Force update selected role in Firestore if supplied
      if (firestore && role) {
        const userDocRef = doc(firestore, "users", credential.user.uid);
        await setDoc(userDocRef, {
          uid: credential.user.uid,
          email: credential.user.email,
          displayName: credential.user.displayName || email.split("@")[0],
          role,
          assignedSector: role === "Volunteer" ? "Volunteer Desk 3" : role === "Security" ? "Sector West-Gate 4" : "Sector General",
          createdAt: new Date().toISOString()
        }, { merge: true });
        localStorage.removeItem("pending_role");
      }
    } catch (error: any) {
      setLoading(false);
      let friendlyMessage = "Failed to sign in. Please check your credentials.";
      if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
        friendlyMessage = "Incorrect email address or security passcode.";
      } else if (error.code === "auth/user-not-found") {
        friendlyMessage = "No terminal clearance found for this email address.";
      } else if (error.code === "auth/invalid-email") {
        friendlyMessage = "The entered email address layout is invalid.";
      } else if (error.message) {
        friendlyMessage = error.message;
      }
      throw new Error(friendlyMessage);
    }
  }, []);

  const signup = useCallback(async (email: string, name: string, password?: string, role?: UserRole) => {
    setLoading(true);
    try {
      if (!auth) {
        // Fallback for offline/unprovisioned flow
        const dummyProfile: UserProfile = {
          uid: `local-uid-${Date.now()}`,
          email,
          displayName: name,
          role: role || "Fan",
          assignedSector: "Sector South-VIP",
          createdAt: new Date().toISOString()
        };
        setUser(dummyProfile);
        setLoading(false);
        return;
      }

      if (!password) {
        throw new Error("A passcode is required to generate system authorization keys.");
      }

      const credential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Set user role inside Firestore immediately upon signup
      if (firestore) {
        const userDocRef = doc(firestore, "users", credential.user.uid);
        const newProfile: UserProfile = {
          uid: credential.user.uid,
          email,
          displayName: name,
          role: role || "Fan",
          assignedSector: role === "Volunteer" ? "Volunteer Desk 3" : role === "Security" ? "Sector West-Gate 4" : "Sector General",
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, newProfile);
      }
    } catch (error: any) {
      setLoading(false);
      let friendlyMessage = "Terminal authorization failed.";
      if (error.code === "auth/email-already-in-use") {
        friendlyMessage = "This email is already linked with active terminal clearance.";
      } else if (error.code === "auth/weak-password") {
        friendlyMessage = "The password is too weak. Must be at least 6 characters.";
      } else if (error.message) {
        friendlyMessage = error.message;
      }
      throw new Error(friendlyMessage);
    }
  }, []);

  const loginWithGoogle = useCallback(async (role?: UserRole) => {
    setLoading(true);
    try {
      if (role) {
        localStorage.setItem("pending_role", role);
      }
      if (!auth) {
        throw new Error("Google Authentication requires live active cloud provisioning.");
      }
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);

      if (firestore) {
        const userDocRef = doc(firestore, "users", credential.user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          const newProfile: UserProfile = {
            uid: credential.user.uid,
            email: credential.user.email || "",
            displayName: credential.user.displayName || credential.user.email?.split("@")[0] || "User",
            role: role || "Fan",
            assignedSector: "Sector General",
            createdAt: new Date().toISOString()
          };
          await setDoc(userDocRef, newProfile);
        }
      }
    } catch (error: any) {
      setLoading(false);
      throw new Error(error.message || "Google single sign-on failed.");
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      if (auth) {
        await fbSignOut(auth);
      }
    } catch (err) {
      console.error("Firebase logout warning", err);
    }
    setUser(null);
    setLoading(false);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!auth) {
      throw new Error("Offline reset: Safe bypass activated.");
    }
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(error.message || "Failed to transmit recovery credentials.");
    }
  }, []);

  const switchRole = useCallback(async (newRole: UserRole) => {
    if (user) {
      const updated = { ...user, role: newRole };
      setUser(updated);

      // Persist the updated role in Firestore
      if (auth && firestore && auth.currentUser) {
        try {
          const userDocRef = doc(firestore, "users", auth.currentUser.uid);
          await setDoc(userDocRef, { role: newRole }, { merge: true });
        } catch (err: any) {
          if (err?.code === "permission-denied" || err?.message?.includes("permission")) {
            console.warn("Role update prevented by Firestore Security Rules (this is expected for non-admin users).");
          } else {
            console.error("Could not sync updated role in firestore database:", err);
          }
        }
      }
    }
  }, [user]);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout,
    resetPassword,
    switchRole
  }), [user, loading, login, signup, loginWithGoogle, logout, resetPassword, switchRole]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}

