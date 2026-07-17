import { describe, it, expect } from "vitest";
import { 
  isValidEmail, 
  isValidPassword, 
  isValidRole, 
  isValidCoordinates, 
  isValidIncident 
} from "../../src/utils/validation";

describe("Validation Utilities Tests", () => {
  describe("isValidEmail", () => {
    it("returns true for valid email formats", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("stadium_mind@fifa.org")).toBe(true);
      expect(isValidEmail("user.name+label@sub.domain.co")).toBe(true);
    });

    it("returns false for invalid email formats", () => {
      expect(isValidEmail("")).toBe(false);
      expect(isValidEmail("plaintest")).toBe(false);
      expect(isValidEmail("test@example")).toBe(false);
      expect(isValidEmail("test.com")).toBe(false);
      expect(isValidEmail(null as any)).toBe(false);
    });
  });

  describe("isValidPassword", () => {
    it("returns true for passwords with 6 or more characters", () => {
      expect(isValidPassword("123456")).toBe(true);
      expect(isValidPassword("strongPassword2026")).toBe(true);
    });

    it("returns false for too short or blank passwords", () => {
      expect(isValidPassword("")).toBe(false);
      expect(isValidPassword("   ")).toBe(false);
      expect(isValidPassword("12345")).toBe(false);
    });
  });

  describe("isValidRole", () => {
    it("returns true for authorized roles", () => {
      expect(isValidRole("Fan")).toBe(true);
      expect(isValidRole("Volunteer")).toBe(true);
      expect(isValidRole("Security")).toBe(true);
      expect(isValidRole("Organizer")).toBe(true);
      expect(isValidRole("Admin")).toBe(true);
    });

    it("returns false for unrecognized roles", () => {
      expect(isValidRole("Visitor")).toBe(false);
      expect(isValidRole("")).toBe(false);
      expect(isValidRole("super-admin")).toBe(false);
    });
  });

  describe("isValidCoordinates", () => {
    it("returns true for valid lat/lng boundaries", () => {
      expect(isValidCoordinates(19.3029, -99.1505)).toBe(true);
      expect(isValidCoordinates(0, 0)).toBe(true);
    });

    it("returns false for out of bounds coordinates", () => {
      expect(isValidCoordinates(91, 0)).toBe(false);
      expect(isValidCoordinates(0, 181)).toBe(false);
      expect(isValidCoordinates(-100, -200)).toBe(false);
    });
  });

  describe("isValidIncident", () => {
    it("returns true for fully valid incident attributes", () => {
      expect(isValidIncident("Fainted fan", "high", "medical")).toBe(true);
      expect(isValidIncident("Long concession line", "medium", "congestion")).toBe(true);
    });

    it("returns false for invalid attributes", () => {
      expect(isValidIncident("", "high", "medical")).toBe(false);
      expect(isValidIncident("Fainted fan", "critical", "medical")).toBe(false);
      expect(isValidIncident("Fainted fan", "high", "unknown")).toBe(false);
      expect(isValidIncident("ab", "high", "medical")).toBe(false);
    });
  });
});
