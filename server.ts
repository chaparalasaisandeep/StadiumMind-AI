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
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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

      const systemPrompt = `You are StadiumMind AI, the advanced AI Operating System for the FIFA World Cup 2026 Stadiums (specifically operating across stadiums in USA, Canada, and Mexico).
      You are speaking with a user who has the active role of: "${role || "Fan"}".
      Adopt a professional, highly helpful, and context-aware persona.
      Provide concise, precise, and practical answers.
      - If they are a Fan, guide them with seating location info, concession wait times, restrooms, security rules, transportation.
      - If they are a Volunteer, guide them with crowd management tasks, water station checks, gate assistance protocols.
      - If they are Security/Medical, keep your answers structured, actionable, and rapid.
      Keep answers clear, helpful, and beautifully formatted in markdown.`;

      const chat = client.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction: systemPrompt,
        },
      });

      // Simple implementation of sending the message
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
      You are running in HIGH-THINKING analytical mode to solve highly complex, multi-agent, system-wide logistics, security, medical, and crowd-flow problems for the FIFA World Cup 2026.
      
      Inputs from the operations dashboard:
      - Active Gates load
      - Concession wait times and bottlenecks
      - Transit delays (Shuttles, Trains, Parking)
      - Security incidents reported
      - Medical triage queues
      
      Generate a thorough, deep tactical advisory. Provide specific, mathematical, or logistical steps to balance the crowd, re-route fans, dispatch volunteers, or trigger contingency protocols. Explain your reasoning steps clearly.
      Be precise, structured, and expert. Avoid generic responses. Use bullet points and bold sections.`;

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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StadiumMind AI custom server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
