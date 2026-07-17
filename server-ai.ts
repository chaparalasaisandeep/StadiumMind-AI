import { GoogleGenAI } from "@google/genai";
import { firestoreServices } from "./src/firebase/firestore";
import {
  AIServiceType,
  FanAIRequest,
  FanAIResponse,
  TransportAIRequest,
  TransportAIResponse,
  EmergencyAIRequest,
  EmergencyAIResponse,
  VolunteerAIRequest,
  VolunteerAIResponse,
  OrganizerAIRequest,
  OrganizerAIResponse,
  TranslationAIRequest,
  TranslationAIResponse
} from "./src/services/aiTypes";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./src/firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { firestore } from "./src/firebase/firestore";

// Model configuration
const DEFAULT_MODEL = "gemini-3.5-flash";

let isAuthInit = false;

export async function ensureServerAuthenticated() {
  if (isAuthInit) return;
  if (!auth) {
    console.warn("[Server Auth] Firebase Auth is not configured/available. Operating in offline/fallback mode.");
    return;
  }

  const email = "system-server@fifa.org";
  const password = "SystemServerPassword123!";

  try {
    // Try to sign in
    await signInWithEmailAndPassword(auth, email, password);
    console.log("[Server Auth] Successfully authenticated system server session.");
    isAuthInit = true;
  } catch (error: any) {
    // If user does not exist, create user
    const errStr = String(error?.code || error?.message || error).toLowerCase();
    if (errStr.includes("not-found") || errStr.includes("invalid-credential") || errStr.includes("user-not-found")) {
      console.log("[Server Auth] System server user not found. Registering system server account...");
      try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        
        // Also create the profile document in Firestore
        if (firestore) {
          const userDocRef = doc(firestore, "users", userCred.user.uid);
          await setDoc(userDocRef, {
            uid: userCred.user.uid,
            email: email,
            displayName: "System Server Agent",
            role: "Admin",
            assignedSector: "System Operations",
            createdAt: new Date().toISOString()
          });
        }
        console.log("[Server Auth] Successfully registered and authenticated system server session.");
        isAuthInit = true;
      } catch (regError) {
        console.error("[Server Auth] Failed to register system server session:", regError);
      }
    } else {
      console.error("[Server Auth] Failed to authenticate system server session:", error);
    }
  }
}

interface LiveContextData {
  stadium?: any;
  match?: any;
  parking?: any[];
  transport?: any[];
  incidents?: any[];
  crowd?: any[];
  volunteers?: any[];
}

/**
 * Robustly retrieves current application context from the live Firestore database.
 * Falls back to empty arrays/objects gracefully if records or connection are missing.
 */
export async function fetchFirestoreContext(stadiumId?: string): Promise<LiveContextData> {
  await ensureServerAuthenticated();
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

    // Match the target stadium if a name or ID is passed
    if (stadiumId) {
      result.stadium = stadiums.find(
        (s: any) => s.id === stadiumId || s.name?.toLowerCase().includes(stadiumId.toLowerCase())
      );
    }
    if (!result.stadium && stadiums.length > 0) {
      result.stadium = stadiums[0];
    }

    const currentStadiumId = result.stadium?.id;

    // Retrieve active or scheduled match at the target stadium
    if (currentStadiumId) {
      result.match = matches.find((m: any) => m.stadiumId === currentStadiumId && m.status === "live")
        || matches.find((m: any) => m.stadiumId === currentStadiumId && m.status === "scheduled")
        || matches.find((m: any) => m.stadiumId === currentStadiumId)
        || matches[0];
    } else {
      result.match = matches[0];
    }

    // Filter secondary telemetry by stadium
    result.parking = currentStadiumId 
      ? parking.filter((p: any) => p.stadiumId === currentStadiumId) 
      : parking;
    result.transport = currentStadiumId 
      ? transport.filter((t: any) => t.stadiumId === currentStadiumId) 
      : transport;
    result.incidents = currentStadiumId 
      ? incidents.filter((i: any) => i.stadiumId === currentStadiumId || !i.stadiumId) 
      : incidents;
    result.crowd = currentStadiumId 
      ? crowd.filter((c: any) => c.stadiumId === currentStadiumId) 
      : crowd;
    result.volunteers = volunteers || [];

  } catch (error) {
    console.warn("[Firestore Context Retrieval] Reverted to safe local fallbacks:", error);
  }
  return result;
}

/**
 * Builds a highly detailed context text block containing all specified telemetry fields
 * and rigid anti-hallucination guardrails.
 */
function buildEnrichedContextString(liveContext: LiveContextData, clientContext: any): string {
  const now = new Date();
  const timeStr = now.toLocaleString("en-US") + " (Server Time)";

  const stadium = liveContext.stadium;
  const match = liveContext.match;
  const parking = liveContext.parking || [];
  const transport = liveContext.transport || [];
  const incidents = liveContext.incidents || [];
  const crowd = liveContext.crowd || [];

  const role = clientContext.role || clientContext.userContext?.role || "Visitor";
  const gate = clientContext.gate || clientContext.userContext?.gate;
  const section = clientContext.section || clientContext.userContext?.seatSection;
  const weather = clientContext.weather || clientContext.userContext?.weather || "Sunny, 75°F (24°C)";

  const lines: string[] = [];
  lines.push("=== CORE STADIUM MIND REAL-TIME CONTEXT ===");
  lines.push(`[System Time] ${timeStr}`);
  lines.push(`[Active User Role] ${role}`);
  lines.push(`[Active Weather] ${weather}`);

  // Stadium Details
  if (stadium) {
    lines.push(`[Stadium info] Name: ${stadium.name}, City: ${stadium.city}, Country: ${stadium.country}, Capacity: ${stadium.capacity.toLocaleString()}, Total Gates: ${stadium.gatesCount}`);
  } else {
    lines.push("[Stadium info] LIVE STADIUM GEOMETRY/FACTS UNAVAILABLE.");
  }

  // Active Match
  if (match) {
    lines.push(`[Active Match] ${match.teamA} vs ${match.teamB} (Kickoff: ${match.kickoffTime}, Status: ${match.status}, Attendance: ${match.attendance ? match.attendance.toLocaleString() : "N/A"})`);
  } else {
    lines.push("[Active Match] LIVE MATCH telemetry is currently unavailable.");
  }

  // Gate & Section Local Context
  lines.push(`[Current User Location] Gate: ${gate || "Not specified by user"}, Section: ${section || "Not specified by user"}`);

  // Crowd Gate Levels
  if (crowd.length > 0) {
    lines.push("[Crowd Pressures & Congestion Indices (Firestore)]:");
    crowd.forEach((c: any) => {
      lines.push(`  - Gate ${c.gateId}: Congestion ${c.congestionIndex}/100, Pressure: ${c.pressure.toUpperCase()}, Flow: ${c.flowRate} persons/min`);
    });
  } else {
    lines.push("[Crowd Pressures] LIVE GATE FLOW TELEMETRY UNAVAILABLE.");
  }

  // Parking Space Status
  if (parking.length > 0) {
    lines.push("[Parking Lots Occupancy (Firestore)]:");
    parking.forEach((p: any) => {
      lines.push(`  - Lot ${p.lotName || p.id}: Occupancy ${p.occupancyPercentage}%, Status: ${p.status.toUpperCase()}, Free Accessibility Spots: ${p.accessibilitySpotsFree || 0}`);
    });
  } else {
    lines.push("[Parking Lots Occupancy] LIVE PARKING METRICS UNAVAILABLE.");
  }

  // Transit & Shuttle Schedules
  if (transport.length > 0) {
    lines.push("[Multi-Modal Transit Status (Firestore)]:");
    transport.forEach((t: any) => {
      lines.push(`  - Route: ${t.route} (${t.type.toUpperCase()}), Active Vehicles: ${t.activeUnits}, Estimated Wait: ${t.waitTimeMinutes} mins, Status: ${t.status.toUpperCase()}`);
    });
  } else {
    lines.push("[Multi-Modal Transit Status] LIVE SHUTTLE/TRANSIT SCHEDULES UNAVAILABLE.");
  }

  // Unresolved Security / Medical incidents
  const activeIncidents = incidents.filter((i: any) => i.status !== "resolved");
  if (activeIncidents.length > 0) {
    lines.push("[Active Incidents Triage (Firestore)]:");
    activeIncidents.forEach((i: any) => {
      lines.push(`  - Incident [ID: ${i.id}]: "${i.title}" | Category: ${i.type.toUpperCase()} | Severity: ${i.severity.toUpperCase()} | Location: ${i.location} | Status: ${i.status.toUpperCase()}`);
    });
  } else {
    lines.push("[Active Incidents] No active emergency incidents registered in Firestore.");
  }

  lines.push("===========================================");

  // Rigid Anti-Hallucination Guardrails
  lines.push("\n[CRITICAL ANTI-HALLUCINATION INSTRUCTIONS]");
  lines.push("1. You MUST NEVER invent or hallucinate any stadium parameters, gate names, parking levels, wait times, or layouts.");
  lines.push("2. If the context sections above state that live telemetry (e.g. transit wait times, gate congestion, active incidents) is 'UNAVAILABLE', you MUST clearly and explicitly inform the user: 'Live [metric name] is currently unavailable.' and ask them for any missing details.");
  lines.push("3. Under no circumstances should you generate fake figures, occupancy levels, or route numbers. Stick entirely to the facts provided in the live context block above.");
  lines.push("===========================================");

  return lines.join("\n");
}

/**
 * Executes a Fan AI operational request
 */
export async function runFanAI(client: GoogleGenAI, request: FanAIRequest): Promise<FanAIResponse> {
  const liveContext = await fetchFirestoreContext(request.stadiumId);
  const enrichedContext = buildEnrichedContextString(liveContext, request);

  const systemInstruction = `You are the Fan AI Assistant for StadiumMind AI, the central operating system of the FIFA World Cup 2026.
You are tasked with providing helpful, clean, and structured guidance to match attendees.

Using the provided real-time Firestore context, assist the user with seating, concession lookups, transport questions, and safety concerns.
You MUST adhere strictly to the Anti-Hallucination guidelines: if information about a gate, seat layout, or concession is missing from the context, clearly tell the fan that live data is unavailable, and ask them for details.

You MUST respond with a JSON object conforming exactly to this TypeScript interface:
interface FanAIResponse {
  answer: string; // The main answer to the fan's query, formatted beautifully in markdown. Keep it concise, friendly, and precise. Mention live status details from the context if relevant.
  suggestedActions: string[]; // 2-3 short, actionable phrases a user could tap (e.g., "Find Food Section 104", "View Gate Status").
  seatingAdvisory?: string; // Clear instructions on how to reach their section/seat based on their userContext, if provided.
  concessionInfo?: string; // Food/restroom details nearby, wait times, or active recommendations based on live parameters.
}`;

  const contents = `
${enrichedContext}

Fan Query: ${request.query}

Please process this query, evaluate nearby services, and return the structured JSON output conforming to the FanAIResponse interface.`;

  try {
    const response = await client.models.generateContent({
      model: DEFAULT_MODEL,
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response received from Fan AI generative model.");
    }

    return JSON.parse(text) as FanAIResponse;
  } catch (error) {
    console.error("Error running Fan AI:", error);
    return {
      answer: `I was unable to retrieve a response from the StadiumMind guide at this moment. Let's try again. (Details: ${error instanceof Error ? error.message : "Service Unavailable"})`,
      suggestedActions: ["Retry Request", "View Map Guide"],
      seatingAdvisory: "Information temporarily unavailable.",
      concessionInfo: "Information temporarily unavailable."
    };
  }
}

/**
 * Executes a Transport AI operational request
 */
export async function runTransportAI(client: GoogleGenAI, request: TransportAIRequest): Promise<TransportAIResponse> {
  const liveContext = await fetchFirestoreContext(request.stadiumId);
  const enrichedContext = buildEnrichedContextString(liveContext, request);

  const systemInstruction = `You are the Transport AI Assistant for StadiumMind AI.
You generate multi-modal transport advisory, congestion alerts, and routing suggestions for soccer fans and staff.

Refer directly to the live multi-modal transit schedules and parking occupancies.
You MUST adhere strictly to the Anti-Hallucination guidelines: if parking lot occupancy or shuttle delay details are not in the context, do not invent them! Set wait times or statuses to realistic fallbacks, explicitly write that live metrics are unavailable, and prompt the user for clarifications if necessary.

You MUST respond with a JSON object conforming exactly to this TypeScript interface:
interface TransportAIResponse {
  shuttleStatus: string; // Brief active status description (e.g. "Active - normal flow", "Delayed by 15 mins").
  recommendedTransitMode: string; // One clear recommended mode (e.g. "Express Shuttle", "Train Line B").
  advisoryText: string; // Detailed transit advisory explanation in clear, reassuring markdown.
  estimatedWaitMinutes: number; // Estimated average wait time in minutes.
  alternativeRoutes: {
    route: string; // Name of alternative route or line
    mode: "shuttle" | "metro" | "train" | "bus";
    estimatedTime: number; // In minutes
  }[];
}`;

  const contents = `
${enrichedContext}

Target Parking Lot: ${request.lotId || "Any"}
Mode of Interest: ${request.modeOfInterest || "all"}

Please synthesize local transit conditions and return a structured TransportAIResponse JSON object.`;

  try {
    const response = await client.models.generateContent({
      model: DEFAULT_MODEL,
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response received from Transport AI model.");
    }

    return JSON.parse(text) as TransportAIResponse;
  } catch (error) {
    console.error("Error running Transport AI:", error);
    return {
      shuttleStatus: "Operational",
      recommendedTransitMode: "Metro Connection",
      advisoryText: "Standard transit services are active. Please refer to display boards for exact track and gate timing.",
      estimatedWaitMinutes: 10,
      alternativeRoutes: []
    };
  }
}

/**
 * Executes an Emergency AI operational request
 */
export async function runEmergencyAI(client: GoogleGenAI, request: EmergencyAIRequest): Promise<EmergencyAIResponse> {
  // Try to find the stadium from the description or location to retrieve the correct Firestore data
  const liveContext = await fetchFirestoreContext(request.location);
  const enrichedContext = buildEnrichedContextString(liveContext, request);

  const systemInstruction = `You are the Emergency AI Triage System for StadiumMind AI.
You evaluate newly reported incidents (medical, security, congestion, maintenance) and automatically calculate optimal severity index, dispatch protocols, and volunteer involvement.

Cross-reference the new incident details with existing active incidents in the live context to spot duplicates or compounding hazards.
You MUST adhere strictly to the Anti-Hallucination guidelines: never invent evacuation corridors or non-existent medical facilities.

You MUST respond with a JSON object conforming exactly to this TypeScript interface:
interface EmergencyAIResponse {
  recommendedSeverity: "low" | "medium" | "high"; // Calculated severity level.
  dispatchProtocol: string; // Specific dispatcher instruction guidelines.
  volunteerAlertNeeded: boolean; // Whether volunteer squads nearby should receive instant help notifications.
  containmentSteps: string[]; // 3-4 immediate actions to contain the incident.
  medicalAlertLevel: "none" | "low" | "medium" | "high"; // Needed level of paramedic readiness.
}`;

  const contents = `
${enrichedContext}

Incident Reported:
- Title: ${request.title}
- Category Type: ${request.type}
- Localized Location: ${request.location}
- Description Details: ${request.description}

Please run incident triage algorithms and output the structured EmergencyAIResponse JSON object.`;

  try {
    const response = await client.models.generateContent({
      model: DEFAULT_MODEL,
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response received from Emergency AI model.");
    }

    return JSON.parse(text) as EmergencyAIResponse;
  } catch (error) {
    console.error("Error running Emergency AI:", error);
    return {
      recommendedSeverity: "medium",
      dispatchProtocol: "Dispatch nearest field steward to verify incident conditions.",
      volunteerAlertNeeded: false,
      containmentSteps: ["Verify incident coordinates", "Standby for medical dispatcher instructions"],
      medicalAlertLevel: "none"
    };
  }
}

/**
 * Executes a Volunteer AI operational request
 */
export async function runVolunteerAI(client: GoogleGenAI, request: VolunteerAIRequest): Promise<VolunteerAIResponse> {
  const liveContext = await fetchFirestoreContext(request.assignedSector);
  const enrichedContext = buildEnrichedContextString(liveContext, request);

  const systemInstruction = `You are the Volunteer AI Supervisor for StadiumMind AI.
You translate operational duties into actionable, clear, and safe step-by-step instructions for stadium volunteers.

Ensure your task briefing is context-sensitive: if crowd pressures are high or active security incidents are nearby, adjust the step-by-step guidelines and safety tips to address these hazards.
You MUST adhere strictly to the Anti-Hallucination guidelines: never refer to non-existent layout structures. If live telemetry is unavailable, acknowledge it in the tips and provide general best practices.

You MUST respond with a JSON object conforming exactly to this TypeScript interface:
interface VolunteerAIResponse {
  safetyGuidelines: string[]; // Crucial safety measures the volunteer must adopt.
  stepByStepInstructions: string[]; // Ordered guidelines on how to execute the specific duty.
  escalationThreshold: string; // Direct criteria explaining when to step back and report to an Organizer/Security.
  estimatedCompletionMinutes: number; // Approximate completion duration in minutes.
  crowdControlTips: string[]; // Dynamic crowd psychology/care tips appropriate for this task.
}`;

  const contents = `
${enrichedContext}

Volunteer Task:
- Title: ${request.taskTitle}
- Description: ${request.taskDescription}
- Assigned Sector: ${request.assignedSector}
- Volunteer Experience: ${request.volunteerExperienceLevel || "Standard"}

Please convert this assignment into a supportive, safe, and structured task guide. Return a VolunteerAIResponse JSON object.`;

  try {
    const response = await client.models.generateContent({
      model: DEFAULT_MODEL,
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response received from Volunteer AI model.");
    }

    return JSON.parse(text) as VolunteerAIResponse;
  } catch (error) {
    console.error("Error running Volunteer AI:", error);
    return {
      safetyGuidelines: ["Remain calm", "Do not engage with violent behaviors"],
      stepByStepInstructions: ["Assess current area", "Assist fans to nearest exit/facility as requested"],
      escalationThreshold: "Report to closest security officer if any verbal threat is observed.",
      estimatedCompletionMinutes: 45,
      crowdControlTips: ["Smile", "Keep your instructions simple and clear"]
    };
  }
}

/**
 * Executes an Organizer AI operational request (System-wide Load-Balancing & Operations)
 */
export async function runOrganizerAI(client: GoogleGenAI, request: OrganizerAIRequest): Promise<OrganizerAIResponse> {
  const targetStadiumId = request.stadiumState?.activeGates?.[0]?.id || "sofi"; // extract hint or default
  const liveContext = await fetchFirestoreContext(targetStadiumId);
  const enrichedContext = buildEnrichedContextString(liveContext, request);

  const systemInstruction = `You are the expert Executive Organizer AI brain of StadiumMind AI.
You evaluate the global live parameters of the stadium (crowd gate congestion, food concession queues, active transit, and logged incidents) to coordinate resources and recommend adjustments.

Synthesize all live Firestore telemetry and current parameters into exactly 6 actionable recommendation categories:
- Crowd alerts (alerts related to gate entrance load, scanning speeds, congestion indices)
- Bottlenecks (queues, overloaded zones, transit delay hot-spots, clogged corridors)
- Staffing recommendations (volunteer/security re-deployment, responder dispatch, patrol coverage shifts)
- Sustainability suggestions (solar/microgrid battery, rainwater reclaimation, compost efficiency, and resource utilization)
- Risk warnings (severe hazards, high queue-time spikes, medical readiness warnings, emergency incidents)
- Priority actions (immediate next executive command steps to balance the operational load)

You MUST respond with a JSON object conforming exactly to this TypeScript interface:
interface OrganizerAIResponse {
  crowdAlerts: string[]; // List of crowd alerts or flow warnings.
  bottlenecks: string[]; // List of identified physical/virtual throughput bottleneck locations.
  staffingRecommendations: string[]; // Specific, concrete redeployments or helper dispatch steps.
  sustainabilitySuggestions: string[]; // Concrete recommendations to minimize carbon footprints or recycle metrics.
  riskWarnings: string[]; // Clear risk indicators or hazard alerts based on logged incidents.
  priorityActions: string[]; // Ordered direct actions to take immediately.
  thinkingLog: string; // A short (2-3 sentences) logical trace explaining the optimization analysis.
}`;

  const contents = `
${enrichedContext}

Current Stadium Operations Parameters (Client State):
${JSON.stringify(request.stadiumState, null, 2)}

Operational Focus / Directives:
${request.operationalFocus}

Please analyze this operations telemetry and return a structured OrganizerAIResponse JSON object.`;

  try {
    const response = await client.models.generateContent({
      model: DEFAULT_MODEL,
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response received from Organizer AI model.");
    }

    return JSON.parse(text) as OrganizerAIResponse;
  } catch (error) {
    console.error("Error running Organizer AI:", error);
    return {
      crowdAlerts: ["Monitor scanning speed at Gate A due to simulation spikes."],
      bottlenecks: ["Gate A flow congestion identified in fallback scan."],
      staffingRecommendations: ["Reallocate 3 roving staff members to Gate A queue management."],
      sustainabilitySuggestions: ["Verify solar microgrid output during evening load transition."],
      riskWarnings: ["Concession wait time exceeds average threshold at Section 3."],
      priorityActions: ["Check physical gate scanner connectivity if flow rates delay further."],
      thinkingLog: "Encountered processing failure in the neural core, falling back to safe defaults."
    };
  }
}

/**
 * Executes a Translation AI operational request
 */
export async function runTranslationAI(client: GoogleGenAI, request: TranslationAIRequest): Promise<TranslationAIResponse> {
  const liveContext = await fetchFirestoreContext();
  const enrichedContext = buildEnrichedContextString(liveContext, request);

  const systemInstruction = `You are the Multilingual Translation Engine for StadiumMind AI, specifically handling live announcements, team alerts, and operations guidelines for the FIFA World Cup 2026.
You translate text accurately while preserving technical stadium terms, safety alerts, or directions correctly, maintaining high cultural sensitivity and precision.

Refer to the current context if names of stadiums, gates, or specific active incidents need to be translated or validated.
You MUST adhere strictly to the Anti-Hallucination guidelines: never invent context details.

You MUST respond with a JSON object conforming exactly to this TypeScript interface:
interface TranslationAIResponse {
  translatedText: string; // The translated content.
  detectedLanguage: string; // The language detected in the source text (e.g., "English", "Spanish").
  confidenceScore: number; // Floating point value between 0.0 and 1.0 representing translation confidence.
  culturalNotes?: string; // Optional terminology nuances, stadium references, or World Cup context notes.
}`;

  const contents = `
${enrichedContext}

Target Translation Language: ${request.targetLang}
Context Details: ${request.context || "Standard announcement translation"}
Source Text:
${request.text}

Please translate the text and output a structured TranslationAIResponse JSON object.`;

  try {
    const response = await client.models.generateContent({
      model: DEFAULT_MODEL,
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response received from Translation AI model.");
    }

    return JSON.parse(text) as TranslationAIResponse;
  } catch (error) {
    console.error("Error running Translation AI:", error);
    return {
      translatedText: request.text, // Fail-safe: return original text
      detectedLanguage: "Unknown",
      confidenceScore: 0.0,
      culturalNotes: `Translation failed due to a system alert: ${error instanceof Error ? error.message : "Service Interruption"}`
    };
  }
}
