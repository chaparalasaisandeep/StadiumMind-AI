import { describe, it, expect, vi } from "vitest";
import { 
  getDocData, 
  setDocData, 
  addDocData, 
  getCollectionDocs, 
  deleteDocData, 
  queryCollectionDocs,
  firestoreServices 
} from "../../src/firebase/firestore";
import * as firestoreModule from "firebase/firestore";

describe("Firestore Service Helpers & CRUD Tests - Comprehensive Coverage", () => {
  it("getDocData returns parsed document with ID if document exists", async () => {
    const docData = await getDocData<any>("stadiums", "stadium-1");
    expect(docData).toBeDefined();
    expect(docData.id).toBe("mock-id");
    expect(docData.name).toBe("Test");
    expect(firestoreModule.doc).toHaveBeenCalled();
    expect(firestoreModule.getDoc).toHaveBeenCalled();
  });

  it("setDocData calls firebase setDoc with proper params", async () => {
    await setDocData("stadiums", "stadium-1", { name: "New Name" });
    expect(firestoreModule.setDoc).toHaveBeenCalled();
  });

  it("addDocData saves to collection and returns auto-assigned ID", async () => {
    const newId = await addDocData("volunteers", {
      title: "Clean Concourse",
      description: "Clean up concourse section",
      assignedTo: "Staff",
      section: "Concourse",
      status: "pending"
    });
    expect(newId).toBe("new-id");
    expect(firestoreModule.addDoc).toHaveBeenCalled();
  });

  it("getCollectionDocs maps snapshots to a typed array", async () => {
    const docs = await getCollectionDocs<any>("users");
    expect(docs).toHaveLength(1);
    expect(docs[0].id).toBe("mock-id");
    expect(docs[0].name).toBe("Test");
  });

  it("deleteDocData calls deleteDoc API", async () => {
    await deleteDocData("users", "user-123");
    expect(firestoreModule.deleteDoc).toHaveBeenCalled();
  });

  it("queryCollectionDocs runs query constraint chains", async () => {
    const queryConstraint = {} as any;
    const docs = await queryCollectionDocs<any>("users", queryConstraint);
    expect(docs).toHaveLength(1);
    expect(firestoreModule.getDocs).toHaveBeenCalled();
  });

  it("firestoreServices wrapper delegates all typed calls correctly", async () => {
    // 1. users
    expect(await firestoreServices.users.get("u1")).not.toBeNull();
    await firestoreServices.users.save("u1", { role: "Fan" });
    expect(await firestoreServices.users.list()).toHaveLength(1);
    await firestoreServices.users.delete("u1");

    // 2. stadiums
    expect(await firestoreServices.stadiums.get("s1")).not.toBeNull();
    await firestoreServices.stadiums.save("s1", { name: "Sofi" });
    expect(await firestoreServices.stadiums.list()).toHaveLength(1);

    // 3. matches
    expect(await firestoreServices.matches.get("m1")).not.toBeNull();
    await firestoreServices.matches.save("m1", { id: "m1" });
    expect(await firestoreServices.matches.list()).toHaveLength(1);

    // 4. volunteers
    expect(await firestoreServices.volunteers.get("v1")).not.toBeNull();
    await firestoreServices.volunteers.save("v1", {
      title: "Help Support Seat Entry",
      description: "Help spectators navigate to their seats",
      assignedTo: "Volunteer-5",
      section: "Lower Bowl 102",
      status: "pending"
    });
    expect(await firestoreServices.volunteers.add({
      title: "Help",
      description: "Assist with crowd management",
      assignedTo: "Volunteer-1",
      section: "Gate 3",
      status: "pending"
    })).toBe("new-id");
    expect(await firestoreServices.volunteers.list()).toHaveLength(2);

    // 5. alerts
    expect(await firestoreServices.alerts.get("a1")).not.toBeNull();
    await firestoreServices.alerts.save("a1", {
      title: "Security Incident Alert",
      type: "security",
      severity: "high",
      location: "Gate B Ingress Corridor",
      lat: 34.0125,
      lng: -118.0152,
      status: "reported",
      timestamp: "15:45"
    });
    expect(await firestoreServices.alerts.add({
      title: "Alert",
      type: "medical",
      severity: "high",
      location: "East Stand",
      lat: 34.01,
      lng: -118.01,
      status: "reported",
      timestamp: "12:00"
    })).toBe("new-id");
    expect(await firestoreServices.alerts.list()).toHaveLength(2);

    // 6. transport
    expect(await firestoreServices.transport.get("t1")).not.toBeNull();
    await firestoreServices.transport.save("t1", { route: "Express" });
    expect(await firestoreServices.transport.list()).toHaveLength(1);

    // 7. announcements
    expect(await firestoreServices.announcements.get("an1")).not.toBeNull();
    await firestoreServices.announcements.save("an1", {
      stadiumId: "metlife",
      title: "Transit Advisory Announcement",
      content: "Line 4 Shuttle Buses experiencing minor backlog.",
      category: "transit",
      audience: "all",
      timestamp: "18:15"
    });
    expect(await firestoreServices.announcements.add({
      stadiumId: "sofi",
      title: "Announcement Title",
      content: "Test",
      category: "general",
      audience: "all",
      timestamp: "12:00"
    })).toBe("new-id");
    expect(await firestoreServices.announcements.list()).toHaveLength(2);

    // 8. crowd
    expect(await firestoreServices.crowd.get("c1")).not.toBeNull();
    await firestoreServices.crowd.save("c1", { flowRate: 100 });
    expect(await firestoreServices.crowd.list()).toHaveLength(1);

    // 9. parking
    expect(await firestoreServices.parking.get("p1")).not.toBeNull();
    await firestoreServices.parking.save("p1", { lotName: "Lot 1" });
    expect(await firestoreServices.parking.list()).toHaveLength(1);

    // 10. sustainability
    expect(await firestoreServices.sustainability.get("su1")).not.toBeNull();
    await firestoreServices.sustainability.save("su1", {
      wasteRecycledKg: 100,
      energySavedKwh: 85,
      waterSavedLitres: 200,
      timestamp: "12:00",
      stadiumId: "sofi"
    });
    expect(await firestoreServices.sustainability.list()).toHaveLength(1);
  });

  it("handles Firestore error states in CRUD functions gracefully", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // 1. getDocData error path
    vi.spyOn(firestoreModule, "getDoc").mockRejectedValueOnce(new Error("Read Error"));
    expect(await getDocData("stadiums", "err-1")).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalled();

    // 2. setDocData error path
    vi.spyOn(firestoreModule, "setDoc").mockRejectedValueOnce(new Error("Write Error"));
    await expect(setDocData("stadiums", "err-1", {})).rejects.toThrow("Write Error");

    // 3. addDocData error path
    vi.spyOn(firestoreModule, "addDoc").mockRejectedValueOnce(new Error("Add Error"));
    await expect(addDocData("stadiums", {})).rejects.toThrow("Add Error");

    // 4. getCollectionDocs error path
    vi.spyOn(firestoreModule, "getDocs").mockRejectedValueOnce(new Error("GetDocs Error"));
    expect(await getCollectionDocs("stadiums")).toEqual([]);

    // 5. queryCollectionDocs error path
    vi.spyOn(firestoreModule, "getDocs").mockRejectedValueOnce(new Error("Query Error"));
    expect(await queryCollectionDocs("stadiums")).toEqual([]);

    // 6. deleteDocData error path
    vi.spyOn(firestoreModule, "deleteDoc").mockRejectedValueOnce(new Error("Delete Error"));
    await expect(deleteDocData("stadiums", "err-1")).rejects.toThrow("Delete Error");

    // 7. Structured Permission Error path
    const permissionError = new Error("Missing or insufficient permissions");
    // @ts-ignore
    permissionError.code = "permission-denied";
    vi.spyOn(firestoreModule, "getDoc").mockRejectedValueOnce(permissionError);
    await expect(getDocData("stadiums", "err-permission")).rejects.toThrow("stadiums/err-permission");

    consoleErrorSpy.mockRestore();
  });
});
