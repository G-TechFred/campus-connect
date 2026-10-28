import { describe, expect, it } from "vitest";
import { getRoleNavigation } from "./role-navigation";

describe("role-based navigation", () => {
  it("limits mentees to student dashboard and matching resources", () => {
    expect(getRoleNavigation("mentee")).toEqual([
      "/dashboard",
      "/mentors",
      "/matches",
      "/resources",
    ]);
  });

  it("limits senior advisors to their management area and shared resources", () => {
    expect(getRoleNavigation("advisor")).toEqual([
      "/dashboard",
      "/advisor",
      "/matches",
      "/resources",
    ]);
  });

  it("limits administrators to program management and shared resources", () => {
    expect(getRoleNavigation("administrator")).toEqual([
      "/dashboard",
      "/admin",
      "/resources",
    ]);
  });

  it("uses the mentee-safe navigation before a demo role is selected", () => {
    expect(getRoleNavigation(null)).toEqual(getRoleNavigation("mentee"));
  });
});
