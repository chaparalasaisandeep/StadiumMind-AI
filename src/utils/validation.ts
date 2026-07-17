import { UserRole } from "../types";

/**
 * Validates whether the given string is a valid email format.
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates password strength (must be at least 6 characters).
 */
export function isValidPassword(password: string): boolean {
  if (!password || typeof password !== "string") return false;
  return password.trim().length >= 6;
}

/**
 * Validates whether the given role is an authorized stadium role.
 */
export function isValidRole(role: string): role is UserRole {
  const allowedRoles: UserRole[] = ["Fan", "Volunteer", "Security", "Organizer", "Admin"];
  return allowedRoles.includes(role as UserRole);
}

/**
 * Validates coordinates are within global map boundaries.
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Validates incident data boundaries.
 */
export function isValidIncident(title: string, severity: string, type: string): boolean {
  if (!title || title.trim().length < 3) return false;
  
  const allowedSeverities = ["low", "medium", "high"];
  if (!allowedSeverities.includes(severity)) return false;

  const allowedTypes = ["security", "medical", "congestion", "maintenance"];
  if (!allowedTypes.includes(type)) return false;

  return true;
}
