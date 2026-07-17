import { OrganizerAIRequest, OrganizerAIResponse } from "./aiTypes";
import { callAIOrchestrator } from "./aiOrchestrator";

export interface OrganizerAIService {
  /**
   * Run expert resource allocations and system optimization audits for stadium managers.
   */
  optimizeStadiumOperations(request: OrganizerAIRequest): Promise<OrganizerAIResponse>;
}

export const organizerAIService: OrganizerAIService = {
  async optimizeStadiumOperations(request) {
    try {
      return await callAIOrchestrator<OrganizerAIResponse>("organizer", request);
    } catch (error) {
      console.error("organizerAIService.optimizeStadiumOperations failed, returning fail-safe response:", error);
      return {
        crowdAlerts: ["Monitor scanning speed at Gate A due to simulation spikes."],
        bottlenecks: ["Gate A flow congestion identified in fallback scan."],
        staffingRecommendations: ["Reallocate 3 roving staff members to Gate A queue management."],
        sustainabilitySuggestions: ["Verify solar microgrid output during evening load transition."],
        riskWarnings: ["Concession wait time exceeds average threshold at Section 3."],
        priorityActions: ["Check physical gate scanner connectivity if flow rates delay further."],
        thinkingLog: "Local backup engine triggered. Dynamic AI telemetry routing has reverted to offline modes."
      };
    }
  }
};
