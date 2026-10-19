import type { Database } from "@/integrations/supabase/types";
import { DEMO_MENTEE, type Mentor } from "./mentorship-data";

export type GuestConnection = Database["public"]["Tables"]["connections"]["Row"];
export type GuestProfile = Database["public"]["Tables"]["profiles"]["Row"];
export const GUEST_MATCHING_KEY = "fred-guest-matching-v1";
export const DEFAULT_GUEST_PROFILE: GuestProfile = {
  ...DEMO_MENTEE,
  id: "guest-mentee", account_type: "mentee", full_name: "Godfred A.",
  created_at: "", bio: "", college: DEMO_MENTEE.college ?? null,
  major: DEMO_MENTEE.major ?? null, languages: DEMO_MENTEE.languages ?? [],
  backgrounds: DEMO_MENTEE.backgrounds ?? [], interests: DEMO_MENTEE.interests ?? [],
};

export function addGuestConnection(rows: GuestConnection[], mentor: Mentor, score: number): GuestConnection[] {
  if (rows.some((row) => row.mentor_key === mentor.key)) return rows;
  return [{ id: `guest-${mentor.key}`, mentee_id: "guest-mentee", mentor_id: null,
    mentor_key: mentor.key, mentor_name: mentor.name, match_score: score,
    status: "pending", message: null, created_at: new Date().toISOString() }, ...rows];
}

export function updateGuestConnection(rows: GuestConnection[], id: string, status: "accepted" | "declined") {
  return rows.map((row) => row.id === id ? { ...row, status } : row);
}

export function withdrawGuestConnection(rows: GuestConnection[], id: string) {
  return rows.filter((row) => row.id !== id);
}