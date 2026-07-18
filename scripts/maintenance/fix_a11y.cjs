const fs = require('fs');

let content = fs.readFileSync('src/components/AccessibilitySuite.tsx', 'utf8');

content = content.replace(
  '<div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">',
  '<section aria-labelledby="accessibility-hub-title" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">'
);
content = content.replace(
  '<h3 className="text-sm font-semibold text-white flex items-center gap-1.5">',
  '<h3 id="accessibility-hub-title" className="text-sm font-semibold text-white flex items-center gap-1.5">'
);

content = content.replace(
  /aria-live="polite"/g, '' // Clean up if any
);

content = content.replace(
  '<div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">',
  '<div className="space-y-2 max-h-[140px] overflow-y-auto pr-1" aria-live="polite" aria-atomic="true">'
);

content = content.replace(
  '<button\n              id="tts-read-btn"',
  '<button\n              id="tts-read-btn"\n              aria-pressed={isPlayingAudio}\n              aria-label={isPlayingAudio ? "Stop Audio Accessibility Report" : "Play Audio Accessibility Report"}'
);

content = content.replace(
  /className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer \$\{/g,
  'className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none ${'
);

content = content.replace(
  '<button\n                  type="submit"',
  '<button\n                  type="submit"\n                  aria-label="Confirm Escort Request"'
);

content = content.replace(
  'className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-1.5 rounded-lg text-xs cursor-pointer transition-colors"',
  'className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-1.5 rounded-lg text-xs cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-indigo-400 focus-visible:outline-none"'
);

content = content.replace(
  'className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white"',
  'className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"'
);
content = content.replace(
  'className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white"',
  'className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"'
);

fs.writeFileSync('src/components/AccessibilitySuite.tsx', content);
