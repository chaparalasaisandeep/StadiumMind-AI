export type AIServiceType =
  | "fan"
  | "transport"
  | "emergency"
  | "volunteer"
  | "organizer"
  | "translation";

// 1. Fan AI Service Interfaces
export interface FanAIRequest {
  query: string;
  stadiumId: string;
  userContext?: {
    seatSection?: string;
    ticketType?: string;
    lang?: string;
  };
}

export interface FanAIResponse {
  answer: string;
  suggestedActions: string[];
  seatingAdvisory?: string;
  concessionInfo?: string;
}

// 2. Transport AI Service Interfaces
export interface TransportAIRequest {
  stadiumId: string;
  lotId?: string;
  modeOfInterest?: "shuttle" | "metro" | "train" | "bus" | "all";
}

export interface TransportAIResponse {
  shuttleStatus: string;
  recommendedTransitMode: string;
  advisoryText: string;
  estimatedWaitMinutes: number;
  alternativeRoutes: {
    route: string;
    mode: "shuttle" | "metro" | "train" | "bus";
    estimatedTime: number;
  }[];
}

// 3. Emergency AI Service Interfaces
export interface EmergencyAIRequest {
  title: string;
  type: "security" | "medical" | "congestion" | "maintenance";
  location: string;
  description: string;
}

export interface EmergencyAIResponse {
  recommendedSeverity: "low" | "medium" | "high";
  dispatchProtocol: string;
  volunteerAlertNeeded: boolean;
  containmentSteps: string[];
  medicalAlertLevel: "none" | "low" | "medium" | "high";
}

// 4. Volunteer AI Service Interfaces
export interface VolunteerAIRequest {
  taskTitle: string;
  taskDescription: string;
  assignedSector: string;
  volunteerExperienceLevel?: string;
}

export interface VolunteerAIResponse {
  safetyGuidelines: string[];
  stepByStepInstructions: string[];
  escalationThreshold: string;
  estimatedCompletionMinutes: number;
  crowdControlTips: string[];
}

// 5. Organizer AI Service Interfaces
export interface OrganizerAIRequest {
  stadiumState: any; // Can be StadiumState or custom active state object
  operationalFocus: string;
}

export interface OrganizerAIResponse {
  crowdAlerts: string[];
  bottlenecks: string[];
  staffingRecommendations: string[];
  sustainabilitySuggestions: string[];
  riskWarnings: string[];
  priorityActions: string[];
  thinkingLog: string;
}

// 6. Translation AI Service Interfaces
export interface TranslationAIRequest {
  text: string;
  targetLang: string;
  context?: string;
}

export interface TranslationAIResponse {
  translatedText: string;
  detectedLanguage: string;
  confidenceScore: number;
  culturalNotes?: string;
}

// 7. Centralized Orchestrator Request / Response
export interface AIOrchestrationRequest {
  serviceType: AIServiceType;
  payload: any;
}

export interface AIOrchestrationResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
