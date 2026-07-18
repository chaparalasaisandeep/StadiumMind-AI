import { firestoreServices } from "../firebase/firestore";
import { where } from "firebase/firestore";

export interface AnalyticsService {
  /**
   * Aggregates live stadium performance indices, sustainability outcomes, and fan feedback parameters
   */
  getDashboardAnalyticsSummary(stadiumId: string): Promise<{
    efficiencyScore: number; // 0 to 100
    crowdBalanceIndex: number; // 0 to 100
    greenEnergyIndex: number; // 0 to 100
    carbonSavedMetricKg: number;
  }>;
}

export const analyticsService: AnalyticsService = {
  async getDashboardAnalyticsSummary(stadiumId) {
    try {
      const [crowdDocs, sustDocs, alertsDocs] = await Promise.all([
        firestoreServices.crowd.list(where("stadiumId", "==", stadiumId)).catch(() => []),
        firestoreServices.sustainability.list(where("stadiumId", "==", stadiumId)).catch(() => []),
        firestoreServices.alerts.list().catch(() => [])
      ]);

      const stadiumCrowd = crowdDocs.filter(d => d.stadiumId === stadiumId);
      const stadiumSust = sustDocs.filter(d => d.stadiumId === stadiumId);
      const stadiumAlerts = alertsDocs.filter(d => d.stadiumId === stadiumId || d.id?.includes(stadiumId));

      // 1. Calculate operational efficiency score based on incident resolution
      const totalIncidents = stadiumAlerts.length;
      const resolvedIncidents = stadiumAlerts.filter(i => i.status === "resolved").length;
      let efficiencyScore = 88; // Default robust baseline
      if (totalIncidents > 0) {
        const resolutionRatio = resolvedIncidents / totalIncidents;
        efficiencyScore = Math.round(75 + (resolutionRatio * 20)); // scale between 75 and 95
      }

      // 2. Calculate crowd balance index based on difference between gate congestion rates
      let crowdBalanceIndex = 75; // Default baseline
      if (stadiumCrowd.length > 0) {
        const indices = stadiumCrowd.map(c => c.congestionIndex || 0);
        const maxCongestion = Math.max(...indices);
        const minCongestion = Math.min(...indices);
        const variance = maxCongestion - minCongestion;
        // High variance means imbalanced gates
        crowdBalanceIndex = Math.max(20, Math.min(100, Math.round(100 - (variance * 0.8))));
      }

      // 3. Carbon savings based on live sustainability indicators
      let carbonSavedMetricKg = 1420;
      let greenEnergyIndex = 94;
      if (stadiumSust.length > 0) {
        const metric = stadiumSust[0];
        const wasteCo2Saved = (metric.wasteRecycledKg || 0) * 0.45; // 0.45 kg of CO2 per kg of waste recycled
        const energyCo2Saved = (metric.energySavedKwh || 0) * 0.52; // 0.52 kg of CO2 per kWh of solar energy generated
        const waterMultiplier = (metric.waterSavedLitres || 0) * 0.002;
        
        carbonSavedMetricKg = Math.round(wasteCo2Saved + energyCo2Saved + waterMultiplier);
        
        // Scale energy index with saved Kwh relative to a standard daily target (15000 kWh)
        const energySaved = metric.energySavedKwh || 0;
        greenEnergyIndex = Math.min(100, Math.max(60, Math.round(80 + (energySaved / 15000) * 20)));
      }

      return {
        efficiencyScore,
        crowdBalanceIndex,
        greenEnergyIndex,
        carbonSavedMetricKg
      };
    } catch (error) {
      console.warn("Error running analytical services summary, returning baseline offsets:", error);
      return {
        efficiencyScore: 88,
        crowdBalanceIndex: 72,
        greenEnergyIndex: 94,
        carbonSavedMetricKg: 1420
      };
    }
  }
};
