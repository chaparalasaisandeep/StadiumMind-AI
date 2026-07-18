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
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
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
    let unsubscribeAuth: (() => void) | undefined;
    let unsubscribeProfile: (() => void) | undefined;

    if (!auth) {
      setLoading(false);
      return;
    }

    setPersistence(auth, browserLocalPersistence)
      .catch((err) => console.error("Error setting Firebase Auth persistence:", err))
      .finally(() => {
        if (!active) return;
        
        unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
          if (!active) return;
          
          if (firebaseUser) {
            if (firestore) {
              const userDocRef = doc(firestore, "users", firebaseUser.uid);
              
              // Clean up any previous profile listener before setting a new one
              if (unsubscribeProfile) unsubscribeProfile();
              
              // Realtime profile synchronization to eliminate stale state
              unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
                if (docSnap.exists()) {
                  setUser(docSnap.data() as UserProfile);
                } else {
                  // Document does not exist (could be during initial signup before write finishes).
                  // Provide a safe fallback without causing duplicate writes.
                  setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || "",
                    displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
                    role: "Fan",
                    assignedSector: "Sector General",
                    createdAt: firebaseUser.metadata.creationTime || new Date().toISOString()
                  });
                }
                setLoading(false);
              }, (error) => {
                console.error("Firestore profile sync error:", error);
                // Fallback to local user if Firestore is unavailable
                setUser({
                  uid: firebaseUser.uid,
                  email: firebaseUser.email || "",
                  displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
                  role: "Fan",
                  assignedSector: "Sector General",
                  createdAt: firebaseUser.metadata.creationTime || new Date().toISOString()
                });
                setLoading(false);
              });
            } else {
              // Offline fallback
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                displayName: firebaseUser.displayName || "Authorized User",
                role: "Fan",
                assignedSector: "Sector General",
                createdAt: new Date().toISOString()
              });
              setLoading(false);
            }
          } else {
            setUser(null);
            setLoading(false);
            if (unsubscribeProfile) {
              unsubscribeProfile();
              unsubscribeProfile = undefined;
            }
          }
        });
      });

    return () => {
      active = false;
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const login = useCallback(async (email: string, password?: string, role?: UserRole) => {
    setLoading(true);
    try {
      if (!auth) {
        // Fallback for offline/unprovisioned flow
        setUser({
          uid: `local-uid-${Date.now()}`,
          email,
          displayName: email.split("@")[0].toUpperCase(),
          role: role || "Fan",
          assignedSector: "Sector North-Alpha",
          createdAt: new Date().toISOString()
        });
        setLoading(false);
        return;
      }

      if (!password) {
        throw new Error("Password field is required for standard terminal login.");
      }

      const credential = await signInWithEmailAndPassword(auth, email, password);
      
      if (firestore) {
        const userDocRef = doc(firestore, "users", credential.user.uid);
        const userSnap = await getDoc(userDocRef);
        
        let newRole = role;
        if (!newRole) {
           newRole = userSnap.exists() ? (userSnap.data().role as UserRole) : "Fan";
        }

        const profileData: UserProfile = {
           uid: credential.user.uid,
           email: credential.user.email || email,
           displayName: credential.user.displayName || email.split("@")[0],
           role: newRole,
           assignedSector: newRole === "Volunteer" ? "Volunteer Desk 3" : newRole === "Security" ? "Sector West-Gate 4" : "Sector General",
           createdAt: userSnap.exists() ? userSnap.data().createdAt : new Date().toISOString()
        };
        await setDoc(userDocRef, profileData, { merge: true });
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
        setUser({
          uid: `local-uid-${Date.now()}`,
          email,
          displayName: name,
          role: role || "Fan",
          assignedSector: "Sector South-VIP",
          createdAt: new Date().toISOString()
        });
        setLoading(false);
        return;
      }

      if (!password) {
        throw new Error("A passcode is required to generate system authorization keys.");
      }

      const credential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (firestore) {
        const userDocRef = doc(firestore, "users", credential.user.uid);
        const newRole = role || "Fan";
        const newProfile: UserProfile = {
          uid: credential.user.uid,
          email,
          displayName: name,
          role: newRole,
          assignedSector: newRole === "Volunteer" ? "Volunteer Desk 3" : newRole === "Security" ? "Sector West-Gate 4" : "Sector General",
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
      if (!auth) {
        throw new Error("Google Authentication requires live active cloud provisioning.");
      }
      
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      
      if (firestore) {
        try {
          const userDocRef = doc(firestore, "users", credential.user.uid);
          const userDoc = await getDoc(userDocRef);
          
          let newRole = role;
          if (!newRole) {
             newRole = userDoc.exists() ? (userDoc.data().role as UserRole) : "Fan";
          }
          
          const profileData: UserProfile = {
              uid: credential.user.uid,
              email: credential.user.email || "",
              displayName: credential.user.displayName || credential.user.email?.split("@")[0] || "User",
              role: newRole,
              assignedSector: newRole === "Volunteer" ? "Volunteer Desk 3" : newRole === "Security" ? "Sector West-Gate 4" : "Sector General",
              createdAt: userDoc.exists() ? userDoc.data().createdAt : new Date().toISOString()
          };
          await setDoc(userDocRef, profileData, { merge: true });
        } catch (dbError) {
          console.warn("Firestore unavailable during Google login:", dbError);
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
    // Note: onAuthStateChanged will naturally handle setUser(null) and setLoading(false)
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
    if (auth && firestore && auth.currentUser) {
      try {
        const userDocRef = doc(firestore, "users", auth.currentUser.uid);
        await setDoc(userDocRef, { 
            role: newRole,
            assignedSector: newRole === "Volunteer" ? "Volunteer Desk 3" : newRole === "Security" ? "Sector West-Gate 4" : "Sector General",
        }, { merge: true });
        // State updates automatically via onSnapshot
      } catch (err: any) {
        if (err?.code === "permission-denied" || err?.message?.includes("permission")) {
          console.warn("Role update prevented by Firestore Security Rules (this is expected for non-admin users).");
        } else {
          console.error("Could not sync updated role in firestore database:", err);
        }
      }
    }
  }, []);

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
