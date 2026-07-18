import { auth } from "../firebase/auth";
import { UserRole } from "../types";

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export interface GeminiService {
  /**
   * Performs conversational reasoning for real-time guest experiences or volunteer task guidelines.
   * Calls the secure server-side endpoint proxies.
   */
  chat(message: string, history: ChatMessage[], userRole: UserRole): Promise<string>;

  /**
   * Run complex high-thinking operations simulations to resolve stadium crowd bottlenecks.
   * Leverages gemini-3.1-pro-preview reasoning with ThinkingLevel.HIGH via secure backend.
   */
  analyzeBottlenecks(stadiumStateJson: string, query: string, userRole?: UserRole): Promise<string>;
}


const analyzeCache = new Map<string, { data: string, timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute cache TTL for AI analysis to avoid redundant network requests

export const geminiService: GeminiService = {

  async chat(message, history, userRole) {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
"Authorization": `Bearer ${auth?.currentUser ? await auth.currentUser.getIdToken() : ""}` },
        body: JSON.stringify({
          message,
          history,
          role: userRole,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.text || "No response received from StadiumMind AI.";
    } catch (error) {
      console.error("Error calling server chat API:", error);
      return `[StadiumMind AI Link Error]: Could not establish communication with the cognitive core server. Details: ${error instanceof Error ? error.message : "Network Disruption"}`;
    }
  },

    async analyzeBottlenecks(stadiumStateJson, query, userRole = "operator") {
    try {
      const cacheKey = JSON.stringify({stadiumStateJson, query, userRole});
      const cached = analyzeCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log("Serving AI analysis from local cache.");
        return cached.data;
      }

      let parsedState = {};
      try {
        parsedState = JSON.parse(stadiumStateJson);
      } catch {
        parsedState = { raw: stadiumStateJson };
      }

      const response = await fetch("/api/advisor/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
"Authorization": `Bearer ${auth?.currentUser ? await auth.currentUser.getIdToken() : ""}` },
        body: JSON.stringify({
          stadiumState: parsedState,
          query,
          role: userRole,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const resultText = data.text || "No analytical insights compiled.";
      analyzeCache.set(cacheKey, { data: resultText, timestamp: Date.now() });
      return resultText;
    } catch (error) {
      console.error("Error calling server advisor API:", error);
      return `[Advisor System Link Error]: Could not stream operational metrics to high-thinking reasoning core. Details: ${error instanceof Error ? error.message : "Network Disruption"}`;
    }
  },
};
