import type { DemoRole } from "./demo-preview";

export const ROLE_NAVIGATION: Record<DemoRole, readonly string[]> = {
  mentee: ["/dashboard", "/mentors", "/matches", "/resources"],
  advisor: ["/dashboard", "/advisor", "/matches", "/resources"],
  administrator: ["/dashboard", "/admin", "/resources"],
};

export function getRoleNavigation(role: DemoRole | null): readonly string[] {
  return ROLE_NAVIGATION[role ?? "mentee"];
}
