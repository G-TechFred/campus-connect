import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { useConnections } from "@/lib/use-mentorship";
import { BACKGROUNDS } from "@/lib/mentorship-data";

export const Route = createFileRoute("/matches")({
  head: () => ({
    meta: [
      { title: "My Matches · Fred Peer Mentorship Network" },
      { name: "description", content: "Your mentor requests, confirmed matches and matching profile." },
      { property: "og:title", content: "My Mentorship Matches" },
      { property: "og:description", content: "Track mentor requests and confirmed peer matches." },
    ],
  }),
  component: Matches,
});

const statusStyle: Record<string, string> = {
  pending: "bg-accent-soft text-accent",
  accepted: "bg-teal-soft text-teal",
  declined: "bg-muted text-muted-foreground",
};

function Matches() {
  const { user, loading } = useAuth();
  if (loading) return <p className="text-muted-foreground">Loading…</p>;
  if (!user)
    return (
      <div className="mx-auto max-w-md rounded-xl border bg-card p-8 text-center shadow-card">
        <h1 className="font-display text-2xl text-primary">Sign in to see your matches</h1>
        <p className="mt-2 text-sm text-muted-foreground">Register as a mentee or peer advisor to save real matching records.</p>
        <Button asChild className="mt-5"><Link to="/auth">Sign in or register</Link></Button>
      </div>
    );
  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3"><ConnectionList /></div>
      <div className="lg:col-span-2"><ProfileEditor /></div>
    </div>
  );
}

function ConnectionList() {
  const { profile, user } = useAuth();
  const { data, isLoading } = useConnections();
  const qc = useQueryClient();
  const isMentor = profile?.account_type === "mentor";
  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "accepted" | "declined" }) => {
      const { error } = await supabase.from("connections").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["connections"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const cancel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("connections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["connections"] }),
  });

  return (
    <section className="rounded-xl border bg-card p-6 shadow-card">
      <h1 className="font-display text-2xl text-primary">{isMentor ? "Incoming Mentee Requests" : "My Matches"}</h1>
      <p className="text-sm text-muted-foreground">{isMentor ? "Accept first-year students you have capacity to support." : "Requests you've sent to peer advisors."}</p>
      {isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
      ) : !data?.length ? (
        <div className="mt-6 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          {isMentor ? "No requests yet — mentees will find you in the directory once your profile is filled in." : (<>No requests yet. <Link to="/mentors" className="font-medium text-accent">Find a mentor →</Link></>)}
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {data.map((c) => {
            const incoming = c.mentor_id === user?.id;
            return (
              <li key={c.id} className="animate-rise flex flex-wrap items-center gap-3 rounded-lg border p-4">
                <div className="flex-1">
                  <div className="font-medium">{incoming ? "First-year mentee" : c.mentor_name}</div>
                  <div className="text-xs text-muted-foreground">
                    Requested {new Date(c.created_at).toLocaleDateString()} · {c.match_score ?? "—"}% match
                    {!c.mentor_id && " · sample advisor"}
                  </div>
                </div>
                <Badge className={statusStyle[c.status]}>{c.status}</Badge>
                {incoming && c.status === "pending" && (
                  <>
                    <Button size="sm" onClick={() => update.mutate({ id: c.id, status: "accepted" })}>Accept</Button>
                    <Button size="sm" variant="outline" onClick={() => update.mutate({ id: c.id, status: "declined" })}>Decline</Button>
                  </>
                )}
                {!incoming && c.status === "pending" && (
                  <Button size="sm" variant="ghost" onClick={() => cancel.mutate(c.id)}>Withdraw</Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

const split = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

function ProfileEditor() {
  const { profile, refreshProfile } = useAuth();
  const qc = useQueryClient();
  const [bgs, setBgs] = useState<string[]>([]);
  useEffect(() => setBgs(profile?.backgrounds ?? []), [profile]);
  if (!profile) return null;

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const { error } = await supabase.from("profiles").update({
      full_name: String(f.get("name")),
      major: String(f.get("major")),
      languages: split(String(f.get("languages"))),
      interests: split(String(f.get("interests"))),
      bio: String(f.get("bio")),
      backgrounds: bgs,
    }).eq("id", profile!.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Matching profile saved");
    await refreshProfile();
    qc.invalidateQueries({ queryKey: ["mentors"] });
  }

  return (
    <form onSubmit={save} className="space-y-4 rounded-xl border bg-card p-6 shadow-card">
      <div>
        <h2 className="font-display text-xl text-primary">Matching profile</h2>
        <p className="text-xs text-muted-foreground">Role: {profile.account_type === "mentor" ? "Peer Advisor" : "First-Year Mentee"} · {profile.college}</p>
      </div>
      <div className="space-y-1.5"><Label>Full name</Label><Input name="name" defaultValue={profile.full_name} /></div>
      <div className="space-y-1.5"><Label>Major</Label><Input name="major" defaultValue={profile.major ?? ""} /></div>
      <div className="space-y-1.5"><Label>Languages (comma separated)</Label><Input name="languages" defaultValue={profile.languages.join(", ")} placeholder="English, Twi" /></div>
      <div className="space-y-1.5"><Label>Career interests</Label><Input name="interests" defaultValue={profile.interests.join(", ")} placeholder="Finance, Entrepreneurship" /></div>
      <div className="space-y-1.5">
        <Label>Background</Label>
        <div className="flex flex-wrap gap-2">
          {BACKGROUNDS.map((b) => {
            const on = bgs.includes(b);
            return (
              <button type="button" key={b} onClick={() => setBgs(on ? bgs.filter((x) => x !== b) : [...bgs, b])}
                className={`rounded-full border px-3 py-1 text-xs ${on ? "border-accent bg-accent text-accent-foreground" : "hover:border-accent/60"}`}>{b}</button>
            );
          })}
        </div>
      </div>
      <div className="space-y-1.5"><Label>Short bio</Label><Textarea name="bio" rows={3} defaultValue={profile.bio ?? ""} /></div>
      <Button className="w-full">Save profile</Button>
    </form>
  );
}
