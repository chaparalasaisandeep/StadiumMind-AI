const fs = require('fs');

let content = fs.readFileSync('src/components/NotificationCenter.tsx', 'utf8');

content = content.replace(
  '{filteredNotifications.length > 0 ? (',
  '<AnimatePresence mode="popLayout">\n            {filteredNotifications.length > 0 ? ('
);

fs.writeFileSync('src/components/NotificationCenter.tsx', content);
