import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X, Users, CalendarCheck, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDemoPreview } from "@/lib/demo-preview";

export const Route = createFileRoute("/advisor")({
  head: () => ({ meta: [
    { title: "Peer Advisor Management · Fred University" },
    { name: "description", content: "Preview Fred University's peer advisor workspace for mentee requests, advising capacity, and check-ins." },
    { property: "og:title", content: "Fred University · Peer Advisor Management" },
    { property: "og:description", content: "Manage first-year mentee requests and peer advising check-ins in a sample workspace." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AdvisorPreview,
});

function AdvisorPreview() {
  const { connections, guestProfile, updateConnection } = useDemoPreview();
  const [requests, setRequests] = useState([
    { name: "Godfred A.", major: "Business Administration", score: 100, status: "pending" },
    { name: "Akosua B.", major: "Accounting", score: 85, status: "pending" },
  ]);
  const accepted = requests.filter((r) => r.status === "accepted").length;
  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs uppercase tracking-[0.16em] text-accent">Senior Peer Advisor</p><h1 className="mt-2 font-display text-3xl text-primary">Mentor Management</h1><p className="mt-2 text-muted-foreground">Welcome back, Ama. Your first-year advising community.</p></div>
        <Badge variant="outline">Demo · Sample advising data</Badge>
      </header>
      <div className="grid gap-4 sm:grid-cols-3">
        {[{ label: "Active mentees", value: `${1 + accepted}`, icon: Users }, { label: "Pending requests", value: `${requests.filter((r) => r.status === "pending").length}`, icon: ClipboardList }, { label: "Upcoming check-ins", value: "2", icon: CalendarCheck }].map(({ label, value, icon: Icon }) => <article key={label} className="rounded-lg border bg-card p-5"><Icon className="mb-3 h-5 w-5 text-teal" /><p className="text-3xl font-semibold text-primary">{value}</p><p className="mt-1 text-sm text-muted-foreground">{label}</p></article>)}
      </div>
      <section className="border-t pt-6">
        <h2 className="font-display text-xl text-primary">Incoming Mentee Requests</h2>
        <ul className="mt-4 divide-y">
          {connections.map((r) => <li key={r.id} className="flex flex-wrap items-center gap-4 py-5"><div className="flex-1"><p className="font-semibold">{guestProfile.full_name}</p><p className="mt-1 text-sm text-muted-foreground">Request to {r.mentor_name} · {r.match_score}% match · saved on this device</p></div><Badge variant="secondary">{r.status}</Badge>{r.status === "pending" && <div className="flex gap-2"><Button size="sm" onClick={() => updateConnection(r.id, "accepted")}><Check />Accept</Button><Button size="sm" variant="outline" onClick={() => updateConnection(r.id, "declined")}><X />Decline</Button></div>}</li>)}
          {requests.map((r) => <li key={r.name} className="flex flex-wrap items-center gap-4 py-5"><div className="flex-1"><p className="font-semibold">{r.name}</p><p className="mt-1 text-sm text-muted-foreground">{r.major} · {r.score}% match</p></div><Badge variant="secondary" className={r.status === "accepted" ? "bg-teal-soft text-teal" : ""}>{r.status}</Badge>{r.status === "pending" && <div className="flex gap-2"><Button size="sm" onClick={() => setRequests((rows) => rows.map((row) => row.name === r.name ? { ...row, status: "accepted" } : row))}><Check />Accept</Button><Button size="sm" variant="outline" onClick={() => setRequests((rows) => rows.map((row) => row.name === r.name ? { ...row, status: "declined" } : row))}><X />Decline</Button></div>}</li>)}
        </ul>
      </section>
      <section className="grid gap-8 border-t pt-6 sm:grid-cols-2">
        <div><h2 className="font-display text-xl text-primary">Advising Capacity</h2><p className="my-3 text-sm text-muted-foreground">{1 + accepted} of 3 mentee places filled</p><Progress value={(1 + accepted) / 3 * 100} className="h-2" /></div>
        <div><h2 className="font-display text-xl text-primary">Upcoming Check-ins</h2><p className="mt-3 text-sm font-medium">Study routines · Godfred A.</p><p className="text-sm text-muted-foreground">Tue, Oct 13 · 4:00 PM · Video</p><p className="mt-3 text-sm font-medium">First-Gen Business Circle</p><p className="text-sm text-muted-foreground">Thu, Oct 15 · 5:30 PM · Video</p></div>
      </section>
    </div>
  );
}