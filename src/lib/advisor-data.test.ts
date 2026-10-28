import { describe, expect, it } from "vitest";
import {
  ADVISOR_STUDENT_PROFILES,
  createDefaultAdvisorState,
  readAdvisorNotes,
  readAdvisorState,
  updateRequestStatus,
} from "./advisor-data";

describe("peer advisor workspace state", () => {
  it("moves an accepted request into the active state and preserves other request statuses", () => {
    const pending = createDefaultAdvisorState();
    const accepted = updateRequestStatus(pending, "request-one", "accepted");
    const declined = updateRequestStatus(accepted, "request-two", "declined");
    expect(declined.requestStatuses).toEqual({
      "request-one": "accepted",
      "request-two": "declined",
    });
  });

  it("restores advisor requests and check-ins safely from browser storage", () => {
    const saved = createDefaultAdvisorState();
    saved.requestStatuses["advisor-request-student-01"] = "accepted";
    const restored = readAdvisorState(JSON.stringify(saved));
    expect(restored.requestStatuses["advisor-request-student-01"]).toBe("accepted");
    expect(restored.checkins).toHaveLength(2);
    expect(readAdvisorState("{invalid")).toEqual(createDefaultAdvisorState());
  });

  it("accepts only well-formed session notes", () => {
    const notes = [{ id: "n1", studentId: "student-01", studentName: "Godfred A.", date: "2026-10-27", takeaways: "Set a study routine.", theoryFocus: "coping" }];
    expect(readAdvisorNotes(JSON.stringify(notes))).toEqual([
      { ...notes[0], studentName: "Kwame Mensah" },
    ]);
    expect(readAdvisorNotes(JSON.stringify([{ id: "bad" }]))).toEqual([]);
    expect(ADVISOR_STUDENT_PROFILES.some((student) => student.id === "student-active-01")).toBe(true);
  });
});
