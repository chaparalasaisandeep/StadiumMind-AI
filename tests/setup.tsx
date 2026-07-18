import React from "react";
import { vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";

// 1. Mock fetch globally
global.fetch = vi.fn();

// 2. Mock Firebase Configuration and SDKs
vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => [{}]),
  getApp: vi.fn(() => ({})),
}));

// Stateful variables for mocked Firebase Auth and Firestore database
let currentFirebaseUser: any = null;
let authStateListener: any = null;
let mockDatabase: Record<string, any> = {};

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({
    get currentUser() { return currentFirebaseUser; }
  })),
  connectAuthEmulator: vi.fn(),
  setPersistence: vi.fn(() => Promise.resolve()),
  browserLocalPersistence: "local",
  signInWithEmailAndPassword: vi.fn((auth, email, password) => {
    currentFirebaseUser = { 
      uid: "user-123", 
      email, 
      displayName: email.split("@")[0].toUpperCase(),
      metadata: { creationTime: new Date().toISOString() } 
    };
    if (authStateListener) authStateListener(currentFirebaseUser);
    return Promise.resolve({ user: currentFirebaseUser });
  }),
  createUserWithEmailAndPassword: vi.fn((auth, email, password) => {
    currentFirebaseUser = { 
      uid: "user-123", 
      email, 
      displayName: email.split("@")[0].toUpperCase(),
      metadata: { creationTime: new Date().toISOString() } 
    };
    if (authStateListener) authStateListener(currentFirebaseUser);
    return Promise.resolve({ user: currentFirebaseUser });
  }),
  signOut: vi.fn(() => {
    currentFirebaseUser = null;
    if (authStateListener) authStateListener(null);
    return Promise.resolve();
  }),
  onAuthStateChanged: vi.fn((auth, cb) => {
    authStateListener = cb;
    // Check if there is a cached session and restore it to current mock user
    const cached = typeof window !== "undefined" && localStorage.getItem("stad_user_session");
    if (cached && !currentFirebaseUser) {
      try {
        const parsed = JSON.parse(cached);
        currentFirebaseUser = {
          uid: parsed.uid || "user-123",
          email: parsed.email || "cached@test.com",
          displayName: parsed.displayName || "Cached User",
          metadata: { creationTime: new Date().toISOString() }
        };
        mockDatabase[`users/${currentFirebaseUser.uid}`] = parsed;
      } catch (e) {}
    }
    cb(currentFirebaseUser);
    return () => {
      authStateListener = null;
    };
  }),
  signInWithPopup: vi.fn(() => {
    currentFirebaseUser = { 
      uid: "user-123", 
      email: "google@test.com", 
      displayName: "Google User",
      metadata: { creationTime: new Date().toISOString() } 
    };
    if (authStateListener) authStateListener(currentFirebaseUser);
    return Promise.resolve({ user: currentFirebaseUser });
  }),
  GoogleAuthProvider: class {},
  sendPasswordResetEmail: vi.fn(() => Promise.resolve()),
}));

// We need to mock all the firestore functions used in src/firebase/firestore.ts
vi.mock("firebase/firestore", () => {
  return {
    getFirestore: vi.fn(() => ({})),
    doc: vi.fn((db, col, id) => `${col}/${id}`),
    getDoc: vi.fn((docRef) => {
      let data = mockDatabase[docRef];
      if (data === undefined) {
        if (typeof docRef === "string" && docRef.startsWith("users/")) {
          // Dynamic profile mock fallback based on email
          const email = currentFirebaseUser?.email || "test@example.com";
          let role = "Fan";
          let name = "Test User";
          if (email.includes("admin")) {
            role = "Admin";
            name = "Admin";
          } else if (email.includes("organizer")) {
            role = "Organizer";
            name = "Match Organizer";
          } else if (email.includes("volunteer")) {
            role = "Volunteer";
            name = "Volunteer";
          } else if (email.includes("sec")) {
            role = "Security";
            name = "Security";
          }
          data = {
            uid: "user-123",
            email,
            displayName: name,
            role,
            assignedSector: "Sector North-Alpha",
            createdAt: new Date().toISOString()
          };
        } else {
          // General unit test fallback mock
          data = { name: "Test" };
        }
      }
      return Promise.resolve({
        exists: () => data !== null,
        id: typeof docRef === "string" && docRef.startsWith("users/") ? docRef.split("/")[1] : "mock-id",
        data: () => data,
      });
    }),
    setDoc: vi.fn((docRef, data, options) => {
      if (options?.merge) {
        mockDatabase[docRef] = { ...mockDatabase[docRef], ...data };
      } else {
        mockDatabase[docRef] = data;
      }
      return Promise.resolve();
    }),
    addDoc: vi.fn((colRef, data) => {
      const id = "new-id";
      mockDatabase[`${colRef}/${id}`] = data;
      return Promise.resolve({ id });
    }),
    getDocs: vi.fn((queryRef) => {
      const colName = queryRef;
      let docs = Object.entries(mockDatabase)
        .filter(([key]) => key.startsWith(`${colName}/`))
        .map(([key, value]) => ({
          id: key.split("/")[1],
          data: () => value,
        }));
      if (docs.length === 0) {
        // Fallback for general unit tests (stadiums, matches, users list)
        docs = [{
          id: "mock-id",
          data: () => ({ name: "Test" })
        }];
      }
      return Promise.resolve({
        forEach: (cb: any) => docs.forEach(cb),
      });
    }),
    query: vi.fn((colRef) => colRef),
    collection: vi.fn((db, name) => name),
    deleteDoc: vi.fn((docRef) => {
      delete mockDatabase[docRef];
      return Promise.resolve();
    }),
    enableIndexedDbPersistence: vi.fn(() => Promise.resolve()),
  };
});

// Mock react-leaflet and leaflet
vi.mock("leaflet", () => ({
  default: {
    Icon: vi.fn(),
    divIcon: vi.fn(),
  },
  Icon: vi.fn(),
  divIcon: vi.fn(),
}));

vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children, position, eventHandlers }: any) => <div data-testid="marker" data-position={JSON.stringify(position)} onClick={eventHandlers?.click}>{children}</div>,
  Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
  Polyline: ({ positions }: any) => <div data-testid="polyline" data-positions={JSON.stringify(positions)} />,
  Circle: ({ center, radius }: any) => <div data-testid="circle" data-center={JSON.stringify(center)} data-radius={radius} />,
  useMap: () => ({
    setView: vi.fn(),
    flyTo: vi.fn(),
  }),
}));

// Mock Recharts
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="xaxis" />,
  YAxis: () => <div data-testid="yaxis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

// Mock framer-motion / motion/react to prevent layout/animation issues
vi.mock("motion/react", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
    nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
    ul: ({ children, ...props }: any) => <ul {...props}>{children}</ul>,
    li: ({ children, ...props }: any) => <li {...props}>{children}</li>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock ResizeObserver for Recharts / maps
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Clear all mock history, database states, and local storage sessions before each test runs
beforeEach(() => {
  currentFirebaseUser = null;
  authStateListener = null;
  mockDatabase = {};
  if (typeof window !== "undefined") {
    localStorage.clear();
  }
  vi.clearAllMocks();
});
