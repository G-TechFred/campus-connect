import { toast } from "sonner";
import { ADMIN_STATE_KEY, readAdminState } from "./admin-data";
import { useDemoPreview } from "./demo-preview";
import { DEMO_MENTEE, SAMPLE_MENTORS, scoreMatch, type MatchingAlgorithm, type MenteeProfile, type Mentor } from "./mentorship-data";

function getMatchingAlgorithm(): MatchingAlgorithm {
  if (typeof window === "undefined") return "balanced";
  try {
    return readAdminState(window.localStorage.getItem(ADMIN_STATE_KEY)).settings.matchingAlgorithm;
  } catch {
    return "balanced";
  }
}

export function useMentors() {
  return { data: SAMPLE_MENTORS, isLoading: false };
}

export function useMenteeProfile(): MenteeProfile {
  const { guestProfile } = useDemoPreview();
  return guestProfile ?? DEMO_MENTEE;
}

export function useRankedMentors() {
  const mentee = useMenteeProfile();
  const { data } = useMentors();
  const algorithm = getMatchingAlgorithm();
  const ranked = data
    .map((mentor) => ({ mentor, ...scoreMatch(mentee, mentor, algorithm) }))
    .sort((a, b) => b.score - a.score);
  return { data, isLoading: false, ranked };
}

export function useConnections() {
  const { connections, ready } = useDemoPreview();
  return { data: connections, isLoading: !ready };
}

export function useRequestConnection() {
  const demo = useDemoPreview();
  return {
    isPending: false,
    request: (mentor: Mentor, score: number) => {
      if (demo.role === "advisor" || demo.role === "administrator") {
        toast.error("Only mentee previews can request a mentor.");
        return;
      }
      if (demo.connections.some((connection) => connection.mentor_key === mentor.key)) {
        toast.error("You already requested this mentor.");
        return;
      }
      demo.requestMentor(mentor, score);
      toast.success(`Request sent to ${mentor.name}`);
    },
  };
}
