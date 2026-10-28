import type { DemoRole } from "./demo-preview";

export const ROLE_NAVIGATION: Record<DemoRole, readonly string[]> = {
  mentee: ["/dashboard", "/mentors", "/matches", "/resources"],
  advisor: ["/dashboard", "/advisor", "/matches", "/resources"],
  administrator: ["/dashboard", "/admin", "/resources"],
};

export function getRoleNavigation(role: DemoRole | null): readonly string[] {
  return role ? ROLE_NAVIGATION[role] : [];
}

export function canNavigateTo(role: DemoRole | null, path: string): boolean {
  return getRoleNavigation(role).includes(path);
}
