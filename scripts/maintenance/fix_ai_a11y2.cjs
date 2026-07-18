const fs = require('fs');

let content = fs.readFileSync('src/components/AICommandCenter.tsx', 'utf8');

// The replacement of the closing tag was successful but the opening tag failed. Let's fix the opening tag.
content = content.replace(
  '<div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-[520px]">',
  '<section aria-label="AI Command Center" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-[520px]">'
);

fs.writeFileSync('src/components/AICommandCenter.tsx', content);
