const fs = require('fs');

let content = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');

// Remove await fetchFirestoreData(); calls
content = content.replace(/await fetchFirestoreData\(\);/g, '');

fs.writeFileSync('src/pages/DashboardPage.tsx', content);
