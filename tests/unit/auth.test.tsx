import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../../src/contexts/AuthContext";
import * as firebaseAuth from "firebase/auth";
import * as firebaseFirestore from "firebase/firestore";

// Simple helper component to wrap our hooks
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe("Authentication Utilities & Hooks (useAuth) - Comprehensive Coverage Suite", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("throws error when useAuth is consumed outside AuthProvider", () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      "useAuth must be used inside an AuthProvider"
    );
  });

  it("loads fallback session from localStorage when Firebase is not active", async () => {
    const mockUser = {
      uid: "cached-user-1",
      email: "cache@test.com",
      displayName: "Cached User",
      role: "Volunteer" as const
    };
    localStorage.setItem("stad_user_session", JSON.stringify(mockUser));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeDefined();
    expect(result.current.user?.displayName).toBe("Cached User");
    expect(result.current.user?.role).toBe("Volunteer");

    localStorage.removeItem("stad_user_session");
  });

  it("handles offline login fallback flawlessly", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login("fan@fifa.org", "secure123", "Fan");
    });

    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.email).toBe("fan@fifa.org");
    expect(result.current.user?.role).toBe("Fan");
  });

  it("handles offline signup fallback correctly", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signup("organizer@fifa.org", "Match Organizer", "secure123", "Organizer");
    });

    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.displayName).toBe("Match Organizer");
    expect(result.current.user?.role).toBe("Organizer");
  });

  it("handles role switching in real-time and handles security rules warning gracefully", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login("sec@fifa.org", "secure123", "Security");
    });

    expect(result.current.user?.role).toBe("Security");

    // Spy on console.warn
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await act(async () => {
      await result.current.switchRole("Admin");
    });

    expect(result.current.user?.role).toBe("Admin");
    warnSpy.mockRestore();
  });

  it("handles logout and clears storage session", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login("admin@fifa.org", "secure123", "Admin");
    });

    expect(result.current.user).not.toBeNull();

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem("stad_user_session")).toBeNull();
  });

  it("throws error when login is attempted without password", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await expect(
      act(async () => {
        await result.current.login("admin@fifa.org", "", "Admin");
      })
    ).rejects.toThrow("Password field is required for standard terminal login.");
  });

  it("throws error when signup is attempted without password", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await expect(
      act(async () => {
        await result.current.signup("admin@fifa.org", "Admin Name", "", "Admin");
      })
    ).rejects.toThrow("A passcode is required to generate system authorization keys.");
  });

  it("handles firebase signInWithEmailAndPassword error states nicely", async () => {
    vi.spyOn(firebaseAuth, "signInWithEmailAndPassword").mockRejectedValueOnce({
      code: "auth/invalid-credential",
      message: "firebase credential error"
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await expect(
      act(async () => {
        await result.current.login("admin@fifa.org", "bad_pass", "Admin");
      })
    ).rejects.toThrow("Incorrect email address or security passcode.");

    vi.spyOn(firebaseAuth, "signInWithEmailAndPassword").mockRejectedValueOnce({
      code: "auth/user-not-found",
      message: "no user"
    });
    await expect(
      act(async () => {
        await result.current.login("unknown@fifa.org", "pass123", "Admin");
      })
    ).rejects.toThrow("No terminal clearance found for this email address.");

    vi.spyOn(firebaseAuth, "signInWithEmailAndPassword").mockRejectedValueOnce({
      code: "auth/invalid-email",
      message: "bad email structure"
    });
    await expect(
      act(async () => {
        await result.current.login("unknown", "pass123", "Admin");
      })
    ).rejects.toThrow("The entered email address layout is invalid.");

    vi.spyOn(firebaseAuth, "signInWithEmailAndPassword").mockRejectedValueOnce({
      code: "other-error",
      message: "Something went wrong"
    });
    await expect(
      act(async () => {
        await result.current.login("unknown@test.com", "pass123", "Admin");
      })
    ).rejects.toThrow("Something went wrong");
  });

  it("handles firebase createUserWithEmailAndPassword error states nicely", async () => {
    vi.spyOn(firebaseAuth, "createUserWithEmailAndPassword").mockRejectedValueOnce({
      code: "auth/email-already-in-use",
      message: "already registered"
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await expect(
      act(async () => {
        await result.current.signup("admin@fifa.org", "Admin Name", "secure123", "Admin");
      })
    ).rejects.toThrow("This email is already linked with active terminal clearance.");

    vi.spyOn(firebaseAuth, "createUserWithEmailAndPassword").mockRejectedValueOnce({
      code: "auth/weak-password",
      message: "weak"
    });
    await expect(
      act(async () => {
        await result.current.signup("admin@fifa.org", "Admin Name", "123", "Admin");
      })
    ).rejects.toThrow("The password is too weak. Must be at least 6 characters.");

    vi.spyOn(firebaseAuth, "createUserWithEmailAndPassword").mockRejectedValueOnce({
      code: "other",
      message: "System crash"
    });
    await expect(
      act(async () => {
        await result.current.signup("admin@fifa.org", "Admin Name", "secure123", "Admin");
      })
    ).rejects.toThrow("System crash");
  });

  it("handles Google sign-in success and failure paths", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Spy on getDoc to return a snapshot with Volunteer role
    const getDocSpy = vi.spyOn(firebaseFirestore, "getDoc").mockResolvedValue({
      exists: () => true,
      id: "user-123",
      data: () => ({
        uid: "user-123",
        email: "google@test.com",
        displayName: "Google User",
        role: "Volunteer"
      })
    } as any);

    // Success
    await act(async () => {
      await result.current.loginWithGoogle("Volunteer");
    });
    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.role).toBe("Volunteer");

    getDocSpy.mockRestore();

    // Brand New User (Doc does not exist)
    const getDocSpyNew = vi.spyOn(firebaseFirestore, "getDoc").mockResolvedValue({
      exists: () => false,
    } as any);
    const setDocSpy = vi.spyOn(firebaseFirestore, "setDoc").mockResolvedValue({} as any);

    await act(async () => {
      await result.current.loginWithGoogle("Fan");
    });
    expect(setDocSpy).toHaveBeenCalled();
    getDocSpyNew.mockRestore();
    setDocSpy.mockRestore();

    // Failure
    vi.spyOn(firebaseAuth, "signInWithPopup").mockRejectedValueOnce(new Error("User cancelled popup"));
    await expect(
      act(async () => {
        await result.current.loginWithGoogle("Fan");
      })
    ).rejects.toThrow("User cancelled popup");
  });

  it("handles password reset success and failures", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Success
    await act(async () => {
      await result.current.resetPassword("test@test.com");
    });

    // Failure
    vi.spyOn(firebaseAuth, "sendPasswordResetEmail").mockRejectedValueOnce(new Error("Invalid address"));
    await expect(
      act(async () => {
        await result.current.resetPassword("test@test.com");
      })
    ).rejects.toThrow("Invalid address");
  });

  it("handles general firestore error in switchRole path gracefully", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login("admin@fifa.org", "secure123", "Admin");
    });

    vi.spyOn(firebaseFirestore, "setDoc").mockRejectedValueOnce(new Error("Firestore database connection failed"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await act(async () => {
      await result.current.switchRole("Volunteer");
    });

    expect(result.current.user?.role).toBe("Volunteer");
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
