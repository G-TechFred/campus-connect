import { describe, expect, it } from "vitest";
import { DEMO_MENTEE, SAMPLE_MENTORS, scoreMatch } from "./mentorship-data";
import { SAMPLE_ADMIN_LOGS, SAMPLE_STUDENTS } from "./mock-data";

describe("Ghanaian sample directory data", () => {
  it("uses consistent Ghanaian names across sample students, mentors, and activity", () => {
    expect(SAMPLE_STUDENTS.map((student) => student.full_name)).toEqual([
      "Kwame Mensah",
      "Abena Frimpong",
      "Yaw Asante",
      "Esi Danquah",
      "Kojo Addo",
    ]);
    expect(SAMPLE_MENTORS.map((mentor) => mentor.name)).toEqual([
      "Ama Owusu",
      "Daniel Mensah",
      "Akosua Appiah",
      "Kofi Boateng",
      "Abena Frimpong",
      "Kwame Asante",
      "Kwabena Owusu",
    ]);
    expect(SAMPLE_ADMIN_LOGS.map((event) => event.actor)).toEqual([
      "Ama Owusu",
      "Abena Frimpong",
      "Daniel Mensah",
      "Yaw Asante",
    ]);
    for (const mentor of SAMPLE_MENTORS) {
      expect(mentor.initials).toBe(mentor.name.split(" ").map((part) => part[0]).join(""));
    }
  });
});

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

  it("uses college-first weights when selected in program settings", () => {
    const ama = SAMPLE_MENTORS.find((m) => m.key === "s-ama")!;
    const { breakdown } = scoreMatch({ college: ama.college, major: "Undeclared" }, ama, "college-first");
    expect(breakdown.find((item) => item.label === "College")).toMatchObject({ points: 35, max: 35 });
    expect(breakdown.find((item) => item.label === "Academic major")).toMatchObject({ points: 0, max: 25 });
  });
});
