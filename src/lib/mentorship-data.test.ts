import { describe, expect, it } from "vitest";
import { DEMO_MENTEE, SAMPLE_MENTORS, scoreMatch } from "./mentorship-data";

describe("scoreMatch", () => {
  it("awards 35 points for the same major", () => {
    const ama = SAMPLE_MENTORS.find((m) => m.key === "s-ama")!;
    const { breakdown } = scoreMatch({ major: "Business Administration" }, ama);
    expect(breakdown.find((b) => b.label === "Academic major")!.points).toBe(35);
  });

  it("never exceeds 100", () => {
    for (const m of SAMPLE_MENTORS) expect(scoreMatch(DEMO_MENTEE, m).score).toBeLessThanOrEqual(100);
  });

  it("gives zero major points across different majors", () => {
    const priya = SAMPLE_MENTORS.find((m) => m.key === "s-priya")!;
    expect(scoreMatch(DEMO_MENTEE, priya).breakdown[0]?.points).toBe(0);
  });
});
