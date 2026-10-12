import { createContext, useContext, useState, type ReactNode } from "react";

export type DemoRole = "mentee" | "advisor" | "administrator";
export const DEMO_DESTINATIONS = {
  mentee: "/dashboard",
  advisor: "/advisor",
  administrator: "/admin",
} as const;

const DemoContext = createContext<{
  role: DemoRole | null;
  setRole: (role: DemoRole | null) => void;
}>({ role: null, setRole: () => {} });

// Presentation-only: this never creates a session or grants account permissions.
export function DemoPreviewProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<DemoRole | null>(null);
  return <DemoContext.Provider value={{ role, setRole }}>{children}</DemoContext.Provider>;
}

export const useDemoPreview = () => useContext(DemoContext);