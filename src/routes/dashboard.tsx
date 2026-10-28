import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  MessageSquareHeart,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar } from "@/components/mentor-card";
import { MatchBreakdownDialog } from "@/components/match-breakdown";
import { useDemoPreview } from "@/lib/demo-preview";
import { useConnections, useRankedMentors, useRequestConnection } from "@/lib/use-mentorship";
import { ADVISOR_NOTES_KEY, ADVISOR_STATE_KEY, readAdvisorNotes, readAdvisorState } from "@/lib/advisor-data";
import { ADMIN_STATE_KEY, createDefaultAdminState, readAdminState } from "@/lib/admin-data";
import type { AdvisorCheckin, AdvisorSessionNote } from "@/lib/advisor-data";
import type { DashboardQuickAction } from "@/lib/admin-data";
import { Admin } from "./admin";
import { AdvisorPreview } from "./advisor";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · Fred Campus Connect" },
      { name: "description", content: "Your peer mentor match, upcoming check-ins and transition milestones." },
      { property: "og:title", content: "Fred Campus Connect" },
      { property: "og:description", content: "Your first-year student dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

type Panel = null | "book" | "milestones" | "feedback";

const ACTION_ICONS = {
  book: CalendarCheck,
  resources: BookOpen,
  milestones: ClipboardList,
  feedback: MessageSquareHeart,
} as const;

export function Dashboard() {
  const { role } = useDemoPreview();
  if (role === "administrator") return <Admin />;
  if (role === "advisor") return <AdvisorPreview />;
  return <MenteeDashboard />;
}

function MenteeDashboard() {
  const { guestProfile } = useDemoPreview();
  const first = guestProfile.full_name.split(" ")[0] || "Kwame";
  const { ranked } = useRankedMentors();
  const top = ranked[0];
  const req = useRequestConnection();
  const { data: conns } = useConnections();
  const [panel, setPanel] = useState<Panel>(null);
  const [done, setDone] = useState<string[]>(["m1"]);
  const [dashboardConfig, setDashboardConfig] = useState(() => createDefaultAdminState().dashboard);
  const [announcement, setAnnouncement] = useState("");
  const [termDates, setTermDates] = useState(() => {
    const settings = createDefaultAdminState().settings;
    return { start: settings.termStart, end: settings.termEnd };
  });
  const [checkins, setCheckins] = useState<AdvisorCheckin[]>([]);
  const [sessionNotes, setSessionNotes] = useState<AdvisorSessionNote[]>([]);

  useEffect(() => {
    try {
      const savedMilestones: unknown = JSON.parse(localStorage.getItem("milestones") ?? "null");
      if (Array.isArray(savedMilestones) && savedMilestones.every((id) => typeof id === "string")) {
        setDone(savedMilestones);
      }
      const adminState = readAdminState(localStorage.getItem(ADMIN_STATE_KEY));
      setDashboardConfig(adminState.dashboard);
      setAnnouncement(adminState.settings.announcements.at(-1) ?? "");
      setTermDates({ start: adminState.settings.termStart, end: adminState.settings.termEnd });
      setCheckins(readAdvisorState(localStorage.getItem(ADVISOR_STATE_KEY)).checkins);
      setSessionNotes(readAdvisorNotes(localStorage.getItem(ADVISOR_NOTES_KEY)));
    } catch {
      toast.error("Some saved dashboard updates could not be loaded from browser storage.");
    }
  }, []);

  const toggle = (id: string) => {
    const next = done.includes(id) ? done.filter((item) => item !== id) : [...done, id];
    setDone(next);
    try {
      localStorage.setItem("milestones", JSON.stringify(next));
    } catch {
      toast.error("Checklist progress could not be saved in browser storage.");
    }
  };

  const requested = top && conns?.some((connection) => connection.mentor_key === top.mentor.key);
  const stage = conns?.some((connection) => connection.status === "accepted") ? 3 : conns?.length ? 2 : 1;
  const studentIds = guestProfile.id === "guest-mentee"
    ? new Set([guestProfile.id, "student-01"])
    : new Set([guestProfile.id]);
  const today = new Date().toISOString().slice(0, 10);
  const studentCheckins = checkins
    .filter((checkin) => studentIds.has(checkin.studentId) && checkin.date >= today)
    .sort((left, right) => left.date.localeCompare(right.date));
  const studentNotes = sessionNotes
    .filter((note) => studentIds.has(note.studentId))
    .sort((left, right) => right.date.localeCompare(left.date));
  const termStart = new Date(`${termDates.start}T12:00:00`);
  const termEnd = new Date(`${termDates.end}T12:00:00`);
  const termToday = new Date();
  termToday.setHours(12, 0, 0, 0);
  const termProgressLabel = Number.isNaN(termStart.getTime()) || Number.isNaN(termEnd.getTime())
    ? "Campus term"
    : termToday < termStart
      ? `Term begins ${termStart.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
      : termToday > termEnd
        ? "Term complete"
        : `Term ${termStart.getFullYear()} · Week ${Math.floor((termToday.getTime() - termStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1}`;

  const actions: Record<DashboardQuickAction["id"], { icon: typeof CalendarCheck; onClick?: () => void; to?: "/resources" }> = {
    book: { icon: CalendarCheck, onClick: () => setPanel("book") },
    resources: { icon: BookOpen, to: "/resources" },
    milestones: { icon: ClipboardList, onClick: () => setPanel("milestones") },
    feedback: { icon: MessageSquareHeart, onClick: () => setPanel("feedback") },
  };

  function displayDate(date: string) {
    const parsed = new Date(`${date}T12:00:00`);
    return Number.isNaN(parsed.getTime())
      ? date
      : parsed.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card px-5 py-5 shadow-card sm:px-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-accent">{termProgressLabel}</p>
            <h1 className="mt-1 font-display text-2xl text-primary sm:text-3xl">Welcome to Campus, {first}!</h1>
            <p className="mt-1 text-sm text-muted-foreground">Your transition journey starts here.</p>
          </div>
          <Badge variant="outline" className="mt-1">Transition progress</Badge>
        </div>
        <ol aria-label="Transition progress" className="mt-5 grid gap-2 sm:grid-cols-3">
          {[
            { label: "Profile complete", number: 1 },
            { label: "Mentor requested", number: 2 },
            { label: "Match confirmed", number: 3 },
          ].map((step) => (
            <li
              key={step.number}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${stage >= step.number ? "bg-teal-soft text-teal" : "bg-muted/50 text-muted-foreground"}`}
            >
              <CheckCircle2 className={`h-4 w-4 shrink-0 ${stage >= step.number ? "text-teal" : "text-muted-foreground/50"}`} />
              <span className="flex-1 font-medium">{step.label}</span>
              <span className="text-xs opacity-70">{step.number}/3</span>
            </li>
          ))}
        </ol>
      </section>

      {announcement && (
        <aside className="rounded-lg border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-foreground">
          <span className="font-semibold">Program announcement</span>
          <span className="ml-2">{announcement}</span>
        </aside>
      )}

      <section className="rounded-xl border bg-card p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-accent">Your next connection</p>
            <h2 className="mt-1 flex items-center gap-2 font-display text-xl text-primary">
              <Sparkles className="h-5 w-5 text-accent" /> Smart Match Preview
            </h2>
          </div>
          {top && <Badge className="bg-accent-soft text-accent">Recommended for you</Badge>}
        </div>
        {top ? (
          <div className="mt-4 flex flex-col gap-4 sm:flex-row">
            <Avatar initials={top.mentor.initials} className="h-16 w-16 text-lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <h3 className="font-semibold">{top.mentor.name}</h3>
                <span className="text-sm text-muted-foreground">{top.mentor.year} · {top.mentor.major}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{top.mentor.bio}</p>
              <ul className="mt-3 flex flex-wrap gap-2 text-xs">
                {top.breakdown.filter((item) => item.points > 0).map((item) => (
                  <li key={item.label} className="rounded-full bg-teal-soft px-3 py-1 text-teal">{item.label}: {item.detail}</li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <MatchBreakdownDialog mentor={top.mentor} score={top.score} breakdown={top.breakdown}>
                  <Button variant="outline" size="sm">Match details</Button>
                </MatchBreakdownDialog>
                <Button size="sm" disabled={!!requested || req.isPending} onClick={() => req.request(top.mentor, top.score)}>
                  {requested ? "Request Sent" : "Request Connection"}
                </Button>
                <span className="ml-auto text-2xl font-bold text-accent">{top.score}%</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">Complete your profile to see a recommended peer advisor.</p>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-primary">Quick Actions</h2>
            <p className="mt-1 text-sm text-muted-foreground">Helpful shortcuts for your first semester.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardConfig.quickActions.map((action) => {
            const config = actions[action.id];
            if (!config) return null;
            const Icon = ACTION_ICONS[action.id];
            const content = (
              <>
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="mt-3 text-sm font-semibold">{action.label}</span>
                <span className="mt-1 text-xs leading-relaxed text-muted-foreground">{action.description}</span>
              </>
            );
            const className = "flex min-h-32 flex-col items-start rounded-xl border bg-card p-4 text-left shadow-card transition hover:border-accent/50 hover:shadow-lift";
            return config.to ? (
              <Link key={action.id} to={config.to} className={className}>{content}</Link>
            ) : (
              <button key={action.id} type="button" onClick={config.onClick} className={className}>{content}</button>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border bg-card p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl text-primary">
              <CalendarClock className="h-5 w-5 text-accent" /> Upcoming Check-ins
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Appointments scheduled by your Senior Peer Advisor.</p>
          </div>
          <Link to="/matches" className="text-sm font-medium text-accent hover:underline">All connections →</Link>
        </div>
        {studentCheckins.length ? (
          <ul className="mt-3 divide-y">
            {studentCheckins.map((checkin) => (
              <li key={checkin.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
                <div className="w-28 shrink-0 rounded-lg bg-secondary px-3 py-2 text-center">
                  <div className="text-xs text-muted-foreground">{displayDate(checkin.date)}</div>
                  <div className="font-semibold text-primary">{checkin.time}</div>
                </div>
                <div className="flex-1">
                  <div className="font-medium">{checkin.topic}</div>
                  <div className="text-sm text-muted-foreground">with your peer advisor</div>
                </div>
                <Badge variant="secondary">Scheduled</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">
            No upcoming check-ins yet. Your advisor’s scheduled meetings will appear here.
          </p>
        )}
        {studentNotes.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <h3 className="text-sm font-semibold text-primary">Latest advisor session note</h3>
            <article className="mt-2 rounded-lg bg-muted/40 p-3">
              <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                <span>{studentNotes[0]!.studentName} · {displayDate(studentNotes[0]!.date)}</span>
                {studentNotes[0]!.theoryFocus && <span>{studentNotes[0]!.theoryFocus}</span>}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm">{studentNotes[0]!.takeaways}</p>
            </article>
          </div>
        )}
      </section>

      <Dialog open={panel === "milestones"} onOpenChange={(open) => { if (!open) setPanel(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Transition Checklist</DialogTitle>
            <DialogDescription>{done.filter((id) => dashboardConfig.milestones.some((milestone) => milestone.id === id)).length} of {dashboardConfig.milestones.length} complete</DialogDescription>
          </DialogHeader>
          <ul className="space-y-2">
            {dashboardConfig.milestones.map((milestone) => (
              <li key={milestone.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-secondary">
                  <Checkbox checked={done.includes(milestone.id)} onCheckedChange={() => toggle(milestone.id)} />
                  <span className={`flex-1 text-sm ${done.includes(milestone.id) ? "text-muted-foreground line-through" : ""}`}>{milestone.label}</span>
                  <span className="text-xs text-muted-foreground">{milestone.week}</span>
                </label>
              </li>
            ))}
            {!dashboardConfig.milestones.length && <li className="py-5 text-center text-sm text-muted-foreground">No milestones have been configured yet.</li>}
          </ul>
        </DialogContent>
      </Dialog>

      <Dialog open={panel === "book"} onOpenChange={(open) => { if (!open) setPanel(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Book an Advising Session</DialogTitle>
            <DialogDescription>Choose an available slot with the First-Year Advising team.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            {["Wed Oct 14 · 9:00", "Wed Oct 14 · 13:30", "Thu Oct 15 · 11:00", "Fri Oct 16 · 15:00"].map((slot) => (
              <Button key={slot} variant="outline" onClick={() => { toast.success(`Session booked: ${slot}`); setPanel(null); }}>{slot}</Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={panel === "feedback"} onOpenChange={(open) => { if (!open) setPanel(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Submit Feedback</DialogTitle>
            <DialogDescription>Your responses shape program assessment each semester.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(event) => { event.preventDefault(); toast.success("Thank you — feedback received."); setPanel(null); }} className="space-y-3">
            <Textarea required placeholder="How is your mentorship experience so far?" rows={5} />
            <Button type="submit" className="w-full">Send feedback</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
