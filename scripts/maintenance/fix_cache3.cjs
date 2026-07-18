const fs = require('fs');

let content = fs.readFileSync('server-ai.ts', 'utf8');

const setCacheRegex = /result\.volunteers = volunteers \|\| \[\];\n\s*\} catch \(error\) \{/;
const newSetCacheStr = `result.volunteers = volunteers || [];
    liveContextCache = { data: result, timestamp: now };
  } catch (error) {`;

content = content.replace(setCacheRegex, newSetCacheStr);

fs.writeFileSync('server-ai.ts', content);
