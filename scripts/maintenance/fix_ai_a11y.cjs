const fs = require('fs');

let content = fs.readFileSync('src/components/AICommandCenter.tsx', 'utf8');

// Replace tab buttons
content = content.replace(
  /onClick=\{\(\) => setActiveTab\("assistant"\)\}\n            className=\{`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer \$\{/g,
  'aria-selected={activeTab === "assistant"}\n            role="tab"\n            onClick={() => setActiveTab("assistant")}\n            className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#6EB8E1] focus-visible:outline-none ${'
);
content = content.replace(
  /onClick=\{\(\) => setActiveTab\("advisor"\)\}\n            className=\{`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 \$\{/g,
  'aria-selected={activeTab === "advisor"}\n            role="tab"\n            onClick={() => setActiveTab("advisor")}\n            className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#C8ABE6] focus-visible:outline-none ${'
);

// Form buttons
content = content.replace(
  'className="bg-[#6EB8E1] text-black font-semibold rounded-xl px-3 hover:bg-sky-400 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center"',
  'aria-label="Send message"\n              className="bg-[#6EB8E1] text-black font-semibold rounded-xl px-3 hover:bg-sky-400 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-[#6EB8E1] focus-visible:outline-none"'
);

content = content.replace(
  'className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-900/30 disabled:opacity-50"',
  'aria-busy={isAdvisorLoading}\n                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-900/30 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-indigo-400 focus-visible:outline-none"'
);

// Main container role
content = content.replace(
  '<div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[500px]">',
  '<section aria-label="AI Command Center" className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[500px]">'
);

// Replace closing div
const lastIndex = content.lastIndexOf('</div>');
if (lastIndex !== -1) {
    content = content.substring(0, lastIndex) + '</section>' + content.substring(lastIndex + 6);
}

// Copy button
content = content.replace(
  'className="absolute top-2 right-2 p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"',
  'aria-label="Copy message text"\n                      className="absolute top-2 right-2 p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#6EB8E1] focus-visible:outline-none"'
);

fs.writeFileSync('src/components/AICommandCenter.tsx', content);
