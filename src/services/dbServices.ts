import { QueryConstraint } from "firebase/firestore";
import { 
  getDocData, 
  setDocData, 
  addDocData, 
  queryCollectionDocs, 
  subscribeCollectionDocs, 
  subscribeDocData, 
  deleteDocData 
} from "../firebase/firestore";
import { 
  UserProfile, 
  Stadium, 
  Match, 
  VolunteerTask, 
  AlertIncident, 
  TransitSchedule, 
  Announcement, 
  CrowdMetrics, 
  ParkingState, 
  SustainabilityMetric,
  OperationalLog
} from "../types";

export const firestoreServices = {
  operations: {
    get: (logId: string) => getDocData<OperationalLog>("operations", logId),
    save: (logId: string, log: Partial<OperationalLog>) => setDocData<OperationalLog>("operations", logId, log),
    add: (log: Omit<OperationalLog, "id">) => addDocData<Omit<OperationalLog, "id">>("operations", log),
    list: (...constraints: QueryConstraint[]) => queryCollectionDocs<OperationalLog>("operations", ...constraints),
    subscribe: (onUpdate: (data: OperationalLog[]) => void, ...constraints: QueryConstraint[]) => subscribeCollectionDocs<OperationalLog>("operations", onUpdate, undefined, ...constraints),
    subscribeDoc: (docId: string, onUpdate: (data: OperationalLog | null) => void) => subscribeDocData<OperationalLog>("operations", docId, onUpdate)
  },
  users: {
    get: (uid: string) => getDocData<UserProfile>("users", uid),
    save: (uid: string, profile: Partial<UserProfile>) => setDocData<UserProfile>("users", uid, profile),
    delete: (uid: string) => deleteDocData("users", uid),
    list: (...constraints: QueryConstraint[]) => queryCollectionDocs<UserProfile>("users", ...constraints),
    subscribe: (onUpdate: (data: UserProfile[]) => void, ...constraints: QueryConstraint[]) => subscribeCollectionDocs<UserProfile>("users", onUpdate, undefined, ...constraints),
    subscribeDoc: (docId: string, onUpdate: (data: UserProfile | null) => void) => subscribeDocData<UserProfile>("users", docId, onUpdate)
  },
  stadiums: {
    get: (stadiumId: string) => getDocData<Stadium>("stadiums", stadiumId),
    save: (stadiumId: string, stadium: Partial<Stadium>) => setDocData<Stadium>("stadiums", stadiumId, stadium),
    list: (...constraints: QueryConstraint[]) => queryCollectionDocs<Stadium>("stadiums", ...constraints),
    subscribe: (onUpdate: (data: Stadium[]) => void, ...constraints: QueryConstraint[]) => subscribeCollectionDocs<Stadium>("stadiums", onUpdate, undefined, ...constraints),
    subscribeDoc: (docId: string, onUpdate: (data: Stadium | null) => void) => subscribeDocData<Stadium>("stadiums", docId, onUpdate)
  },
  matches: {
    get: (matchId: string) => getDocData<Match>("matches", matchId),
    save: (matchId: string, match: Partial<Match>) => setDocData<Match>("matches", matchId, match),
    list: (...constraints: QueryConstraint[]) => queryCollectionDocs<Match>("matches", ...constraints),
    subscribe: (onUpdate: (data: Match[]) => void, ...constraints: QueryConstraint[]) => subscribeCollectionDocs<Match>("matches", onUpdate, undefined, ...constraints),
    subscribeDoc: (docId: string, onUpdate: (data: Match | null) => void) => subscribeDocData<Match>("matches", docId, onUpdate)
  },
  volunteers: {
    get: (taskId: string) => getDocData<VolunteerTask>("volunteers", taskId),
    save: (taskId: string, task: Partial<VolunteerTask>) => setDocData<VolunteerTask>("volunteers", taskId, task),
    add: (task: Omit<VolunteerTask, "id">) => addDocData<Omit<VolunteerTask, "id">>("volunteers", task),
    list: (...constraints: QueryConstraint[]) => queryCollectionDocs<VolunteerTask>("volunteers", ...constraints),
    subscribe: (onUpdate: (data: VolunteerTask[]) => void, ...constraints: QueryConstraint[]) => subscribeCollectionDocs<VolunteerTask>("volunteers", onUpdate, undefined, ...constraints),
    subscribeDoc: (docId: string, onUpdate: (data: VolunteerTask | null) => void) => subscribeDocData<VolunteerTask>("volunteers", docId, onUpdate)
  },
  alerts: {
    get: (alertId: string) => getDocData<AlertIncident>("alerts", alertId),
    save: (alertId: string, alert: Partial<AlertIncident>) => setDocData<AlertIncident>("alerts", alertId, alert),
    add: (alert: Omit<AlertIncident, "id">) => addDocData<Omit<AlertIncident, "id">>("alerts", alert),
    list: (...constraints: QueryConstraint[]) => queryCollectionDocs<AlertIncident>("alerts", ...constraints),
    subscribe: (onUpdate: (data: AlertIncident[]) => void, ...constraints: QueryConstraint[]) => subscribeCollectionDocs<AlertIncident>("alerts", onUpdate, undefined, ...constraints),
    subscribeDoc: (docId: string, onUpdate: (data: AlertIncident | null) => void) => subscribeDocData<AlertIncident>("alerts", docId, onUpdate)
  },
  transport: {
    get: (routeId: string) => getDocData<TransitSchedule>("transport", routeId),
    save: (routeId: string, route: Partial<TransitSchedule>) => setDocData<TransitSchedule>("transport", routeId, route),
    list: (...constraints: QueryConstraint[]) => queryCollectionDocs<TransitSchedule>("transport", ...constraints),
    subscribe: (onUpdate: (data: TransitSchedule[]) => void, ...constraints: QueryConstraint[]) => subscribeCollectionDocs<TransitSchedule>("transport", onUpdate, undefined, ...constraints),
    subscribeDoc: (docId: string, onUpdate: (data: TransitSchedule | null) => void) => subscribeDocData<TransitSchedule>("transport", docId, onUpdate)
  },
  announcements: {
    get: (announcementId: string) => getDocData<Announcement>("announcements", announcementId),
    save: (announcementId: string, announcement: Partial<Announcement>) => setDocData<Announcement>("announcements", announcementId, announcement),
    add: (announcement: Omit<Announcement, "id">) => addDocData<Omit<Announcement, "id">>("announcements", announcement),
    list: (...constraints: QueryConstraint[]) => queryCollectionDocs<Announcement>("announcements", ...constraints),
    subscribe: (onUpdate: (data: Announcement[]) => void, ...constraints: QueryConstraint[]) => subscribeCollectionDocs<Announcement>("announcements", onUpdate, undefined, ...constraints),
    subscribeDoc: (docId: string, onUpdate: (data: Announcement | null) => void) => subscribeDocData<Announcement>("announcements", docId, onUpdate)
  },
  crowd: {
    get: (metricId: string) => getDocData<CrowdMetrics>("crowd", metricId),
    save: (metricId: string, metric: Partial<CrowdMetrics>) => setDocData<CrowdMetrics>("crowd", metricId, metric),
    list: (...constraints: QueryConstraint[]) => queryCollectionDocs<CrowdMetrics>("crowd", ...constraints),
    subscribe: (onUpdate: (data: CrowdMetrics[]) => void, ...constraints: QueryConstraint[]) => subscribeCollectionDocs<CrowdMetrics>("crowd", onUpdate, undefined, ...constraints),
    subscribeDoc: (docId: string, onUpdate: (data: CrowdMetrics | null) => void) => subscribeDocData<CrowdMetrics>("crowd", docId, onUpdate)
  },
  parking: {
    get: (lotId: string) => getDocData<ParkingState>("parking", lotId),
    save: (lotId: string, lot: Partial<ParkingState>) => setDocData<ParkingState>("parking", lotId, lot),
    list: (...constraints: QueryConstraint[]) => queryCollectionDocs<ParkingState>("parking", ...constraints),
    subscribe: (onUpdate: (data: ParkingState[]) => void, ...constraints: QueryConstraint[]) => subscribeCollectionDocs<ParkingState>("parking", onUpdate, undefined, ...constraints),
    subscribeDoc: (docId: string, onUpdate: (data: ParkingState | null) => void) => subscribeDocData<ParkingState>("parking", docId, onUpdate)
  },
  sustainability: {
    get: (metricId: string) => getDocData<SustainabilityMetric>("sustainability", metricId),
    save: (metricId: string, metric: Partial<SustainabilityMetric>) => setDocData<SustainabilityMetric>("sustainability", metricId, metric),
    list: (...constraints: QueryConstraint[]) => queryCollectionDocs<SustainabilityMetric>("sustainability", ...constraints),
    subscribe: (onUpdate: (data: SustainabilityMetric[]) => void, ...constraints: QueryConstraint[]) => subscribeCollectionDocs<SustainabilityMetric>("sustainability", onUpdate, undefined, ...constraints),
    subscribeDoc: (docId: string, onUpdate: (data: SustainabilityMetric | null) => void) => subscribeDocData<SustainabilityMetric>("sustainability", docId, onUpdate)
  }
};
