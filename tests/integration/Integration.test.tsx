import React, { useState } from "react";
import { describe, it, expect, vi, Mock } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../../src/contexts/AuthContext";
import OperationsSimulator from "../../src/components/OperationsSimulator";
import NotificationCenter from "../../src/components/NotificationCenter";
import { firestoreServices } from "../../src/firebase/firestore";
import { StadiumLocation, StadiumState, AppNotification } from "../../src/types";

// Setup mocks
const mockStadium: StadiumLocation = {
  id: "azteca",
  name: "Estadio Azteca",
  city: "Mexico City",
  country: "Mexico",
  lat: 19.3029,
  lng: -99.1505,
  capacity: 87523
};

describe("StadiumMind Full Integration & System-wide Flows", () => {
  
  it("Integrates login, role updates, and restricted admin panel rendering", async () => {
    // 1. Render custom hook consumer with provider to test integrated session lifecycle
    const InnerConsumer = () => {
      const { user, login, switchRole } = useAuth();
      return (
        <div>
          <span data-testid="user-role">{user ? user.role : "Anonymous"}</span>
          <button onClick={() => login("organizer@fifa.org", "secure123", "Organizer")}>Sign In</button>
          <button onClick={() => switchRole("Admin")}>Go Admin</button>
        </div>
      );
    };

    render(
      <AuthProvider>
        <InnerConsumer />
      </AuthProvider>
    );

    // Baseline anonymous
    expect(screen.getByTestId("user-role").textContent).toBe("Anonymous");

    // Press Sign In - offline fallback assigns 'Organizer' role
    await act(async () => {
      fireEvent.click(screen.getByText("Sign In"));
    });
    expect(screen.getByTestId("user-role").textContent).toBe("Organizer");

    // Press Go Admin - changes role to 'Admin'
    await act(async () => {
      fireEvent.click(screen.getByText("Go Admin"));
    });
    expect(screen.getByTestId("user-role").textContent).toBe("Admin");
  });

  it("Integrates Operations Stress Injection with Firestore saves & Live Notification Hub feeds", async () => {
    const handleSimulationTriggered = vi.fn();
    const handleResetSimulation = vi.fn();

    // Mock firestore services save endpoint
    const saveMock = vi.spyOn(firestoreServices.crowd, "save");

    render(
      <OperationsSimulator 
        currentRole="Admin"
        stadium={mockStadium}
        onSimulationTriggered={handleSimulationTriggered}
        onResetSimulation={handleResetSimulation}
        onChangeRole={vi.fn()}
      />
    );

    // Trigger simulation click (Gate Crowd surge)
    const crowdBtn = screen.getByText("Crowd Surge");
    expect(crowdBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(crowdBtn);
    });

    // Expect firestoreServices.crowd.save to have been called with correct stadium details
    expect(saveMock).toHaveBeenCalled();
    const saveArgs = saveMock.mock.calls[0];
    expect(saveArgs[0]).toBe(`gate_a_${mockStadium.id}`);
    expect(saveArgs[1]).toMatchObject({
      stadiumId: mockStadium.id,
      pressure: "high",
      flowRate: 345
    });

    // Expect simulation triggered callback to have been fired to propagate notification to dashboard
    expect(handleSimulationTriggered).toHaveBeenCalled();
    const triggerArgs = handleSimulationTriggered.mock.calls[0];
    expect(triggerArgs[0]).toBeDefined(); // AppNotification
    expect(triggerArgs[0].type).toBe("crowd");
    expect(triggerArgs[0].stadiumId).toBe(mockStadium.id);
  });
  
  it("Integrates multiple notifications updating in the dispatch hub upon dismiss/read triggers", async () => {
    const TestDashboardLayout = () => {
      const [notifications, setNotifications] = useState<AppNotification[]>([
        { id: "notif-1", type: "emergency", message: "Medical incident Section 104", timestamp: "12:00", isRead: false, stadiumId: "azteca" },
        { id: "notif-2", type: "gate", message: "Gate B turnstiles closed", timestamp: "12:02", isRead: false, stadiumId: "azteca" }
      ]);

      const handleDismiss = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      };

      const handleMarkAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      };

      return (
        <NotificationCenter 
          notifications={notifications}
          onDismiss={handleDismiss}
          onDismissAll={() => setNotifications([])}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
        />
      );
    };

    render(<TestDashboardLayout />);

    expect(screen.getByText("Live Dispatch Notification Hub")).toBeInTheDocument();
    expect(screen.getByText("Medical incident Section 104")).toBeInTheDocument();
    expect(screen.getByText("Gate B turnstiles closed")).toBeInTheDocument();

    // Click 'Mark as Read' on notification #1
    const markReadButtons = screen.getAllByTitle("Mark as Read");
    expect(markReadButtons.length).toBe(2);

    await act(async () => {
      fireEvent.click(markReadButtons[0]);
    });

    // Verify it is still in document (now has been marked as read)
    expect(screen.getByText("Medical incident Section 104")).toBeInTheDocument();

    // Dismiss notification #2 (Gate B turnstiles closed)
    const dismissButtons = screen.getAllByTitle("Dismiss Alert");
    await act(async () => {
      fireEvent.click(dismissButtons[1]);
    });

    // Verify Gate B alert is completely removed from document
    expect(screen.queryByText("Gate B turnstiles closed")).toBeNull();
  });
});
