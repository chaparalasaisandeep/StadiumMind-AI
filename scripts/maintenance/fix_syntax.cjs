const fs = require('fs');
let content = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');

content = content.replace(
  '<motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}><OperationalMetrics stadiumState={stadiumState} />',
  '<motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}><OperationalMetrics stadiumState={stadiumState} /></motion.div>'
);

content = content.replace(
  '<motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}><AIRecommendationsPanel stadiumState={stadiumState} stadiumId={selectedStadium.id} />',
  '<motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}><AIRecommendationsPanel stadiumState={stadiumState} stadiumId={selectedStadium.id} /></motion.div>'
);

// We should also check for AICommandCenter and EmergencyIncidentLogger closing tags
content = content.replace(
  '                /></motion.div>',
  '                />\n                </motion.div>'
);

fs.writeFileSync('src/pages/DashboardPage.tsx', content);
