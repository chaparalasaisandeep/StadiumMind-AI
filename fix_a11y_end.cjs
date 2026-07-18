const fs = require('fs');

let content = fs.readFileSync('src/components/AccessibilitySuite.tsx', 'utf8');

const lastIndex = content.lastIndexOf('</div>');
if (lastIndex !== -1) {
    content = content.substring(0, lastIndex) + '</section>' + content.substring(lastIndex + 6);
    fs.writeFileSync('src/components/AccessibilitySuite.tsx', content);
}

