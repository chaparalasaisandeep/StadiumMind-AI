// It looks like I mapped parking properties slightly wrong, let's fix the seedInitialData batch write mapping in DashboardPage.tsx
const fs = require('fs');
let content = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');

content = content.replace(/lotName: lot\.name,\n              occupancyPercentage: lot\.fillPercentage,\n              status: lot\.status,\n              accessibilitySpotsFree: 0/g, 'name: lot.name,\n              fillPercentage: lot.fillPercentage,\n              status: lot.status');

fs.writeFileSync('src/pages/DashboardPage.tsx', content);
