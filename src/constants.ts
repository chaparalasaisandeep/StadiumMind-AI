import { StadiumLocation, StadiumState, VolunteerTask } from "./types";

export const STADIUMS: StadiumLocation[] = [
  {
    id: "azteca",
    name: "Estadio Azteca",
    city: "Mexico City",
    country: "Mexico",
    lat: 19.3029,
    lng: -99.1505,
    capacity: 87523
  },
  {
    id: "sofi",
    name: "SoFi Stadium",
    city: "Los Angeles",
    country: "USA",
    lat: 33.9534,
    lng: -118.3390,
    capacity: 70240
  },
  {
    id: "metlife",
    name: "MetLife Stadium",
    city: "New York / New Jersey",
    country: "USA",
    lat: 40.8128,
    lng: -74.0742,
    capacity: 82500
  },
  {
    id: "bcplace",
    name: "BC Place",
    city: "Vancouver",
    country: "Canada",
    lat: 49.2768,
    lng: -123.1120,
    capacity: 54500
  }
];

export const INITIAL_STADIUM_STATE: StadiumState = {
  activeGates: [
    { id: "gate_a", name: "Gate A (Main North Entrance)", pressure: "high", flowRate: 240, status: "congested" },
    { id: "gate_b", name: "Gate B (East Tram Link)", pressure: "medium", flowRate: 150, status: "open" },
    { id: "gate_c", name: "Gate C (VIP/Media West)", pressure: "low", flowRate: 45, status: "open" },
    { id: "gate_d", name: "Gate D (South Accessible Link)", pressure: "medium", flowRate: 110, status: "open" }
  ],
  concessions: [
    { id: "conc_1", name: "Cantina Azteca (Tacos & Beer)", type: "food", section: 104, queueTime: 22, status: "busy" },
    { id: "conc_2", name: "Stars & Stripes Brews", type: "beverage", section: 112, queueTime: 8, status: "clear" },
    { id: "conc_3", name: "Maple Syrup Treats", type: "food", section: 221, queueTime: 35, status: "overloaded" },
    { id: "conc_4", name: "Official FIFA Fan Shop", type: "merchandise", section: 101, queueTime: 18, status: "busy" },
    { id: "conc_5", name: "Pure Water Express", type: "beverage", section: 205, queueTime: 3, status: "clear" }
  ],
  transit: {
    shuttles: { id: "shut_1", route: "Express Metro Link", active: 12, waitTime: 6 },
    parkingLots: { id: "park_1", occupancy: 92, status: "Near Capacity" },
    trainStation: { name: "Stadium Central Rail", waitTime: 14, congestion: "High" }
  },
  incidents: [
    {
      id: "inc_1",
      title: "Gate A Crowd Congestion Spike",
      type: "congestion",
      severity: "high",
      location: "Gate A Perimeter",
      lat: 40.8135,
      lng: -74.0745,
      status: "reported",
      timestamp: "01:32"
    },
    {
      id: "inc_2",
      title: "Medical assistance needed for heat exhaustion",
      type: "medical",
      severity: "medium",
      location: "Section 104 Row M",
      lat: 40.8122,
      lng: -74.0732,
      status: "dispatched",
      timestamp: "01:38"
    },
    {
      id: "inc_3",
      title: "Elevator E8 Malfunction - Needs technician",
      type: "maintenance",
      severity: "low",
      location: "Section 221 Elevators",
      lat: 40.8126,
      lng: -74.0751,
      status: "reported",
      timestamp: "01:41"
    }
  ],
  medicalUnits: [
    { id: "med_1", name: "West Triage Unit (Main)", status: "busy", bedsOccupied: 14, bedsTotal: 15 },
    { id: "med_2", name: "East First Aid Station", status: "available", bedsOccupied: 3, bedsTotal: 8 },
    { id: "med_3", name: "North Ambulatory Center", status: "available", bedsOccupied: 1, bedsTotal: 6 }
  ]
};

export const DEFAULT_VOLUNTEER_TASKS: VolunteerTask[] = [
  {
    id: "task_1",
    title: "Guide accessible guests from Section 101 to Gate D Elevator",
    description: "Wheelchair escort requested for an elderly fan and their family.",
    assignedTo: "Volunteer #14",
    section: "101",
    status: "in-progress"
  },
  {
    id: "task_2",
    title: "Distribute water bottles around Cantina Azteca (Section 104)",
    description: "Concession queue is long. Distribute free hydration packs to queueing guests.",
    assignedTo: "Volunteer #09",
    section: "104",
    status: "pending"
  },
  {
    id: "task_3",
    title: "Verify accessibility ramp R4 is free of obstructions",
    description: "Standard security and flow check around the main South Accessible Ramp.",
    assignedTo: "Unassigned",
    section: "Ramp 4",
    status: "pending"
  }
];
