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

export const geminiService: GeminiService = {
  async chat(message, history, userRole) {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
        },
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
      return data.text || "No analytical insights compiled.";
    } catch (error) {
      console.error("Error calling server advisor API:", error);
      return `[Advisor System Link Error]: Could not stream operational metrics to high-thinking reasoning core. Details: ${error instanceof Error ? error.message : "Network Disruption"}`;
    }
  },
};
