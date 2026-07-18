const fs = require('fs');
let content = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');

content = content.replace(
  'stadiumName={selectedStadium.name}\n                />\n                {/* Incident Logging panel */}',
  'stadiumName={selectedStadium.name}\n                /></motion.div>\n                {/* Incident Logging panel */}'
);

fs.writeFileSync('src/pages/DashboardPage.tsx', content);
