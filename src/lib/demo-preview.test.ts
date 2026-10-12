import { describe, expect, it } from "vitest";
import { DEMO_DESTINATIONS } from "./demo-preview";

describe("Demo role destinations", () => {
  it("opens the student dashboard for first-year mentees", () => expect(DEMO_DESTINATIONS.mentee).toBe("/dashboard"));
  it("opens mentor management for senior peer advisors", () => expect(DEMO_DESTINATIONS.advisor).toBe("/advisor"));
  it("opens program analytics for HESA administrators", () => expect(DEMO_DESTINATIONS.administrator).toBe("/admin"));
});