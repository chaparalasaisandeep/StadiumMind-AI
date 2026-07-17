import { TransportAIRequest, TransportAIResponse } from "./aiTypes";
import { callAIOrchestrator } from "./aiOrchestrator";

export interface TransportAIService {
  /**
   * Generates dynamic routing advisory for multi-modal stadium transports (shuttles, ride-shares, rail)
   * This is backward-compatible with Phase 1 components.
   */
  getTransitAdvisory(stadiumId: string): Promise<{
    shuttleStatus: string;
    recommendedTransitMode: string;
    advisoryText: string;
  }>;

  /**
   * Generates high-fidelity multi-modal transport routing recommendations.
   */
  getTransitAdvisoryDetailed(request: TransportAIRequest): Promise<TransportAIResponse>;
}

export const transportAIService: TransportAIService = {
  async getTransitAdvisory(stadiumId) {
    try {
      const response = await callAIOrchestrator<TransportAIResponse>("transport", { stadiumId });
      return {
        shuttleStatus: response.shuttleStatus,
        recommendedTransitMode: response.recommendedTransitMode,
        advisoryText: response.advisoryText
      };
    } catch (error) {
      console.warn("getTransitAdvisory fallback triggered:", error);
      return {
        shuttleStatus: "Active - normal flow",
        recommendedTransitMode: "Express Tram Line",
        advisoryText: "Standard transit services are running. Refer to local station monitors for minor adjustments."
      };
    }
  },

  async getTransitAdvisoryDetailed(request) {
    try {
      return await callAIOrchestrator<TransportAIResponse>("transport", request);
    } catch (error) {
      console.error("transportAIService.getTransitAdvisoryDetailed failed, returning fallback:", error);
      return {
        shuttleStatus: "Active - minor backlog",
        recommendedTransitMode: "Metro Link",
        advisoryText: "Transit networks are running with minor delays. High-precision advisory routing is in standby.",
        estimatedWaitMinutes: 12,
        alternativeRoutes: [
          { route: "Station Hub Link", mode: "metro", estimatedTime: 18 }
        ]
      };
    }
  }
};
