const fs = require('fs');

let content = fs.readFileSync('server-ai.ts', 'utf8');

const targetStr = `export async function fetchFirestoreContext(stadiumId?: string): Promise<LiveContextData> {
  await ensureServerAuthenticated();
  const result: LiveContextData = {};
  try {`;

const newStr = `export async function fetchFirestoreContext(stadiumId?: string): Promise<LiveContextData> {
  await ensureServerAuthenticated();

  const now = Date.now();
  if (liveContextCache && (now - liveContextCache.timestamp) < CONTEXT_CACHE_TTL) {
    console.log("[Cache] Serving Firestore context from memory");
    if (stadiumId && liveContextCache.data.stadium?.id !== stadiumId) {
       // cache mismatch for stadium, bypass
    } else {
       return liveContextCache.data;
    }
  }

  const result: LiveContextData = {};
  try {`;

content = content.replace(targetStr, newStr);

const setCacheStr = `    if (currentStadiumId) {
      result.match = matches.find((m: any) => m.stadiumId === currentStadiumId && m.status === "scheduled");
      result.parking = parking.filter((p: any) => p.stadiumId === currentStadiumId);
      result.transport = transport.filter((t: any) => t.stadiumId === currentStadiumId);
      result.incidents = incidents.filter((i: any) => i.stadiumId === currentStadiumId && i.status === "active");
      result.crowd = crowd.filter((c: any) => c.stadiumId === currentStadiumId);
    }
    
    result.volunteers = volunteers.filter((v: any) => v.status === "active");`;

const newSetCacheStr = `    if (currentStadiumId) {
      result.match = matches.find((m: any) => m.stadiumId === currentStadiumId && m.status === "scheduled");
      result.parking = parking.filter((p: any) => p.stadiumId === currentStadiumId);
      result.transport = transport.filter((t: any) => t.stadiumId === currentStadiumId);
      result.incidents = incidents.filter((i: any) => i.stadiumId === currentStadiumId && i.status === "active");
      result.crowd = crowd.filter((c: any) => c.stadiumId === currentStadiumId);
    }
    
    result.volunteers = volunteers.filter((v: any) => v.status === "active");

    liveContextCache = { data: result, timestamp: now };`;

content = content.replace(setCacheStr, newSetCacheStr);

fs.writeFileSync('server-ai.ts', content);
