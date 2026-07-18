const fs = require('fs');

let content = fs.readFileSync('server-ai.ts', 'utf8');

const targetRegex = /export async function fetchFirestoreContext\(stadiumId\?: string\): Promise<LiveContextData> \{\n\s*await ensureServerAuthenticated\(\);\n\s*const result: LiveContextData = \{\};\n\s*try \{/;

const newStr = `export async function fetchFirestoreContext(stadiumId?: string): Promise<LiveContextData> {
  await ensureServerAuthenticated();

  const now = Date.now();
  if (liveContextCache && (now - liveContextCache.timestamp) < CONTEXT_CACHE_TTL) {
    if (!stadiumId || (stadiumId && liveContextCache.data.stadium?.id === stadiumId)) {
       return liveContextCache.data;
    }
  }

  const result: LiveContextData = {};
  try {`;

content = content.replace(targetRegex, newStr);

// Look for the end of the filtering section where it sets volunteers
const setCacheRegex = /result\.volunteers = volunteers\.filter\(\(v: any\) => v\.status === "active"\);\n\s*\} catch \(error\) \{/;
const newSetCacheStr = `result.volunteers = volunteers.filter((v: any) => v.status === "active");
    liveContextCache = { data: result, timestamp: now };
  } catch (error) {`;

content = content.replace(setCacheRegex, newSetCacheStr);

fs.writeFileSync('server-ai.ts', content);
