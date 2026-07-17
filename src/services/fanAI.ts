import { FanAIRequest, FanAIResponse } from "./aiTypes";
import { callAIOrchestrator } from "./aiOrchestrator";

export interface FanAIService {
  /**
   * Retrieves intelligent, location-aware answers to fan queries.
   */
  guideFan(request: FanAIRequest): Promise<FanAIResponse>;
}

export const fanAIService: FanAIService = {
  async guideFan(request) {
    try {
      return await callAIOrchestrator<FanAIResponse>("fan", request);
    } catch (error) {
      console.error("fanAIService.guideFan failed, returning fail-safe response:", error);
      return {
        answer: `We are currently experiencing a slight signal delay with StadiumMind AI. ${error instanceof Error ? error.message : "Service Offline"}`,
        suggestedActions: ["Retry Guide Query", "Go to Seating Map"],
        seatingAdvisory: "Guide is offline. Please consult physical signs or volunteers.",
        concessionInfo: "Queue states currently unavailable."
      };
    }
  }
};
