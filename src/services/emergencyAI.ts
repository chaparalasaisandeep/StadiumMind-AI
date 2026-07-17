import { AlertIncident } from "../types";
import { EmergencyAIRequest, EmergencyAIResponse } from "./aiTypes";
import { callAIOrchestrator } from "./aiOrchestrator";

export interface EmergencyAIService {
  /**
   * Performs real-time risk severity checks on reported alarms to automatically triage priority.
   */
  assessSeverityAndTriage(incident: Partial<AlertIncident> & { description?: string }): Promise<{
    recommendedSeverity: "low" | "medium" | "high";
    dispatchProtocol: string;
    volunteerAlertNeeded: boolean;
    containmentSteps?: string[];
    medicalAlertLevel?: "none" | "low" | "medium" | "high";
  }>;
}

export const emergencyAIService: EmergencyAIService = {
  async assessSeverityAndTriage(incident) {
    try {
      const payload: EmergencyAIRequest = {
        title: incident.title || "Reported Incident",
        type: incident.type || "security",
        location: incident.location || "Unknown Location",
        description: incident.description || incident.title || "No description provided."
      };

      const result = await callAIOrchestrator<EmergencyAIResponse>("emergency", payload);
      return {
        recommendedSeverity: result.recommendedSeverity,
        dispatchProtocol: result.dispatchProtocol,
        volunteerAlertNeeded: result.volunteerAlertNeeded,
        containmentSteps: result.containmentSteps,
        medicalAlertLevel: result.medicalAlertLevel
      };
    } catch (error) {
      console.error("emergencyAIService.assessSeverityAndTriage failed, returning fallback:", error);
      return {
        recommendedSeverity: incident.severity || "medium",
        dispatchProtocol: "Dispatch nearest field steward to verify incident conditions.",
        volunteerAlertNeeded: true,
        containmentSteps: ["Verify incident coordinates", "Standby for medical dispatcher instructions"],
        medicalAlertLevel: "none"
      };
    }
  }
};
