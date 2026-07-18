const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

if (!code.includes('signInWithRedirect')) {
  code = code.replace(
    '  signInWithPopup,',
    '  signInWithPopup,\n  signInWithRedirect,\n  getRedirectResult,'
  );
  fs.writeFileSync('src/contexts/AuthContext.tsx', code);
}
