const fs = require('fs');

let content = fs.readFileSync('src/components/NotificationCenter.tsx', 'utf8');

// Add motion import
content = content.replace(
  'import { \n  Bell,\n  X,',
  'import { motion, AnimatePresence } from "motion/react";\nimport { \n  Bell,\n  X,'
);

// Modify the list rendering
content = content.replace(
  '{filteredNotifications.length > 0 ? (\\n              filteredNotifications.map\\(\\(notif\\) => {',
  '<AnimatePresence mode="popLayout">\n            {filteredNotifications.length > 0 ? (\n              filteredNotifications.map((notif) => {'
);
content = content.replace(
  /return \(\n                  <div\n                    key=\{notif\.id\}/,
  'return (\n                  <motion.div\n                    layout\n                    initial={{ opacity: 0, y: -10, scale: 0.95 }}\n                    animate={{ opacity: 1, y: 0, scale: 1 }}\n                    exit={{ opacity: 0, scale: 0.95 }}\n                    transition={{ duration: 0.2 }}\n                    key={notif.id}'
);
content = content.replace(
  '                  </div>\n                );\n              })\n            ) : (',
  '                  </motion.div>\n                );\n              })\n            ) : ('
);
content = content.replace(
  /<\/div>\n            \)}\n          <\/div>/,
  '</div>\n            )}</AnimatePresence>\n          </div>'
);

// Add ARIA labels and roles
content = content.replace(
  '<div id="stadium-notification-center" className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl transition-all duration-300 overflow-hidden">',
  '<section aria-label="Notification Center" id="stadium-notification-center" className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl transition-all duration-300 overflow-hidden">'
);
content = content.replace(
  /<\/div>\n  \);\n\}\);/,
  '</section>\n  );\n});'
);

content = content.replace(
  /className="px-2.5 py-1 text-\[10px\] font-semibold bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:text-indigo-400 text-slate-300 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-400"/g,
  'aria-label="Mark all read" className="px-2.5 py-1 text-[10px] font-semibold bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:text-indigo-400 text-slate-300 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-400"'
);

// Add focus-visible states
content = content.replace(
  /hover:bg-slate-850/g,
  'hover:bg-slate-850 focus-visible:ring-1 focus-visible:ring-indigo-400 focus-visible:outline-none'
);
content = content.replace(
  /className="p-1 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors text-xs cursor-pointer"/g,
  'aria-expanded={isOpen} className="p-1 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors text-xs cursor-pointer focus-visible:ring-1 focus-visible:ring-indigo-400 focus-visible:outline-none"'
);

fs.writeFileSync('src/components/NotificationCenter.tsx', content);
