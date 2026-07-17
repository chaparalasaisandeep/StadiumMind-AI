import { CrowdMetrics } from "../types";

export interface CrowdAIService {
  /**
   * Forecasts crowd build-ups 30-60 minutes into the future based on live flow sensor telemetry
   */
  forecastGatePressure(stadiumId: string): Promise<{
    gateId: string;
    forecastedPressure: "low" | "medium" | "high";
    estimatedWaitTimeMinutes: number;
  }[]>;
}

export const crowdAIService: CrowdAIService = {
  async forecastGatePressure(stadiumId) {
    // TODO: In Phase 2, configure time-series predictions or Gemini-driven forecast agents.
    return [
      { gateId: "gate_a", forecastedPressure: "high", estimatedWaitTimeMinutes: 28 },
      { gateId: "gate_b", forecastedPressure: "medium", estimatedWaitTimeMinutes: 11 }
    ];
  }
};
