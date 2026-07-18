const fs = require('fs');
let content = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');

// The main element error was caused by wrapping the grid in motion.div but not closing it, or missing a closing tag.
content = content.replace(
  '<motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">',
  '<motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">'
); // Wait, this doesn't fix it if we don't close it. 

// The problem is we replaced `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">` with `<motion.div ...>` but we didn't replace `</div>` with `</motion.div>`.
// So let's revert that specific one.
content = content.replace(
  '<motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">',
  '<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">'
);

// We need to close AICommandCenter's motion.div
content = content.replace(
  /stadiumName=\{selectedStadium\.name\}\n                \/>\n                \{\/\* Incident Logging panel \*\/\}/g,
  'stadiumName={selectedStadium.name}\n                /></motion.div>\n                {/* Incident Logging panel */}'
);

fs.writeFileSync('src/pages/DashboardPage.tsx', content);
