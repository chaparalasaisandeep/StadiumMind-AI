export type UserRole =
  | "Fan"
  | "Volunteer"
  | "Organizer"
  | "Security"
  | "Medical"
  | "Transport"
  | "Admin"
  | "Accessibility";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  assignedSector?: string;
  createdAt: string;
}

export interface Stadium {
  id: string;
  name: string;
  city: string;
  country: "USA" | "Canada" | "Mexico";
  lat: number;
  lng: number;
  capacity: number;
  gatesCount: number;
  emergencyExitPlanUrl?: string;
}

export interface Match {
  id: string;
  stadiumId: string;
  teamA: string;
  teamB: string;
  kickoffTime: string;
  status: "scheduled" | "live" | "completed";
  attendance: number;
}

export interface CrowdMetrics {
  id: string;
  stadiumId: string;
  gateId: string;
  pressure: "low" | "medium" | "high";
  flowRate: number; // people per min
  congestionIndex: number; // 0 to 100
  timestamp: string;
}

export interface TransitSchedule {
  id: string;
  stadiumId: string;
  route: string;
  type: "shuttle" | "metro" | "train" | "bus";
  activeUnits: number;
  waitTimeMinutes: number;
  status: "normal" | "delayed" | "suspended";
}

export interface ParkingState {
  id: string;
  stadiumId: string;
  lotName: string;
  occupancyPercentage: number;
  status: "available" | "busy" | "full";
  accessibilitySpotsFree: number;
}

export interface Announcement {
  id: string;
  stadiumId: string;
  title: string;
  content: string;
  category: "general" | "emergency" | "transit" | "accessibility";
  audience: "all" | "volunteers" | "staff";
  timestamp: string;
}

export interface SustainabilityMetric {
  id: string;
  stadiumId: string;
  wasteRecycledKg: number;
  energySavedKwh: number;
  waterSavedLitres: number;
  timestamp: string;
}

// Existing layout-specific states for SoFi, MetLife, Azteca
export interface StadiumState {
  activeGates: {
    id: string;
    name: string;
    pressure: "low" | "medium" | "high";
    flowRate: number; // people per min
    status: "open" | "closed" | "congested";
  }[];
  concessions: {
    id: string;
    name: string;
    type: "food" | "beverage" | "merchandise";
    section: number;
    queueTime: number; // minutes
    status: "clear" | "busy" | "overloaded";
  }[];
  transit: {
    shuttles: { id: string; route: string; active: number; waitTime: number };
    parkingLots: { id: string; occupancy: number; status: string };
    trainStation: { name: string; waitTime: number; congestion: string };
  };
  incidents: {
    id: string;
    title: string;
    type: "security" | "medical" | "congestion" | "maintenance";
    severity: "low" | "medium" | "high";
    location: string;
    lat: number;
    lng: number;
    status: "reported" | "dispatched" | "resolved";
    timestamp: string;
  }[];
  medicalUnits: {
    id: string;
    name: string;
    status: "available" | "busy" | "offline";
    bedsOccupied: number;
    bedsTotal: number;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
  isHighThinking?: boolean;
}

export interface VolunteerTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  section: string;
  status: "pending" | "in-progress" | "completed";
}

export interface StadiumLocation {
  id: string;
  name: string;
  city: string;
  country: "USA" | "Canada" | "Mexico";
  lat: number;
  lng: number;
  capacity: number;
}

export interface OperationalLog {
  id: string;
  stadiumId: string;
  type: "security_alert" | "medical_report" | "maintenance_request" | "general_log";
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  reporterId: string;
  reporterRole: UserRole;
  location: string;
  timestamp: string;
  status: "open" | "investigating" | "resolved";
}

export type AlertIncident = StadiumState["incidents"][number];

export interface AppNotification {
  id: string;
  type: 'emergency' | 'gate' | 'crowd' | 'shuttle' | 'weather';
  message: string;
  timestamp: string;
  isRead: boolean;
  stadiumId?: string;
}

