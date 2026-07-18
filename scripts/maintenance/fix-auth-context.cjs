const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

code = code.replace(
  'import { signInWithPopup, GoogleAuthProvider,',
  'import { signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider,'
);

// We need to add getRedirectResult logic to the useEffect in AuthContext.tsx
const redirectLogic = `
    // Handle redirect result for Google Login
    if (auth) {
      getRedirectResult(auth).then(async (credential) => {
        if (credential && firestore) {
          const userDocRef = doc(firestore, "users", credential.user.uid);
          const userDoc = await getDoc(userDocRef);
          
          let newRole = "Fan";
          if (userDoc.exists()) {
             newRole = userDoc.data().role as UserRole;
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
        }
      }).catch(err => {
        console.error("Redirect auth error:", err);
      });
    }

    setPersistence(auth, browserLocalPersistence)`;

code = code.replace('    setPersistence(auth, browserLocalPersistence)', redirectLogic);

// Replace signInWithPopup with signInWithRedirect
code = code.replace('const credential = await signInWithPopup(auth, provider);', 'await signInWithRedirect(auth, provider); return;');
// Wait, if it returns, the code after it won't run, which is fine because the redirect handles it.
// Wait, actually, let's keep signInWithPopup, but catch the COOP error and fallback to signInWithRedirect!

fs.writeFileSync('src/contexts/AuthContext.tsx', code);
