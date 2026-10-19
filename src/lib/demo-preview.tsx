import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { addGuestConnection, updateGuestConnection, withdrawGuestConnection, DEFAULT_GUEST_PROFILE, GUEST_MATCHING_KEY, type GuestConnection, type GuestProfile } from "./guest-matching";
import type { Mentor } from "./mentorship-data";

export type DemoRole = "mentee" | "advisor" | "administrator";
export const DEMO_DESTINATIONS = {
  mentee: "/dashboard",
  advisor: "/advisor",
  administrator: "/admin",
} as const;

const DemoContext = createContext<{
  role: DemoRole | null;
  setRole: (role: DemoRole | null) => void;
  connections: GuestConnection[];
  guestProfile: GuestProfile;
  ready: boolean;
  requestMentor: (mentor: Mentor, score: number) => void;
  updateConnection: (id: string, status: "accepted" | "declined") => void;
  withdrawConnection: (id: string) => void;
  saveProfile: (profile: GuestProfile) => void;
}>({ role: null, setRole: () => {}, connections: [], guestProfile: DEFAULT_GUEST_PROFILE,
  ready: false, requestMentor: () => {}, updateConnection: () => {}, withdrawConnection: () => {}, saveProfile: () => {} });

// Presentation-only: this never creates a session or grants account permissions.
export function DemoPreviewProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<DemoRole | null>(null);
  const [connections, setConnections] = useState<GuestConnection[]>([]);
  const [guestProfile, saveProfile] = useState<GuestProfile>(DEFAULT_GUEST_PROFILE);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(GUEST_MATCHING_KEY) ?? "null");
      if (stored && Array.isArray(stored.connections) && stored.profile?.id === "guest-mentee") {
        setConnections(stored.connections);
        saveProfile(stored.profile);
      }
      const savedRole = sessionStorage.getItem("fred-preview-role");
      if (savedRole === "mentee" || savedRole === "advisor" || savedRole === "administrator") setRole(savedRole);
    } catch { /* Unavailable storage must not prevent portal access. */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(GUEST_MATCHING_KEY, JSON.stringify({ connections, profile: guestProfile }));
      if (role) sessionStorage.setItem("fred-preview-role", role);
      else sessionStorage.removeItem("fred-preview-role");
    } catch { /* Continue in memory when storage is unavailable. */ }
  }, [connections, guestProfile, role, ready]);
  return <DemoContext.Provider value={{ role, setRole, connections, guestProfile, ready, saveProfile,
    requestMentor: (mentor, score) => setConnections((rows) => addGuestConnection(rows, mentor, score)),
    updateConnection: (id, status) => setConnections((rows) => updateGuestConnection(rows, id, status)),
    withdrawConnection: (id) => setConnections((rows) => withdrawGuestConnection(rows, id)),
  }}>{children}</DemoContext.Provider>;
}

export const useDemoPreview = () => useContext(DemoContext);