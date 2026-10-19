import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  BookOpen, CalendarCheck, CalendarClock, CheckCircle2, ClipboardList, GraduationCap, Info,
  MessageSquareHeart, Sparkles, Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/mentor-card";
import { MatchBreakdownDialog } from "@/components/match-breakdown";
import { useAuth } from "@/lib/auth";
import { useConnections, useRankedMentors, useRequestConnection } from "@/lib/use-mentorship";
import { CHECKINS, MILESTONES } from "@/lib/mentorship-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · Fred Peer Mentorship Network" },
      { name: "description", content: "First-year mentee dashboard: smart peer mentor matches, check-ins and transition milestones." },
      { property: "og:title", content: "Fred Peer Mentorship Network" },
      { property: "og:description", content: "Smart matching between first-year students and trained peer advisors." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

type Panel = null | "book" | "milestones" | "feedback";

function Dashboard() {
  const { profile } = useAuth();
  const first = profile?.full_name?.split(" ")[0] || "Godfred";
  const { ranked } = useRankedMentors();
  const top = ranked[0];
  const req = useRequestConnection();
  const { data: conns } = useConnections();
  const [panel, setPanel] = useState<Panel>(null);
  const [done, setDone] = useState<string[]>(["m1"]);
  useEffect(() => {
    const s = localStorage.getItem("milestones");
    if (s) setDone(JSON.parse(s));
  }, []);
  const toggle = (id: string) => {
    const next = done.includes(id) ? done.filter((d) => d !== id) : [...done, id];
    setDone(next);
    localStorage.setItem("milestones", JSON.stringify(next));
  };
  const requested = top && conns?.some((c) => c.mentor_key === top.mentor.key);
  const stage = conns?.some((c) => c.status === "accepted") ? 3 : conns?.length ? 2 : 1;

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <section className="animate-rise relative overflow-hidden rounded-2xl bg-gradient-navy p-6 text-primary-foreground shadow-lift sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border-[28px] border-accent/20" />
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Fall 2026 · Week 3 of Transition</p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">Welcome to Campus, {first}!</h1>
        <p className="mt-2 max-w-xl text-primary-foreground/80">Your transition journey starts here.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Profile complete", n: 1 },
            { label: "Mentor requested", n: 2 },
            { label: "Match confirmed", n: 3 },
          ].map((s) => (
            <div key={s.n} className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${stage >= s.n ? "border-accent/60 bg-accent/15" : "border-primary-foreground/15 bg-primary-foreground/5"}`}>
              <CheckCircle2 className={`h-5 w-5 ${stage >= s.n ? "text-accent" : "text-primary-foreground/40"}`} />
              <div>
                <div className="text-sm font-medium">{s.label}</div>
                <div className="text-xs text-primary-foreground/60">Step {s.n} of 3</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Smart match */}
        <section className="rounded-xl border bg-card p-6 shadow-card lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-xl text-primary">
              <Sparkles className="h-5 w-5 text-accent" /> Smart Match Preview
            </h2>
            <Badge className="bg-accent-soft text-accent">Recommended for you</Badge>
          </div>
          {top && (
            <div className="mt-5 flex flex-col gap-5 sm:flex-row">
              <Avatar initials={top.mentor.initials} className="h-20 w-20 text-xl" />
              <div className="flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <h3 className="text-lg font-semibold">{top.mentor.name}</h3>
                  <span className="text-sm text-muted-foreground">{top.mentor.year} · {top.mentor.major}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{top.mentor.bio}</p>
                <ul className="mt-3 flex flex-wrap gap-2 text-xs">
                  {top.breakdown.filter((b) => b.points > 0).map((b) => (
                    <li key={b.label} className="rounded-full bg-teal-soft px-3 py-1 text-teal">✓ {b.label}: {b.detail}</li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <MatchBreakdownDialog mentor={top.mentor} score={top.score} breakdown={top.breakdown}>
                    <Button variant="outline">View Match Breakdown</Button>
                  </MatchBreakdownDialog>
                  <Button disabled={requested || req.isPending} onClick={() => req.request(top.mentor, top.score)}>
                    {requested ? "Request Sent" : "Request Connection"}
                  </Button>
                  <span className="ml-auto text-3xl font-bold text-accent">{top.score}%</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Theory */}
        <section className="rounded-xl border bg-card p-6 shadow-card">
          <h2 className="flex items-center gap-2 font-display text-lg text-primary">
            <GraduationCap className="h-5 w-5 text-accent" /> Our Framework
          </h2>
          <Tabs defaultValue="s" className="mt-3">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="s">Schlossberg</TabsTrigger>
              <TabsTrigger value="a">Astin</TabsTrigger>
            </TabsList>
            <TabsContent value="s" className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Transition Theory (1981)</p>
              <p className="mt-1">Students cope with transition through the <b>4 S's</b>:</p>
              <ul className="mt-2 space-y-1">
                <li><b className="text-foreground">Situation</b> — the self-assessment & first-gen flags</li>
                <li><b className="text-foreground">Self</b> — identity-aware mentor matching</li>
                <li><b className="text-foreground">Support</b> — peer advisors & check-ins</li>
                <li><b className="text-foreground">Strategies</b> — the milestone checklist</li>
              </ul>
            </TabsContent>
            <TabsContent value="a" className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Theory of Student Involvement (1984)</p>
              <p className="mt-1">Learning grows with the physical and psychological energy a student invests in campus life. Check-ins and milestones are designed to increase <b className="text-foreground">quantity and quality of involvement</b>, using Astin's I-E-O model (Inputs → Environment → Outcomes) to evaluate impact.</p>
            </TabsContent>
          </Tabs>
        </section>
      </div>

      {/* Quick actions */}
      <section>
        <h2 className="mb-4 font-display text-xl text-primary">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { icon: CalendarCheck, label: "Book Advising Session", tip: "Schlossberg: Support", on: () => setPanel("book") },
            { icon: BookOpen, label: "View Campus Resources", tip: "Astin: Environment", to: "/resources" as const },
            { icon: ClipboardList, label: "Mentorship Milestone Checklist", tip: "Schlossberg: Strategies", on: () => setPanel("milestones") },
            { icon: MessageSquareHeart, label: "Submit Feedback", tip: "Astin: Outcomes assessment", on: () => setPanel("feedback") },
          ].map((a) => {
            const inner = (
              <>
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-secondary text-primary transition group-hover:bg-accent group-hover:text-accent-foreground">
                  <a.icon className="h-5 w-5" />
                </span>
                <span className="mt-3 text-sm font-semibold">{a.label}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground"><Info className="h-3 w-3" />{a.tip}</span>
                  </TooltipTrigger>
                  <TooltipContent>Grounded in student development theory</TooltipContent>
                </Tooltip>
              </>
            );
            const cls = "group flex flex-col items-start rounded-xl border bg-card p-5 text-left shadow-card transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lift";
            return a.to ? (
              <Link key={a.label} to={a.to} className={cls}>{inner}</Link>
            ) : (
              <button key={a.label} onClick={a.on} className={cls}>{inner}</button>
            );
          })}
        </div>
      </section>

      {/* Checkins */}
      <section className="rounded-xl border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-xl text-primary">
            <CalendarClock className="h-5 w-5 text-accent" /> Upcoming Check-ins
          </h2>
          <Link to="/matches" className="text-sm font-medium text-accent hover:underline">All connections →</Link>
        </div>
        <ul className="mt-4 divide-y">
          {CHECKINS.map((c) => (
            <li key={c.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
              <div className="w-24 shrink-0 rounded-lg bg-secondary px-3 py-2 text-center">
                <div className="text-xs text-muted-foreground">{c.date.split(",")[0]}</div>
                <div className="font-semibold text-primary">{c.date.split(", ")[1]}</div>
              </div>
              <div className="flex-1">
                <div className="font-medium">{c.topic}</div>
                <div className="text-sm text-muted-foreground">with {c.with} · {c.time} · {c.mode}</div>
              </div>
              {c.mode === "Video" ? (
                <Button variant="outline" size="sm" onClick={() => toast.info("Video room opens 10 minutes before the session.")}>
                  <Video className="h-4 w-4" /> Join call
                </Button>
              ) : (
                <Badge variant="secondary">In person</Badge>
              )}
            </li>
          ))}
        </ul>
      </section>

      <Dialog open={panel === "milestones"} onOpenChange={(o) => !o && setPanel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Mentorship Milestone Checklist</DialogTitle>
            <DialogDescription>{done.length} of {MILESTONES.length} complete</DialogDescription>
          </DialogHeader>
          <ul className="space-y-2">
            {MILESTONES.map((m) => (
              <li key={m.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-secondary">
                  <Checkbox checked={done.includes(m.id)} onCheckedChange={() => toggle(m.id)} />
                  <span className={`flex-1 text-sm ${done.includes(m.id) ? "text-muted-foreground line-through" : ""}`}>{m.label}</span>
                  <span className="text-xs text-muted-foreground">{m.week}</span>
                </label>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>

      <Dialog open={panel === "book"} onOpenChange={(o) => !o && setPanel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Book an Advising Session</DialogTitle>
            <DialogDescription>Choose an available slot with the First-Year Advising team.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            {["Wed Oct 14 · 9:00", "Wed Oct 14 · 13:30", "Thu Oct 15 · 11:00", "Fri Oct 16 · 15:00"].map((s) => (
              <Button key={s} variant="outline" onClick={() => { toast.success(`Session booked: ${s}`); setPanel(null); }}>{s}</Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={panel === "feedback"} onOpenChange={(o) => !o && setPanel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Submit Feedback</DialogTitle>
            <DialogDescription>Your responses shape program assessment each semester.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); toast.success("Thank you — feedback received."); setPanel(null); }} className="space-y-3">
            <Textarea required placeholder="How is your mentorship experience so far?" rows={5} />
            <Button type="submit" className="w-full">Send feedback</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
