import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";
import {
  runFanAI,
  runTransportAI,
  runEmergencyAI,
  runVolunteerAI,
  runOrganizerAI,
  runTranslationAI
} from "./server-ai";

dotenv.config();

// Shared Gemini Client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    
    if (key.startsWith("AQ.")) {
      console.log("[Server Gemini] Detected AQ. format key. Applying API key classifier workaround to bypass ACCESS_TOKEN_TYPE_UNSUPPORTED...");
      aiClient = new GoogleGenAI({
        apiKey: "AIzaSyDUMMY_CLASSIFIER_KEY",
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
            "x-goog-api-key": key,
          },
        },
      });
    } else {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Production-grade security headers
  app.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    // Only apply HSTS in production to prevent locking local development
    if (process.env.NODE_ENV === "production") {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    }
    next();
  });

  // API Endpoints
  app.get("/api/health", (req, res) => {
    const geminiAvailable = !!process.env.GEMINI_API_KEY;
    res.json({ 
      status: "ok", 
      time: new Date().toISOString(),
      geminiKeyAvailable: geminiAvailable,
      aiEndpointsReady: geminiAvailable
    });
  });

  // Conversational Fan Guide Chat API using gemini-3.5-flash
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, role } = req.body;
      const client = getGeminiClient();

      const systemPrompt = `You are StadiumMind AI, the premier AI-powered Operating System for the FIFA World Cup 2026.
You are communicating with a user in the active role of: "${role || "Fan"}".

Adopt a highly helpful, reassuring, and context-aware professional persona.
Provide highly precise, practical, and clear responses.

=== MULTILINGUAL & CULTURAL ADAPTABILITY ===
1. Automatically detect the user's language (supporting English, Spanish, French, Arabic, Hindi, Japanese, and Portuguese).
2. Respond fully and naturally in the detected language.
3. Keep technical or official terminology (like "Gate B", "Section 104", "Suite 22", or "Medics Delta") exactly in their official form so users can easily correlate them with physical signage.

=== HALLUCINATION PREVENTION & UNCERTAINTY ===
1. Only answer based on verified, known facts. NEVER invent or fabricate seating layouts, gate configurations, concession menus, wait times, or incidents.
2. Clearly distinguish between:
   - KNOWN / REAL-TIME DATA: Information that you know is currently active.
   - ESTIMATED DATA: Projections or recommendations based on typical operational models. Clearly prefix these as "[Estimate]" or "[Projected]".
   - UNKNOWN / UNAVAILABLE DATA: If you do not have sufficient data in your history or context, state clearly and gracefully: "Live details are currently unavailable for this specific request."
3. Guide the user with standard, safe protocols when exact operational telemetry is unavailable.

=== ROLE-BASED TAILORING ===
- Fan: Guide with official seat wayfinding, realistic transit options, security guidelines, and concession/restroom locations.
- Volunteer: Provide supportive, step-by-step guidance on crowd control, water station setups, and hospitality. Keep tasks organized and focused on safety.
- Security/Medical: Keep instructions rapid, highly structured, clear, and actionable.

Format your responses beautifully in clean markdown, with list items, bold key terms, and concise paragraphs. Avoid system-internal details or tech jargon.`;

      // Format history to Google GenAI Chat format
      const formattedHistory = Array.isArray(history)
        ? history.map((h: any) => ({
            role: h.role === "user" ? "user" : "model",
            parts: [{ text: h.text || h.message || "" }],
          }))
        : [];

      const chat = client.chats.create({
        model: "gemini-3.5-flash",
        history: formattedHistory,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.2,
        },
      });

      const response = await chat.sendMessage({ message });
      res.json({ text: response.text });
    } catch (error) {
      console.error("Error in AI chat:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
    }
  });

  // Enterprise Load-Balancing & Optimization Advisor API (High Thinking Mode)
  // MUST use gemini-3.1-pro-preview and set thinkingLevel to ThinkingLevel.HIGH
  app.post("/api/advisor/analyze", async (req, res) => {
    try {
      const { stadiumState, query, role } = req.body;
      const client = getGeminiClient();

      const systemPrompt = `You are the High-Intelligence Operational Brain of StadiumMind AI.
You run in HIGH-THINKING analytical mode to analyze complex, multi-system, and safety-critical crowd logistics, security, medical, and sustainable resources for the FIFA World Cup 2026.

=== CORE ANALYTICAL Directives ===
1. Formulate thorough, step-by-step tactical advisories that optimize safety, throughput, and carbon footprints.
2. Ingest and synthesize the provided live telemetry state:
   - Active Gates load and queue pressures
   - Concession wait times and logistics bottlenecks
   - Transit schedules and delay hotspots
   - Security, medical, and structural incident alerts
3. Provide concrete, numerical, or logistical re-routing procedures, dispatcher protocols, and resources layout.

=== ANTI-HALLUCINATION & ESTIMATES ===
1. Under no circumstances should you fabricate or invent physical parameters, non-existent facilities, or evacuation corridors.
2. If certain telemetry metrics are missing from the inputs, state so explicitly as "Data Pending / Offline" and focus on other verifiable indicators.
3. If providing a calculation or prediction, clearly frame it as "[Projected Estimate]" and explain your logical reasoning and assumptions.

=== MULTILINGUAL ADAPTATION ===
- Detect the input language (e.g., English, Spanish, French, Arabic, Hindi, Japanese, Portuguese) and respond in that language.
- Maintain standardized stadium naming or official labels.

Be structured, precise, authoritative, and professional. Use markdown, bold headers, and clean bullet points.`;

      const prompt = `
User Role: ${role || "Organizer"}
User Query/Focus: ${query || "Provide a comprehensive system-wide optimization plan."}

Current Stadium Operations State:
${JSON.stringify(stadiumState, null, 2)}

Please perform a deep, high-reasoning operational audit and provide actionable strategies.
`;

      const response = await client.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH,
          },
          temperature: 0.1,
        },
      });

      res.json({ text: response.text });
    } catch (error) {
      console.error("Error in High-Thinking Advisor:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
    }
  });

  // Centralized AI Orchestrator API Router
  app.post("/api/ai/orchestrate", async (req, res) => {
    try {
      const { serviceType, payload } = req.body;
      if (!serviceType) {
        return res.status(400).json({ success: false, error: "Missing required parameter: serviceType" });
      }

      const client = getGeminiClient();
      let result;

      switch (serviceType) {
        case "fan":
          result = await runFanAI(client, payload);
          break;
        case "transport":
          result = await runTransportAI(client, payload);
          break;
        case "emergency":
          result = await runEmergencyAI(client, payload);
          break;
        case "volunteer":
          result = await runVolunteerAI(client, payload);
          break;
        case "organizer":
          result = await runOrganizerAI(client, payload);
          break;
        case "translation":
          result = await runTranslationAI(client, payload);
          break;
        default:
          return res.status(400).json({ success: false, error: `Invalid or unsupported serviceType: ${serviceType}` });
      }

      res.json({ success: true, data: result });
    } catch (error) {
      console.error("Orchestrator error:", error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Internal Server Error" });
    }
  });

  // Vite dev or production static serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`StadiumMind AI custom server running on http://0.0.0.0:${PORT}`);
  });

  // Graceful shutdown for production container environments (SIGTERM / SIGINT)
  const shutdown = (signal: string) => {
    console.log(`Received ${signal}. Gracefully decommissioning StadiumMind server resources...`);
    server.close(() => {
      console.log("HTTP server shutdown complete. Exiting process.");
      process.exit(0);
    });
    
    // Safety exit timeout if close hangs
    setTimeout(() => {
      console.warn("Forced decommission activated after timeout.");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // Global uncaught rejection hooks to keep container stable and log cleanly
  process.on("unhandledRejection", (reason, promise) => {
    console.error("[CRITICAL SRE ALERT] Unhandled Promise Rejection at:", promise, "reason:", reason);
  });

  process.on("uncaughtException", (error) => {
    console.error("[CRITICAL SRE ALERT] Uncaught exception captured:", error);
    // Graceful exit to allow orchestration system (e.g., Cloud Run, Kubernetes) to replace the container
    process.exit(1);
  });
}

startServer();
