import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { addGuestConnection, updateGuestConnection, withdrawGuestConnection, DEFAULT_GUEST_PROFILE, GUEST_MATCHING_KEY, type GuestConnection, type GuestProfile } from "./guest-matching";
import { SAMPLE_MENTORS, type Mentor } from "./mentorship-data";

export type DemoRole = "mentee" | "advisor" | "administrator";
export const DEMO_DESTINATIONS = {
  mentee: "/dashboard",
  advisor: "/advisor",
  administrator: "/admin",
} as const;

const DemoContext = createContext<{
  role: DemoRole | null;
  setRole: (role: DemoRole | null, remember?: boolean) => void;
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
  const [rememberRole, setRememberRole] = useState(true);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(GUEST_MATCHING_KEY) ?? "null");
      if (stored && Array.isArray(stored.connections) && stored.profile?.id === "guest-mentee") {
        const connections = stored.connections.map((connection: GuestConnection) => {
          if (!connection || typeof connection !== "object") return connection;
          const mentor = SAMPLE_MENTORS.find((sample) => sample.key === connection.mentor_key);
          return mentor ? { ...connection, mentor_name: mentor.name } : connection;
        });
        const profile = stored.profile.full_name === "Godfred A."
          ? { ...stored.profile, full_name: DEFAULT_GUEST_PROFILE.full_name }
          : stored.profile;
        setConnections(connections);
        saveProfile(profile);
      }
      const savedRole = localStorage.getItem("fred-preview-role") ?? sessionStorage.getItem("fred-preview-role");
      if (savedRole === "mentee" || savedRole === "advisor" || savedRole === "administrator") {
        setRole(savedRole);
        setRememberRole(localStorage.getItem("fred-preview-role") === savedRole);
      }
    } catch { /* Unavailable storage must not prevent portal access. */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(GUEST_MATCHING_KEY, JSON.stringify({ connections, profile: guestProfile }));
      if (role && rememberRole) localStorage.setItem("fred-preview-role", role);
      else localStorage.removeItem("fred-preview-role");
      if (role && !rememberRole) sessionStorage.setItem("fred-preview-role", role);
      else sessionStorage.removeItem("fred-preview-role");
    } catch { /* Continue in memory when storage is unavailable. */ }
  }, [connections, guestProfile, role, rememberRole, ready]);
  function chooseRole(nextRole: DemoRole | null, remember = true) {
    setRole(nextRole);
    setRememberRole(remember);
  }
  return <DemoContext.Provider value={{ role, setRole: chooseRole, connections, guestProfile, ready, saveProfile,
    requestMentor: (mentor, score) => setConnections((rows) => addGuestConnection(rows, mentor, score)),
    updateConnection: (id, status) => setConnections((rows) => updateGuestConnection(rows, id, status)),
    withdrawConnection: (id) => setConnections((rows) => withdrawGuestConnection(rows, id)),
  }}>{children}</DemoContext.Provider>;
}

export const useDemoPreview = () => useContext(DemoContext);