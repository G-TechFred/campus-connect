import { describe, expect, it } from "vitest";
import {
  countCompletedCheckins,
  createDefaultAdminState,
  getMatchSuccessRate,
  readAdminState,
} from "./admin-data";

describe("administrator portal sample data", () => {
  it("calculates filtered metrics from college-level program records", () => {
    expect(countCompletedCheckins("All colleges")).toBe(6);
    expect(countCompletedCheckins("College of Business")).toBe(2);
    expect(getMatchSuccessRate("All colleges")).toBe(87);
    expect(getMatchSuccessRate("College of Engineering")).toBe(80);
  });

  it("restores defaults for invalid saved data", () => {
    expect(readAdminState("{not json")).toEqual(createDefaultAdminState());
  });

  it("keeps settings and management changes when reading persisted state", () => {
    const saved = createDefaultAdminState();
    saved.pausedAdvisorKeys = ["s-ama"];
    saved.settings.matchingAlgorithm = "college-first";
    saved.settings.announcements = ["Welcome to the new term"];
    saved.dashboard.quickActions[0]!.label = "Meet with an advisor";
    saved.dashboard.milestones[0]!.label = "Complete your transition profile";
    saved.resources[0]!.appointmentUrl = "https://example.test/appointment";
    const restored = readAdminState(JSON.stringify(saved));
    expect(restored.pausedAdvisorKeys).toEqual(["s-ama"]);
    expect(restored.settings.matchingAlgorithm).toBe("college-first");
    expect(restored.settings.announcements).toEqual(["Welcome to the new term"]);
    expect(restored.dashboard.quickActions[0]!.label).toBe("Meet with an advisor");
    expect(restored.dashboard.milestones[0]!.label).toBe("Complete your transition profile");
    expect(restored.resources[0]!.appointmentUrl).toBe("https://example.test/appointment");
  });
});
