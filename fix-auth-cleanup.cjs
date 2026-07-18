const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

// Fix imports
code = code.replace(
  '  signInWithPopup,\n  GoogleAuthProvider,',
  '  signInWithPopup,\n  signInWithRedirect,\n  getRedirectResult,\n  GoogleAuthProvider,'
);

// Delete unreachable code
code = code.replace(
  /      await signInWithRedirect\(auth, provider\); return;[\s\S]*?await setDoc\(userDocRef, profileData, \{ merge: true \}\);\n      \}/,
  '      await signInWithRedirect(auth, provider);\n      // Code handles redirect result on reload'
);

fs.writeFileSync('src/contexts/AuthContext.tsx', code);
