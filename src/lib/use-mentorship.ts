import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";
import { DEMO_MENTEE, SAMPLE_MENTORS, scoreMatch, type MenteeProfile, type Mentor } from "./mentorship-data";

const initials = (n: string) =>
  n.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("") || "PA";

/** Sample mentors plus every real mentor account in the database. */
export function useMentors() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["mentors", user?.id ?? "anon"],
    placeholderData: SAMPLE_MENTORS,
    queryFn: async (): Promise<Mentor[]> => {
      if (!user) return SAMPLE_MENTORS;
      const { data } = await supabase.from("profiles").select("*").eq("account_type", "mentor");
      const real: Mentor[] = (data ?? [])
        .filter((p) => p.id !== user.id)
        .map((p) => ({
          key: p.id,
          id: p.id,
          name: p.full_name || "Peer Advisor",
          initials: initials(p.full_name),
          year: "Peer Advisor",
          college: p.college ?? "University",
          major: p.major ?? "Undeclared",
          languages: p.languages.length ? p.languages : ["English"],
          backgrounds: p.backgrounds,
          interests: p.interests,
          bio: p.bio ?? "Newly registered peer advisor.",
          capacity: 3,
        }));
      return [...real, ...SAMPLE_MENTORS];
    },
  });
}

export function useMenteeProfile(): MenteeProfile {
  const { profile } = useAuth();
  if (!profile || profile.account_type !== "mentee" || !profile.major) return DEMO_MENTEE;
  return profile;
}

export function useRankedMentors() {
  const mentee = useMenteeProfile();
  const q = useMentors();
  const ranked = (q.data ?? [])
    .map((m) => ({ mentor: m, ...scoreMatch(mentee, m) }))
    .sort((a, b) => b.score - a.score);
  return { ...q, ranked };
}

export function useConnections() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["connections", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("connections").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useRequestConnection() {
  const { user, profile } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const m = useMutation({
    mutationFn: async ({ mentor, score, message }: { mentor: Mentor; score: number; message?: string }) => {
      const { error } = await supabase.from("connections").insert({
        mentee_id: user!.id,
        mentor_id: mentor.id ?? null,
        mentor_key: mentor.key,
        mentor_name: mentor.name,
        match_score: score,
        message: message ?? null,
      });
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      toast.success(`Request sent to ${v.mentor.name}`);
      qc.invalidateQueries({ queryKey: ["connections"] });
    },
    onError: (e: Error) =>
      toast.error(e.message.includes("duplicate") ? "You already requested this mentor." : e.message),
  });
  return {
    ...m,
    request: (mentor: Mentor, score: number) => {
      if (!user) {
        toast("Create a free account to request a mentor");
        navigate({ to: "/auth" });
        return;
      }
      if (profile?.account_type === "mentor") {
        toast.error("Peer advisor accounts can't request mentors.");
        return;
      }
      m.mutate({ mentor, score });
    },
  };
}
