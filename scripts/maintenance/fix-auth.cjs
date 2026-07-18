const fs = require('fs');

// Fix App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(
  'setRoute("landing");',
  'setRoute((prev) => prev === "auth" ? "auth" : "landing");'
);
fs.writeFileSync('src/App.tsx', appCode);

