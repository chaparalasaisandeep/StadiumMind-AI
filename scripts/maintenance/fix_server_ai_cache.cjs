const fs = require('fs');

let content = fs.readFileSync('server-ai.ts', 'utf8');

// Replace DEFAULT_MODEL
content = content.replace(/const DEFAULT_MODEL = "gemini-3.5-flash";/g, 'const DEFAULT_MODEL = "gemini-2.5-flash";');

// Add Cache variables
const cacheVars = `
let liveContextCache: { data: LiveContextData; timestamp: number } | null = null;
const CONTEXT_CACHE_TTL = 30000; // 30 seconds

export async function fetchFirestoreContext(stadiumId?: string): Promise<LiveContextData> {
  await ensureServerAuthenticated();
`;
content = content.replace('export async function fetchFirestoreContext(stadiumId?: string): Promise<LiveContextData> {\n  await ensureServerAuthenticated();', cacheVars);

// Replace fetchFirestoreContext
const fetchLogic = `
  if (liveContextCache && Date.now() - liveContextCache.timestamp < CONTEXT_CACHE_TTL) {
    console.log("[Server AI] Serving live context from cache.");
    return filterContextForStadium(liveContextCache.data, stadiumId);
  }

  const result: LiveContextData = {};
  try {
    const [stadiums, matches, parking, transport, incidents, crowd, volunteers] = await Promise.all([
      firestoreServices.stadiums.list().catch(() => []),
      firestoreServices.matches.list().catch(() => []),
      firestoreServices.parking.list().catch(() => []),
      firestoreServices.transport.list().catch(() => []),
      firestoreServices.alerts.list().catch(() => []),
      firestoreServices.crowd.list().catch(() => []),
      firestoreServices.volunteers.list().catch(() => [])
    ]);
    
    result.stadium = stadiums;
    result.match = matches;
    result.parking = parking;
    result.transport = transport;
    result.incidents = incidents;
    result.crowd = crowd;
    result.volunteers = volunteers;
    
    liveContextCache = { data: result, timestamp: Date.now() };
  } catch (error) {
    console.warn("[Firestore Context Retrieval] Reverted to safe local fallbacks:", error);
  }
  return filterContextForStadium(result, stadiumId);
}

function filterContextForStadium(raw: LiveContextData, stadiumId?: string): LiveContextData {
  const result: LiveContextData = {};
  
  let targetStadium = null;
  const stadiums = raw.stadium || [];
  if (stadiumId) {
    targetStadium = stadiums.find(
      (s: any) => s.id === stadiumId || s.name?.toLowerCase().includes(stadiumId.toLowerCase())
    );
  }
  if (!targetStadium && stadiums.length > 0) {
    targetStadium = stadiums[0];
  }
  result.stadium = targetStadium;
  
  const currentStadiumId = targetStadium?.id;
  const matches = raw.match || [];
  if (currentStadiumId) {
    result.match = matches.find((m: any) => m.stadiumId === currentStadiumId && m.status === "live")
      || matches.find((m: any) => m.stadiumId === currentStadiumId && m.status === "scheduled")
      || matches.find((m: any) => m.stadiumId === currentStadiumId)
      || matches[0];
  } else {
    result.match = matches[0];
  }

  result.parking = currentStadiumId 
    ? (raw.parking || []).filter((p: any) => p.stadiumId === currentStadiumId)
    : (raw.parking || []);
  result.transport = currentStadiumId 
    ? (raw.transport || []).filter((t: any) => t.stadiumId === currentStadiumId)
    : (raw.transport || []);
  result.incidents = currentStadiumId 
    ? (raw.incidents || []).filter((i: any) => i.stadiumId === currentStadiumId || !i.stadiumId)
    : (raw.incidents || []);
  result.crowd = currentStadiumId 
    ? (raw.crowd || []).filter((c: any) => c.stadiumId === currentStadiumId)
    : (raw.crowd || []);
  result.volunteers = raw.volunteers || [];
  
  return result;
}
`;

const regex = /  const result: LiveContextData = \{\};\n  try \{\n    const \[stadiums, matches, parking, transport, incidents, crowd, volunteers\] = await Promise\.all\(\[\n[\s\S]*?    result\.volunteers = volunteers \|\| \[\];\n  \} catch \(error\) \{\n    console\.warn\("\[Firestore Context Retrieval\] Reverted to safe local fallbacks:", error\);\n  \}\n  return result;\n\}/;

content = content.replace(regex, fetchLogic.trim());

fs.writeFileSync('server-ai.ts', content);
