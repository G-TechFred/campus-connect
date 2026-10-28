import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDemoPreview } from "@/lib/demo-preview";
import { useConnections } from "@/lib/use-mentorship";
import { BACKGROUNDS } from "@/lib/mentorship-data";

export const Route = createFileRoute("/matches")({
  head: () => ({
    meta: [
      { title: "My Matches · Fred Peer Mentorship Network" },
      { name: "description", content: "Your mentor requests, confirmed matches and matching profile." },
      { property: "og:title", content: "My Mentorship Matches" },
      { property: "og:description", content: "Track mentor requests and confirmed peer matches." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3"><ConnectionList /></div>
      <div className="lg:col-span-2"><ProfileEditor /></div>
    </div>
  );
}

function ConnectionList() {
  const demo = useDemoPreview();
  const { data, isLoading } = useConnections();
  const isMentor = demo.role === "advisor";

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
            const incoming = isMentor;
            return (
              <li key={c.id} className="animate-rise flex flex-wrap items-center gap-3 rounded-lg border p-4">
                <div className="flex-1">
                  <div className="font-medium">{incoming ? "First-year mentee" : c.mentor_name}</div>
                  <div className="text-xs text-muted-foreground">
                    Requested {new Date(c.created_at).toLocaleDateString()} · {c.match_score ?? "—"}% match
                    {" · saved on this device"}
                  </div>
                </div>
                <Badge className={statusStyle[c.status]}>{c.status}</Badge>
                {incoming && c.status === "pending" && (
                  <>
                    <Button size="sm" onClick={() => { demo.updateConnection(c.id, "accepted"); toast.success("Request accepted"); }}>Accept</Button>
                    <Button size="sm" variant="outline" onClick={() => { demo.updateConnection(c.id, "declined"); toast.success("Request declined"); }}>Decline</Button>
                  </>
                )}
                {!incoming && c.status === "pending" && (
                  <Button size="sm" variant="ghost" onClick={() => { demo.withdrawConnection(c.id); toast.success("Request withdrawn"); }}>Withdraw</Button>
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
  const demo = useDemoPreview();
  const profile = demo.guestProfile;
  const [bgs, setBgs] = useState<string[]>([]);
  useEffect(() => setBgs(profile?.backgrounds ?? []), [profile]);

  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile) return;
    const f = new FormData(e.currentTarget);
    const values = {
      full_name: String(f.get("name")),
      major: String(f.get("major")),
      languages: split(String(f.get("languages"))),
      interests: split(String(f.get("interests"))),
      bio: String(f.get("bio")),
      backgrounds: bgs,
    };
    demo.saveProfile({ ...profile, ...values });
    toast.success("Matching profile saved on this device");
  }

  return (
    <form onSubmit={save} className="space-y-4 rounded-xl border bg-card p-6 shadow-card">
      <div>
        <h2 className="font-display text-xl text-primary">Matching profile</h2>
        <p className="text-xs text-muted-foreground">Role: {demo.role === "advisor" || profile.account_type === "mentor" ? "Peer Advisor" : "First-Year Mentee"} · {profile.college}</p>
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
