import { describe, expect, it } from "vitest";
import { addGuestConnection, updateGuestConnection, withdrawGuestConnection } from "./guest-matching";
import { SAMPLE_MENTORS } from "./mentorship-data";

describe("Account-free mentor matching", () => {
  const mentor = SAMPLE_MENTORS.find((row) => row.key === "s-ama");
  it("allows a first-year mentee to request a mentor without an auth user", () => {
    if (!mentor) throw new Error("Expected sample advisor");
    const rows = addGuestConnection([], mentor, 100);
    expect(rows[0]).toMatchObject({ mentee_id: "guest-mentee", mentor_name: "Ama Owusu", match_score: 100, status: "pending", mentor_id: null });
  });
  it("lets a peer advisor accept a guest match without authentication", () => {
    if (!mentor) throw new Error("Expected sample advisor");
    const rows = addGuestConnection([], mentor, 100);
    expect(updateGuestConnection(rows, "guest-s-ama", "accepted")[0]?.status).toBe("accepted");
  });
  it("prevents duplicate requests and allows withdrawal", () => {
    if (!mentor) throw new Error("Expected sample advisor");
    const rows = addGuestConnection([], mentor, 100);
    expect(addGuestConnection(rows, mentor, 100)).toHaveLength(1);
    expect(withdrawGuestConnection(rows, "guest-s-ama")).toHaveLength(0);
  });
});