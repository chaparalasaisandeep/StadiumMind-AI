import { UserRole, UserProfile } from "../types";

/**
 * Centralized role to default sector mapping.
 */
export const ROLE_DEFAULT_SECTORS: Record<UserRole, string> = {
  Fan: "Sector General",
  Volunteer: "Volunteer Desk 3",
  Organizer: "Sector General",
  Security: "Sector West-Gate 4",
  Medical: "Sector General",
  Transport: "Sector General",
  Admin: "Sector General",
  Accessibility: "Sector General",
};

/**
 * Returns the default assigned sector for a given user role.
 */
export function getDefaultSectorForRole(role: UserRole): string {
  return ROLE_DEFAULT_SECTORS[role] || "Sector General";
}

/**
 * Helper to build a standard production-ready UserProfile object.
 */
export function createDefaultProfile(
  uid: string,
  email: string,
  displayName: string,
  role: UserRole,
  createdAt?: string
): UserProfile {
  return {
    uid,
    email,
    displayName: displayName || email.split("@")[0] || "User",
    role,
    assignedSector: getDefaultSectorForRole(role),
    createdAt: createdAt || new Date().toISOString(),
  };
}
