import { describe, expect, it } from "vitest";
import { canNavigateTo, getRoleNavigation } from "./role-navigation";

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
    expect(getRoleNavigation("administrator")).toEqual(["/dashboard", "/admin", "/resources"]);
  });

  it("does not expose role-specific navigation before a demo role is selected", () => {
    expect(getRoleNavigation(null)).toEqual([]);
    expect(canNavigateTo(null, "/mentors")).toBe(false);
    expect(canNavigateTo(null, "/matches")).toBe(false);
  });

  it("allows mentor discovery only for mentees and matches for mentees and advisors", () => {
    expect(canNavigateTo("mentee", "/mentors")).toBe(true);
    expect(canNavigateTo("advisor", "/mentors")).toBe(false);
    expect(canNavigateTo("administrator", "/mentors")).toBe(false);
    expect(canNavigateTo("mentee", "/matches")).toBe(true);
    expect(canNavigateTo("advisor", "/matches")).toBe(true);
    expect(canNavigateTo("administrator", "/matches")).toBe(false);
  });
});
