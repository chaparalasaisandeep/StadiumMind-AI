import { describe, it, expect, vi, Mock, beforeEach, afterEach } from "vitest";
import { callAIOrchestrator } from "../../src/services/aiOrchestrator";
import { fanAIService } from "../../src/services/fanAI";
import { transportAIService } from "../../src/services/transportAI";
import { emergencyAIService } from "../../src/services/emergencyAI";
import { volunteerAIService } from "../../src/services/volunteerAI";
import { organizerAIService } from "../../src/services/organizerAI";
import { translationAIService } from "../../src/services/translationAI";

describe("AI Orchestrator & Multi-Modal Agent Services Tests", () => {
  let consoleErrorSpy: any;
  let consoleWarnSpy: any;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it("callAIOrchestrator successfully calls API", async () => {
    const mockJson = vi.fn().mockResolvedValue({
      success: true,
      data: { answer: "Welcome to the stadium!" }
    });
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: mockJson
    });

    const result = await callAIOrchestrator<any>("fan", { query: "hello" });
    expect(result.answer).toBe("Welcome to the stadium!");
    expect(global.fetch).toHaveBeenCalledWith("/api/ai/orchestrate", expect.objectContaining({
      method: "POST"
    }));
  });

  it("callAIOrchestrator throws error on failed fetch", async () => {
    (global.fetch as Mock).mockResolvedValue({
      ok: false,
      status: 500
    });

    await expect(callAIOrchestrator("fan", { query: "hello" })).rejects.toThrow("Orchestration error! status: 500");
  });

  it("callAIOrchestrator throws error on success=false response", async () => {
    const mockJson = vi.fn().mockResolvedValue({
      success: false,
      error: "AI model timeout"
    });
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: mockJson
    });

    await expect(callAIOrchestrator("fan", { query: "hello" })).rejects.toThrow("AI model timeout");
  });

  it("fanAIService returns response on success", async () => {
    const mockJson = vi.fn().mockResolvedValue({
      success: true,
      data: {
        answer: "Go to section 101",
        suggestedActions: ["Navigate"],
        seatingAdvisory: "Row C",
        concessionInfo: "Clean"
      }
    });
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: mockJson
    });

    const res = await fanAIService.guideFan({ query: "Where is my seat?", stadiumId: "sofi" });
    expect(res.answer).toBe("Go to section 101");
  });

  it("fanAIService returns fallback on error", async () => {
    (global.fetch as Mock).mockRejectedValue(new Error("Network disconnect"));

    const res = await fanAIService.guideFan({ query: "Where is my seat?", stadiumId: "sofi" });
    expect(res.answer).toContain("We are currently experiencing a slight signal delay");
    expect(res.suggestedActions).toContain("Retry Guide Query");
  });

  it("transportAIService.getTransitAdvisory returns response on success", async () => {
    const mockJson = vi.fn().mockResolvedValue({
      success: true,
      data: {
        shuttleStatus: "Delayed 5m",
        recommendedTransitMode: "Metro",
        advisoryText: "Use Line B"
      }
    });
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: mockJson
    });

    const res = await transportAIService.getTransitAdvisory("stadium-1");
    expect(res.shuttleStatus).toBe("Delayed 5m");
  });

  it("transportAIService.getTransitAdvisoryDetailed returns fallback on error", async () => {
    (global.fetch as Mock).mockRejectedValue(new Error("No response"));

    const res = await transportAIService.getTransitAdvisoryDetailed({ stadiumId: "stadium-1", modeOfInterest: "shuttle" });
    expect(res.shuttleStatus).toBe("Active - minor backlog");
    expect(res.alternativeRoutes[0].route).toBe("Station Hub Link");
  });

  it("emergencyAIService.assessSeverityAndTriage returns response on success", async () => {
    const mockJson = vi.fn().mockResolvedValue({
      success: true,
      data: {
        recommendedSeverity: "high",
        dispatchProtocol: "Send ambulance",
        volunteerAlertNeeded: true,
        containmentSteps: ["Evacuate"],
        medicalAlertLevel: "high"
      }
    });
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: mockJson
    });

    const res = await emergencyAIService.assessSeverityAndTriage({ title: "Medical Issue", type: "medical" });
    expect(res.recommendedSeverity).toBe("high");
    expect(res.containmentSteps).toContain("Evacuate");
  });

  it("emergencyAIService.assessSeverityAndTriage returns fallback on error", async () => {
    (global.fetch as Mock).mockRejectedValue(new Error("Emergency engine crash"));

    const res = await emergencyAIService.assessSeverityAndTriage({ title: "Fire", severity: "high" });
    expect(res.recommendedSeverity).toBe("high");
    expect(res.dispatchProtocol).toContain("Dispatch nearest field steward");
  });

  it("volunteerAIService.getTaskBriefing returns response on success", async () => {
    const mockJson = vi.fn().mockResolvedValue({
      success: true,
      data: {
        safetyGuidelines: ["Safety first"],
        stepByStepInstructions: ["Observe", "Assist"],
        escalationThreshold: "Report security issues",
        estimatedCompletionMinutes: 15,
        crowdControlTips: ["Smile"]
      }
    });
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: mockJson
    });

    const res = await volunteerAIService.getTaskBriefing({ taskTitle: "Crowd control", taskDescription: "Control gates", assignedSector: "Gate A" });
    expect(res.safetyGuidelines).toContain("Safety first");
    expect(res.estimatedCompletionMinutes).toBe(15);
  });

  it("volunteerAIService.getTaskBriefing returns fallback on error", async () => {
    (global.fetch as Mock).mockRejectedValue(new Error("API offline"));

    const res = await volunteerAIService.getTaskBriefing({ taskTitle: "Seating aid", taskDescription: "Assist fans", assignedSector: "Sector 101" });
    expect(res.safetyGuidelines).toContain("Always wear your high-visibility volunteer vest.");
    expect(res.estimatedCompletionMinutes).toBe(30);
  });

  it("organizerAIService.optimizeStadiumOperations returns response on success", async () => {
    const mockJson = vi.fn().mockResolvedValue({
      success: true,
      data: {
        crowdAlerts: ["Crowd alert!"],
        bottlenecks: ["Gate B"],
        staffingRecommendations: ["Hire more staff"],
        sustainabilitySuggestions: ["Solar panels"],
        riskWarnings: ["Heat index high"],
        priorityActions: ["Open gates"],
        thinkingLog: "System working fine"
      }
    });
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: mockJson
    });

    const res = await organizerAIService.optimizeStadiumOperations({ stadiumState: {}, operationalFocus: "Crowd control and queues" });
    expect(res.crowdAlerts).toContain("Crowd alert!");
    expect(res.bottlenecks).toContain("Gate B");
  });

  it("organizerAIService.optimizeStadiumOperations returns fallback on error", async () => {
    (global.fetch as Mock).mockRejectedValue(new Error("Timeout"));

    const res = await organizerAIService.optimizeStadiumOperations({ stadiumState: {}, operationalFocus: "Staff reallocation" });
    expect(res.crowdAlerts[0]).toContain("Monitor scanning speed at Gate A");
    expect(res.staffingRecommendations[0]).toContain("Reallocate 3 roving staff members");
  });

  it("translationAIService.translateText returns response on success", async () => {
    const mockJson = vi.fn().mockResolvedValue({
      success: true,
      data: {
        translatedText: "Hola mundo",
        detectedLanguage: "en",
        confidenceScore: 0.99,
        culturalNotes: "General greeting"
      }
    });
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: mockJson
    });

    const res = await translationAIService.translateText("Hello world", "en", "es");
    expect(res).toBe("Hola mundo");
  });

  it("translationAIService.translateText returns original text on fallback", async () => {
    (global.fetch as Mock).mockRejectedValue(new Error("Translation API broken"));

    const res = await translationAIService.translateText("Bonjour", "fr", "en");
    expect(res).toBe("Bonjour");
  });

  it("translationAIService.translateTextDetailed returns fallback on error", async () => {
    (global.fetch as Mock).mockRejectedValue(new Error("Detailed translate offline"));

    const res = await translationAIService.translateTextDetailed({ text: "Hello", targetLang: "de" });
    expect(res.translatedText).toBe("Hello");
    expect(res.detectedLanguage).toBe("Unknown");
  });
});
