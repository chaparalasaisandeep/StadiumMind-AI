const fs = require('fs');
let content = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');
content = content.replace(
  '    fetchFirestoreData().then(unsub => {\n      cleanup = unsub;\n    });',
  '    fetchFirestoreData().catch(console.error);'
);
fs.writeFileSync('src/pages/DashboardPage.tsx', content);
