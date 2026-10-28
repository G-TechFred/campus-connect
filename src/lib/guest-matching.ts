import { DEMO_MENTEE, type Mentor } from "./mentorship-data";

export type LocalProfile = {
  id: string;
  account_type: "mentee" | "mentor";
  full_name: string;
  created_at: string;
  bio: string;
  college: string | null;
  major: string | null;
  languages: string[];
  backgrounds: string[];
  interests: string[];
};

export type GuestConnection = {
  id: string;
  mentee_id: string;
  mentor_id: string | null;
  mentor_key: string;
  mentor_name: string;
  match_score: number;
  message: string | null;
  status: "pending" | "accepted" | "declined";
  created_at: string;
};

export type GuestProfile = LocalProfile;
export const GUEST_MATCHING_KEY = "fred-guest-matching-v1";
export const DEFAULT_GUEST_PROFILE: GuestProfile = {
  ...DEMO_MENTEE,
  id: "guest-mentee", account_type: "mentee", full_name: "Kwame Mensah",
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