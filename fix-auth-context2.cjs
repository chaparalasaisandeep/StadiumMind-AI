const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

code = code.replace(
  'await signInWithRedirect(auth, provider); return;',
  'if (role) sessionStorage.setItem("pendingGoogleRole", role);\n      await signInWithRedirect(auth, provider); return;'
);

code = code.replace(
  'let newRole = "Fan";',
  'let newRole = (sessionStorage.getItem("pendingGoogleRole") as UserRole) || "Fan";\n          sessionStorage.removeItem("pendingGoogleRole");'
);

fs.writeFileSync('src/contexts/AuthContext.tsx', code);
