import { auth } from "../firebase/auth";
import { AIServiceType, AIOrchestrationResponse } from "./aiTypes";

/**
 * Centrally coordinates all AI-driven service communications.
 * Dispatches requests to the secure `/api/ai/orchestrate` Express backend route.
 */
export async function callAIOrchestrator<T>(
  serviceType: AIServiceType,
  payload: any
): Promise<T> {
  try {
    const response = await fetch("/api/ai/orchestrate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
"Authorization": `Bearer ${auth?.currentUser ? await auth.currentUser.getIdToken() : ""}` },
      body: JSON.stringify({
        serviceType,
        payload,
      }),
    });

    if (!response.ok) {
      throw new Error(`Orchestration error! status: ${response.status}`);
    }

    const data: AIOrchestrationResponse<T> = await response.json();
    if (!data.success) {
      throw new Error(data.error || `Unknown failure running service '${serviceType}'`);
    }

    if (data.data === undefined || data.data === null) {
      throw new Error("Received empty cognitive data payload from orchestrator.");
    }

    return data.data;
  } catch (error) {
    console.error(`[AI Orchestration Error] Service: ${serviceType}`, error);
    throw error;
  }
}
