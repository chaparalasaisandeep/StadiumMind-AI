const fs = require('fs');

let content = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');

// 1. Add AnimatePresence to Dashboard imports
if (!content.includes('motion')) {
  content = content.replace(
    'import { Skeleton, SkeletonCard } from "../components/ui/Skeleton";',
    'import { Skeleton, SkeletonCard } from "../components/ui/Skeleton";\nimport { motion, AnimatePresence } from "motion/react";'
  );
}

// 2. Add focus-visible and aria attributes to Select and Buttons in header
content = content.replace(
  'className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer border-b border-slate-800"',
  'aria-label="Select Stadium" className="bg-transparent text-xs font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer border-b border-slate-800 rounded-sm"'
);

content = content.replace(
  'className="w-full bg-slate-900/60 border border-slate-850 rounded-xl pl-8 pr-3 py-1 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-sky-500"',
  'aria-label="Search sectors" className="w-full bg-slate-900/60 border border-slate-850 rounded-xl pl-8 pr-3 py-1 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-colors"'
);

content = content.replace(
  /className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"/g,
  'className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"'
);

// 3. Improve Db Error Banner
const oldDbError = `{dbStatus === "fallback" && (
                  <div className="px-3 py-1 bg-rose-950/20 border border-rose-500/20 rounded-xl flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                    <span className="text-[9px] font-mono text-rose-400" title={dbError || ""}>OFFLINE FALLBACK</span>
                  </div>
                )}`;

const newDbError = `{dbStatus === "fallback" && (
                  <div className="group relative px-3 py-1 bg-rose-950/20 border border-rose-500/20 rounded-xl flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                    <span className="text-[9px] font-mono text-rose-400 cursor-help">OFFLINE FALLBACK</span>
                    {/* Tooltip on hover */}
                    <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 text-slate-200 text-[10px] p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      {dbError || "Lost connection to live datastore."}
                    </div>
                  </div>
                )}`;
content = content.replace(oldDbError, newDbError);

// Wrap main content pieces in motion.div for staggered entrance
content = content.replace(
  /<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">/g,
  '<motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">'
);

// We need to close motion.div correctly. It's tricky to do with regex if we don't know the exact end. Let's just wrap individual panels.

content = content.replace(
  /<OperationalMetrics/g,
  '<motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}><OperationalMetrics'
);
content = content.replace(
  /onUpdateStatus=\{handleUpdateParkingStatus\}\n                \/>/g,
  'onUpdateStatus={handleUpdateParkingStatus}\n                /></motion.div>'
);

content = content.replace(
  /<EmergencyIncidentLogger/g,
  '<motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}><EmergencyIncidentLogger'
);
content = content.replace(
  /onResolveIncident=\{handleResolveIncident\}\n                \/>/g,
  'onResolveIncident={handleResolveIncident}\n                /></motion.div>'
);

content = content.replace(
  /<AICommandCenter/g,
  '<motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="lg:col-span-2"><AICommandCenter'
);
content = content.replace(
  /currentRole=\{currentRole\}\n                \/>/g,
  'currentRole={currentRole}\n                /></motion.div>'
);

content = content.replace(
  /<AIRecommendationsPanel/g,
  '<motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}><AIRecommendationsPanel'
);
content = content.replace(
  /stadiumState=\{stadiumState\}\n                \/>/g,
  'stadiumState={stadiumState}\n                /></motion.div>'
);

content = content.replace(
  /<Suspense fallback=\{<SkeletonCard height="300px" \/>\}>/g,
  '<motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}><Suspense fallback={<SkeletonCard height="300px" />}>'
);
content = content.replace(
  /stadiumName=\{selectedStadium.name\}\n                \/>\n              <\/Suspense>/g,
  'stadiumName={selectedStadium.name}\n                />\n              </Suspense></motion.div>'
);

fs.writeFileSync('src/pages/DashboardPage.tsx', content);
