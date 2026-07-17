import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LandingPage from "../../src/pages/LandingPage";
import AuthPages from "../../src/pages/AuthPages";
import NotificationCenter from "../../src/components/NotificationCenter";
import OperationsSimulator from "../../src/components/OperationsSimulator";
import OperationalMetrics from "../../src/components/OperationalMetrics";
import StadiumMap from "../../src/components/StadiumMap";
import RouteLayer from "../../src/components/RouteLayer";
import { AuthProvider } from "../../src/contexts/AuthContext";
import { StadiumLocation, StadiumState, AppNotification } from "../../src/types";

const mockStadium: StadiumLocation = {
  id: "sofi",
  name: "SoFi Stadium",
  city: "Los Angeles",
  country: "USA",
  lat: 33.9534,
  lng: -118.339,
  capacity: 70240
};

const mockStadiumState: StadiumState = {
  activeGates: [
    { id: "gate_a", name: "Gate A", pressure: "high", flowRate: 240, status: "congested" },
    { id: "gate_b", name: "Gate B", pressure: "medium", flowRate: 150, status: "open" }
  ],
  concessions: [
    { id: "conc_1", name: "Cantina Azteca", type: "food", section: 104, queueTime: 22, status: "busy" }
  ],
  transit: {
    shuttles: { id: "shut_1", route: "Express Metro", active: 12, waitTime: 6 },
    parkingLots: { id: "park_1", occupancy: 92, status: "Near Capacity" },
    trainStation: { name: "Central Rail", waitTime: 14, congestion: "High" }
  },
  incidents: [
    { id: "inc_1", title: "Crowd Surge", type: "congestion", severity: "high", location: "Gate A", lat: 33.954, lng: -118.34, status: "reported", timestamp: "01:32" }
  ],
  medicalUnits: []
};

const mockNotifications: AppNotification[] = [
  { id: "notif-1", type: "emergency", message: "Medical incident reported", timestamp: "12:00", isRead: false, stadiumId: "sofi" },
  { id: "notif-2", type: "shuttle", message: "Shuttle is delayed", timestamp: "12:05", isRead: true, stadiumId: "sofi" },
  { id: "notif-3", type: "gate", message: "Gate closed", timestamp: "12:06", isRead: false, stadiumId: "sofi" },
  { id: "notif-4", type: "crowd", message: "Crowd surge Section 4", timestamp: "12:10", isRead: false, stadiumId: "sofi" },
  { id: "notif-5", type: "weather", message: "Rain expected", timestamp: "12:15", isRead: false, stadiumId: "sofi" },
];

describe("StadiumMind Core Component Testing Suite", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe("LandingPage Component", () => {
    it("renders landing text and CTA buttons", () => {
      const handleGetStarted = vi.fn();
      const handleGoToAuth = vi.fn();

      render(<LandingPage onGetStarted={handleGetStarted} onGoToAuth={handleGoToAuth} />);

      expect(screen.getAllByText("StadiumMind AI")[0]).toBeInTheDocument();
      expect(screen.getByText("Sign In")).toBeInTheDocument();
      
      const buttons = screen.getAllByRole("button");
      const signInBtn = buttons.find(btn => btn.textContent === "Sign In");
      expect(signInBtn).toBeDefined();

      fireEvent.click(signInBtn!);
      expect(handleGoToAuth).toHaveBeenCalled();
    });
  });

  describe("AuthPages Component (Highly Interactive)", () => {
    it("renders login forms by default, switches tabs, fills out inputs, and handles error feedback", async () => {
      const handleSuccess = vi.fn();
      const handleBack = vi.fn();

      render(
        <AuthProvider>
          <AuthPages onAuthSuccess={handleSuccess} onBackToLanding={handleBack} />
        </AuthProvider>
      );

      // Back to Landing
      const backBtn = screen.getByText("← Back to Landing");
      fireEvent.click(backBtn);
      expect(handleBack).toHaveBeenCalled();

      // Sign In page checks
      expect(screen.getAllByText("StadiumMind AI")[0]).toBeInTheDocument();

      // Switch to Register
      const registerTab = screen.getByText("Register Account");
      fireEvent.click(registerTab);
      expect(screen.getByText("FULL NAME")).toBeInTheDocument();

      // Back to Sign In
      const signInTab = screen.getByText("Sign In");
      fireEvent.click(signInTab);
      expect(screen.getByText("SYSTEM ASSIGNED ROLE")).toBeInTheDocument();

      // Submit empty login to trigger validation warnings (handled by react-hook-form)
      const submitBtn = screen.getByText("Sign In to Terminal");
      fireEvent.click(submitBtn);

      // Click Forgot Password link
      const forgotLink = screen.getByText("Forgot Password?");
      fireEvent.click(forgotLink);
      expect(screen.getByText("Transmit Reset Coordinates")).toBeInTheDocument();

      // Input email on recovery page and submit
      const recoveryEmailInput = screen.getByPlaceholderText("name@host.com");
      fireEvent.change(recoveryEmailInput, { target: { value: "recover@test.com" } });
      const recoverySubmit = screen.getByText("Transmit Reset Coordinates");
      fireEvent.click(recoverySubmit);

      await waitFor(() => {
        expect(screen.getByText("A password recovery link has been dispatched to your email address.")).toBeInTheDocument();
      });

      // Navigate back to login from recovery page
      const cancelResetBtn = screen.getByText("Back to Sign In");
      fireEvent.click(cancelResetBtn);
      expect(screen.getByText("Sign In to Terminal")).toBeInTheDocument();

      // Sign in with Google SSO
      const googleBtn = screen.getByText("Sign In with Google");
      fireEvent.click(googleBtn);
      await waitFor(() => {
        expect(handleSuccess).toHaveBeenCalled();
      });
    });

    it("allows filling out login forms and submitting successfully", async () => {
      const handleSuccess = vi.fn();
      render(
        <AuthProvider>
          <AuthPages onAuthSuccess={handleSuccess} onBackToLanding={vi.fn()} />
        </AuthProvider>
      );

      const emailInput = screen.getByPlaceholderText("name@host.com");
      const passwordInput = screen.getByPlaceholderText("••••••••");

      fireEvent.change(emailInput, { target: { value: "fan@test.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });

      const submitBtn = screen.getByText("Sign In to Terminal");
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(handleSuccess).toHaveBeenCalled();
      });
    });

    it("allows filling out registration forms and submitting successfully", async () => {
      const handleSuccess = vi.fn();
      render(
        <AuthProvider>
          <AuthPages onAuthSuccess={handleSuccess} onBackToLanding={vi.fn()} />
        </AuthProvider>
      );

      const registerTab = screen.getByText("Register Account");
      fireEvent.click(registerTab);

      const nameInput = screen.getByPlaceholderText("Jane Doe");
      const emailInput = screen.getByPlaceholderText("name@host.com");
      const passwordInput = screen.getByPlaceholderText("••••••••");

      fireEvent.change(nameInput, { target: { value: "Agent Smith" } });
      fireEvent.change(emailInput, { target: { value: "smith@test.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });

      const submitBtn = screen.getByText("Request Authorization");
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(handleSuccess).toHaveBeenCalled();
      });
    });
  });

  describe("NotificationCenter Component", () => {
    it("renders unread badge counts, allows filters, collapsing, and triggers callbacks on actions", () => {
      const dismissMock = vi.fn();
      const markAsReadMock = vi.fn();

      render(
        <NotificationCenter 
          notifications={mockNotifications}
          onDismiss={dismissMock}
          onDismissAll={vi.fn()}
          onMarkAsRead={markAsReadMock}
          onMarkAllAsRead={vi.fn()}
        />
      );

      expect(screen.getByText("Live Dispatch Notification Hub")).toBeInTheDocument();
      
      const unreadAlert = screen.getByText("Medical incident reported");
      expect(unreadAlert).toBeInTheDocument();

      // Click Collapse button
      const collapseBtn = screen.getByText("Collapse");
      fireEvent.click(collapseBtn);
      expect(screen.queryByText("Medical incident reported")).toBeNull();

      // Click Expand button
      const expandBtn = screen.getByText("Expand");
      fireEvent.click(expandBtn);
      expect(screen.getByText("Medical incident reported")).toBeInTheDocument();

      // Click Filter by "emergency" (Emergency)
      const emergencyFilter = screen.getAllByText("Emergency")[0];
      fireEvent.click(emergencyFilter);
      expect(screen.getByText("Medical incident reported")).toBeInTheDocument();
      expect(screen.queryByText("Shuttle is delayed")).toBeNull();

      // Click Filter by "all" (All)
      const allFilter = screen.getAllByText("All")[0];
      fireEvent.click(allFilter);
      expect(screen.getByText("Medical incident reported")).toBeInTheDocument();

      const markReadButtons = screen.getAllByTitle("Mark as Read");
      expect(markReadButtons.length).toBeGreaterThan(0);
      fireEvent.click(markReadButtons[0]);
      expect(markAsReadMock).toHaveBeenCalledWith("notif-1");

      const dismissButtons = screen.getAllByTitle("Dismiss Alert");
      fireEvent.click(dismissButtons[0]);
      expect(dismissMock).toHaveBeenCalledWith("notif-1");
    });
  });

  describe("OperationsSimulator Component (Comprehensive Triggers)", () => {
    it("guards control actions under lock for non-admin Fan role", () => {
      const triggerMock = vi.fn();
      const changeRoleMock = vi.fn();

      render(
        <OperationsSimulator 
          currentRole="Fan"
          stadium={mockStadium}
          onSimulationTriggered={triggerMock}
          onResetSimulation={vi.fn()}
          onChangeRole={changeRoleMock}
        />
      );

      expect(screen.getByText("Administrator Access Restricton")).toBeInTheDocument();
      const switchBtn = screen.getByText("Switch to Admin Role");
      fireEvent.click(switchBtn);
      expect(changeRoleMock).toHaveBeenCalledWith("Admin");
    });

    it("allows triggering all simulation cases and resetting as Admin", async () => {
      const triggerMock = vi.fn(() => Promise.resolve());
      const resetMock = vi.fn(() => Promise.resolve());

      render(
        <OperationsSimulator 
          currentRole="Admin"
          stadium={mockStadium}
          onSimulationTriggered={triggerMock}
          onResetSimulation={resetMock}
          onChangeRole={vi.fn()}
        />
      );

      // Verify all buttons exist
      const crowdSurgeBtn = screen.getByText("Crowd Surge");
      const parkingFullBtn = screen.getByText("Parking Full");
      const gateClosureBtn = screen.getByText("Gate Closure");
      const medicalAlertBtn = screen.getByText("Medical Alert");
      const securityThreatBtn = screen.getByText("Security Threat");
      const weatherThreatBtn = screen.getByText("Weather Threat");
      const shuttleDelayBtn = screen.getByText("Shuttle Delay");
      const resetSimulationBtn = screen.getByText("Reset Baseline");

      // Click each button to trigger firestore updates & notifications
      fireEvent.click(crowdSurgeBtn);
      await waitFor(() => expect(triggerMock).toHaveBeenCalled());

      fireEvent.click(parkingFullBtn);
      await waitFor(() => expect(triggerMock).toHaveBeenCalledTimes(2));

      fireEvent.click(gateClosureBtn);
      await waitFor(() => expect(triggerMock).toHaveBeenCalledTimes(3));

      fireEvent.click(medicalAlertBtn);
      await waitFor(() => expect(triggerMock).toHaveBeenCalledTimes(4));

      fireEvent.click(securityThreatBtn);
      await waitFor(() => expect(triggerMock).toHaveBeenCalledTimes(5));

      fireEvent.click(weatherThreatBtn);
      await waitFor(() => expect(triggerMock).toHaveBeenCalledTimes(6));

      fireEvent.click(shuttleDelayBtn);
      await waitFor(() => expect(triggerMock).toHaveBeenCalledTimes(7));

      // Reset
      fireEvent.click(resetSimulationBtn);
      await waitFor(() => expect(resetMock).toHaveBeenCalled());
    });
  });

  describe("OperationalMetrics Component", () => {
    it("renders Recharts metric blocks", () => {
      render(<OperationalMetrics stadiumState={mockStadiumState} />);
      expect(screen.getByText("Live Crowd & Queuing Telemetry")).toBeInTheDocument();
      expect(screen.getAllByTestId("bar-chart")[0]).toBeInTheDocument();
      expect(screen.getAllByTestId("area-chart")[0]).toBeInTheDocument();
    });
  });

  describe("StadiumMap Component & Routing Layout Paths", () => {
    it("renders map container, heatmaps, and lets user select markers and dispatch responders", async () => {
      const dispatchMock = vi.fn();
      render(<StadiumMap stadium={mockStadium} stadiumState={mockStadiumState} onSelectIncident={dispatchMock} />);
      
      expect(screen.getByTestId("map-container")).toBeInTheDocument();
      expect(screen.getByTestId("tile-layer")).toBeInTheDocument();

      // Find markers by their custom mocked elements
      const markerElements = screen.getAllByTestId("marker");
      expect(markerElements.length).toBeGreaterThan(0);

      // Trigger a click on the first marker element to set active pin and open routing
      fireEvent.click(markerElements[0]);

      // When marker is clicked, RouteLayer will be rendered (routePositions.length > 0)
      // Because we mocked Leaflet Polyline and Popup, we can verify popup content triggers
      const dispatchBtn = screen.getByText("Dispatch Responders");
      expect(dispatchBtn).toBeInTheDocument();

      fireEvent.click(dispatchBtn);
      expect(dispatchMock).toHaveBeenCalledWith("inc_1");
    });
  });

  describe("RouteLayer Component Direct Tests", () => {
    it("returns null when positions are empty", () => {
      const { container } = render(<RouteLayer positions={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it("renders Polyline with positions correctly", () => {
      render(<RouteLayer positions={[[33, -118], [34, -117]]} />);
      expect(screen.getByTestId("polyline")).toBeInTheDocument();
    });
  });
});
