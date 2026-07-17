import { VolunteerAIRequest, VolunteerAIResponse } from "./aiTypes";
import { callAIOrchestrator } from "./aiOrchestrator";

export interface VolunteerAIService {
  /**
   * Generates step-by-step guidance, safety tips, and escalation thresholds for volunteer tasks.
   */
  getTaskBriefing(request: VolunteerAIRequest): Promise<VolunteerAIResponse>;
}

export const volunteerAIService: VolunteerAIService = {
  async getTaskBriefing(request) {
    try {
      return await callAIOrchestrator<VolunteerAIResponse>("volunteer", request);
    } catch (error) {
      console.error("volunteerAIService.getTaskBriefing failed, returning fail-safe response:", error);
      return {
        safetyGuidelines: ["Keep calm", "Always wear your high-visibility volunteer vest."],
        stepByStepInstructions: [
          "Scan your assigned sector area for any clear crowd delays or safety issues.",
          "Welcome fans and assist with seating or transit navigation directions as requested.",
          "Keep in touch with your assigned sector coordinator."
        ],
        escalationThreshold: "Please contact stadium security immediately if you encounter any hostile behavior.",
        estimatedCompletionMinutes: 30,
        crowdControlTips: ["Address groups politely but with authority.", "Keep exit lanes completely clear."]
      };
    }
  }
};
