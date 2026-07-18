const fs = require('fs');

let content = fs.readFileSync('src/components/RoleSelector.tsx', 'utf8');

// Replace main container role
content = content.replace(
  '<div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">',
  '<section aria-label="Role Environment Selector" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">'
);

content = content.replace(
  '<div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">',
  '<div role="tablist" aria-label="Available System Roles" className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">'
);

content = content.replace(
  /className=\{`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-300 group cursor-pointer \$\{/g,
  'role="tab"\n              aria-selected={isActive}\n              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-300 group cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none ${'
);

const lastIndex = content.lastIndexOf('</div>');
if (lastIndex !== -1) {
    content = content.substring(0, lastIndex) + '</section>' + content.substring(lastIndex + 6);
}

fs.writeFileSync('src/components/RoleSelector.tsx', content);
