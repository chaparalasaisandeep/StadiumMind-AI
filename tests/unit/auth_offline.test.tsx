import { describe, it, expect, vi } from "vitest";

// Mock auth and config modules to return null for offline pathways
vi.mock("../../src/firebase/auth", () => ({
  auth: null,
  default: null,
}));

vi.mock("../../src/firebase/config", () => ({
  firebaseApp: null,
}));

vi.mock("../../src/firebase/firestore", () => ({
  firestore: null,
  default: null,
  firestoreServices: {
    users: {
      get: vi.fn(),
      save: vi.fn(),
    }
  }
}));

import React from "react";
import { renderHook, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../../src/contexts/AuthContext";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe("AuthContext Offline Fallbacks", () => {
  it("rejection with proper offline warning when loginWithGoogle is triggered", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await expect(
      act(async () => {
        await result.current.loginWithGoogle("Fan");
      })
    ).rejects.toThrow("Google Authentication requires live active cloud provisioning.");
  });

  it("rejection with proper offline warning when resetPassword is triggered", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await expect(
      act(async () => {
        await result.current.resetPassword("test@test.com");
      })
    ).rejects.toThrow("Offline reset: Safe bypass activated.");
  });
});
