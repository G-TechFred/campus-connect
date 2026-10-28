import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { CalendarCheck, CalendarPlus, Check, ClipboardList, MessageSquareText, Users, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useDemoPreview } from "@/lib/demo-preview";
import {
  ADVISOR_NOTES_KEY,
  ADVISOR_STATE_KEY,
  ADVISOR_STUDENT_PROFILES,
  SAMPLE_ADVISOR_REQUESTS,
  createDefaultAdvisorState,
  getIncomingConnectionStudent,
  readAdvisorNotes,
  readAdvisorState,
  updateRequestStatus,
  type AdvisorLocalState,
  type AdvisorSessionNote,
  type AdvisorStudent,
} from "@/lib/advisor-data";
import { DEFAULT_GUEST_PROFILE } from "@/lib/guest-matching";

export const Route = createFileRoute("/advisor")({
  head: () => ({ meta: [
    { title: "Peer Advisor Management · Fred Campus Connect" },
    { name: "description", content: "Preview Fred Campus Connect's peer advisor workspace for mentee requests, advising capacity, and check-ins." },
    { property: "og:title", content: "Fred Campus Connect · Peer Advisor Management" },
    { property: "og:description", content: "Manage first-year mentee requests and peer advising check-ins in a sample workspace." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AdvisorPreview,
});

export function AdvisorPreview() {
  const { connections, guestProfile, updateConnection } = useDemoPreview();
  const [advisorState, setAdvisorState] = useState<AdvisorLocalState>(createDefaultAdvisorState);
  const [sessionNotes, setSessionNotes] = useState<AdvisorSessionNote[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [profileStudent, setProfileStudent] = useState<AdvisorStudent | null>(null);
  const [scheduleStudent, setScheduleStudent] = useState<AdvisorStudent | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);

  useEffect(() => {
    try {
      setAdvisorState(readAdvisorState(window.localStorage.getItem(ADVISOR_STATE_KEY)));
      setSessionNotes(readAdvisorNotes(window.localStorage.getItem(ADVISOR_NOTES_KEY)));
    } catch {
      toast.error("Saved advisor workspace data could not be loaded from browser storage.");
    }
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem(ADVISOR_STATE_KEY, JSON.stringify(advisorState));
      window.localStorage.setItem(ADVISOR_NOTES_KEY, JSON.stringify(sessionNotes));
    } catch {
      toast.error("Advisor changes are available this session but could not be saved in browser storage.");
    }
  }, [advisorState, sessionNotes, storageReady]);

  const requests = useMemo(() => {
    const sampleRequests = SAMPLE_ADVISOR_REQUESTS.map((request) => ({
      ...request,
      status: advisorState.requestStatuses[request.id] ?? request.status,
    }));
    const guestRequests = connections.map((connection) => ({
      id: `connection-${connection.id}`,
      studentId: connection.mentee_id,
      student: getIncomingConnectionStudent(connection, guestProfile),
      matchScore: connection.match_score,
      status: connection.status,
      connectionId: connection.id,
    }));
    const ids = new Set(guestRequests.map((request) => request.studentId));
    const names = new Set(guestRequests.map((request) => request.student.name.trim().toLowerCase()));
    return [
      ...guestRequests,
      ...sampleRequests.filter(
        (request) =>
          !ids.has(request.studentId) &&
          !names.has(request.student.name.trim().toLowerCase()),
      ),
    ];
  }, [advisorState.requestStatuses, connections, guestProfile]);

  const assignedMentees = useMemo(() => {
    const acceptedRequests = requests
      .filter((request) => request.status === "accepted")
      .map((request) => request.student);
    const activeStudent = ADVISOR_STUDENT_PROFILES.find((student) => student.id === "student-active-01");
    const rows = activeStudent ? [activeStudent, ...acceptedRequests] : acceptedRequests;
    return [...new Map(rows.map((student) => [student.id, student])).values()];
  }, [requests]);
  const pendingCount = requests.filter((request) => request.status === "pending").length;
  const upcomingCheckins = advisorState.checkins
    .filter((checkin) => checkin.date >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => a.date.localeCompare(b.date));
  const maxCapacity = 3;

  function changeSampleRequest(requestId: string, status: "accepted" | "declined") {
    setAdvisorState((current) => updateRequestStatus(current, requestId, status));
    toast.success(status === "accepted" ? "Mentee request accepted and added to your roster." : "Mentee request declined.");
  }

  function changeRequest(requestId: string, connectionId: string | undefined, status: "accepted" | "declined") {
    if (connectionId) updateConnection(connectionId, status);
    else changeSampleRequest(requestId, status);
    if (connectionId) toast.success(status === "accepted" ? "Mentee request accepted and added to your roster." : "Mentee request declined.");
  }

  function scheduleCheckin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!scheduleStudent) return;
    const form = new FormData(event.currentTarget);
    const date = String(form.get("date") ?? "");
    const time = String(form.get("time") ?? "");
    const topic = String(form.get("topic") ?? "").trim();
    if (!date || !time || !topic) {
      toast.error("Add a date, time, and topic for the check-in.");
      return;
    }
    setAdvisorState((current) => ({
      ...current,
      checkins: [
        ...current.checkins,
        { id: `checkin-${scheduleStudent.id}-${Date.now()}`, studentId: scheduleStudent.id, date, time, topic },
      ],
    }));
    setScheduleStudent(null);
    toast.success(`Check-in scheduled with ${scheduleStudent.name}.`);
  }

  function saveSessionNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const studentId = String(form.get("studentId") ?? "");
    const takeaways = String(form.get("takeaways") ?? "").trim();
    const theoryFocus = String(form.get("theoryFocus") ?? "");
    const student = assignedMentees.find((mentee) => mentee.id === studentId);
    if (!student || !takeaways) {
      toast.error("Choose an assigned mentee and enter session takeaways.");
      return;
    }
    setSessionNotes((current) => [
      {
        id: `note-${studentId}-${Date.now()}`,
        studentId,
        studentName: student.name,
        date: new Date().toISOString().slice(0, 10),
        takeaways,
        theoryFocus,
      },
      ...current,
    ]);
    setNotesOpen(false);
    toast.success("Session notes saved on this device.");
  }

  const activeProfile = profileStudent;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs uppercase tracking-[0.16em] text-accent">Senior Peer Advisor</p><h1 className="mt-2 font-display text-3xl text-primary">Mentor Management</h1><p className="mt-2 text-muted-foreground">Welcome back, Ama. Your first-year advising community.</p></div>
        <Badge variant="outline">Demo · Sample advising data</Badge>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Active mentees", value: assignedMentees.length, icon: Users },
          { label: "Pending requests", value: pendingCount, icon: ClipboardList },
          { label: "Upcoming check-ins", value: upcomingCheckins.length, icon: CalendarCheck },
        ].map(({ label, value, icon: Icon }) => (
          <article key={label} className="rounded-lg border bg-card p-5">
            <Icon className="mb-3 h-5 w-5 text-teal" />
            <p className="text-3xl font-semibold text-primary">{value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{label}</p>
          </article>
        ))}
      </div>

      <section className="rounded-xl border bg-card p-6 shadow-card">
        <div>
          <h2 className="font-display text-xl text-primary">Incoming Mentee Requests</h2>
          <p className="mt-1 text-sm text-muted-foreground">Review match requests and open a student profile before deciding.</p>
        </div>
        <ul className="mt-4 divide-y">
          {requests.map((request) => (
            <li key={request.id} className="flex flex-wrap items-center gap-4 py-5">
              <div className="min-w-0 flex-1">
                <button type="button" className="text-left font-semibold text-primary underline-offset-4 hover:underline" onClick={() => setProfileStudent(request.student)}>
                  {request.student.name}
                </button>
                <p className="mt-1 text-sm text-muted-foreground">{request.student.major} · {request.student.college} · {request.matchScore}% match</p>
                {request.connectionId && <p className="text-xs text-muted-foreground">Request saved on this device</p>}
              </div>
              <Badge variant="secondary" className={request.status === "accepted" ? "bg-teal-soft text-teal" : request.status === "declined" ? "bg-muted text-muted-foreground" : ""}>{request.status}</Badge>
              {request.status === "pending" && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => changeRequest(request.id, request.connectionId, "accepted")}><Check className="mr-1 h-4 w-4" />Accept</Button>
                  <Button size="sm" variant="outline" onClick={() => changeRequest(request.id, request.connectionId, "declined")}><X className="mr-1 h-4 w-4" />Decline</Button>
                </div>
              )}
            </li>
          ))}
          {!requests.length && <li className="py-8 text-center text-sm text-muted-foreground">No incoming requests right now.</li>}
        </ul>
      </section>

      <section className="rounded-xl border bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-primary">My Assigned Mentees</h2>
            <p className="mt-1 text-sm text-muted-foreground">Active students and their current match information.</p>
          </div>
          <Badge variant="outline">{assignedMentees.length} active</Badge>
        </div>
        <Table className="mt-3">
          <TableHeader>
            <TableRow><TableHead>Student</TableHead><TableHead>Major</TableHead><TableHead>Match</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {assignedMentees.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <button type="button" className="text-left font-medium text-primary underline-offset-4 hover:underline" onClick={() => setProfileStudent(student)}>{student.name}</button>
                  <span className="block text-xs text-muted-foreground">{student.college}</span>
                </TableCell>
                <TableCell>{student.major}</TableCell>
                <TableCell><Badge className="bg-accent-soft text-accent-foreground">{student.matchScore}%</Badge></TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => setScheduleStudent(student)}><CalendarPlus className="mr-1 h-4 w-4" />Schedule Check-in</Button>
                </TableCell>
              </TableRow>
            ))}
            {!assignedMentees.length && <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">Accept an incoming request to add a mentee to your roster.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </section>

      <section className="grid gap-8 border-t pt-6 sm:grid-cols-2">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div><h2 className="font-display text-xl text-primary">Advising Capacity</h2><p className="my-3 text-sm text-muted-foreground">{assignedMentees.length} of {maxCapacity} mentee places filled</p></div>
            <Badge className={assignedMentees.length >= maxCapacity ? "bg-accent-soft text-accent-foreground" : "bg-teal-soft text-teal"}>{assignedMentees.length >= maxCapacity ? "At capacity" : "Available"}</Badge>
          </div>
          <Progress value={Math.min(100, (assignedMentees.length / maxCapacity) * 100)} className="h-2" />
        </div>
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h2 className="font-display text-xl text-primary">Upcoming Check-ins</h2><p className="mt-1 text-sm text-muted-foreground">Plan and review upcoming mentoring sessions.</p></div>
            <Button size="sm" variant="outline" onClick={() => setNotesOpen(true)}><MessageSquareText className="mr-1 h-4 w-4" />Log Session Notes</Button>
          </div>
          <ul className="mt-3 space-y-3">
            {upcomingCheckins.map((checkin) => {
              const student = ADVISOR_STUDENT_PROFILES.find((mentee) => mentee.id === checkin.studentId);
              return (
                <li key={checkin.id} className="rounded-lg border p-3">
                  <p className="text-sm font-medium">{checkin.topic} · <button type="button" className="text-primary underline-offset-4 hover:underline" onClick={() => student && setProfileStudent(student)}>{student?.name ?? "Mentee"}</button></p>
                  <p className="text-sm text-muted-foreground">{checkin.date} · {checkin.time} · Video</p>
                </li>
              );
            })}
            {!upcomingCheckins.length && <li className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">No upcoming check-ins. Schedule one from your mentee roster.</li>}
          </ul>
        </div>
      </section>

      {sessionNotes.length > 0 && (
        <section className="rounded-xl border bg-card p-6 shadow-card">
          <h2 className="font-display text-xl text-primary">Recent Session Notes</h2>
          <ul className="mt-3 space-y-3">
            {sessionNotes.map((note) => (
              <li key={note.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-medium">{note.studentName}</p><Badge variant="outline">{note.date}</Badge></div>
                <p className="mt-2 text-sm text-muted-foreground">{note.takeaways}</p>
                {note.theoryFocus && <p className="mt-2 text-xs text-muted-foreground">Development focus: {note.theoryFocus}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <Sheet open={!!activeProfile} onOpenChange={(open) => { if (!open) setProfileStudent(null); }}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {activeProfile && (
            <>
              <SheetHeader>
                <SheetTitle>{activeProfile.name}</SheetTitle>
                <SheetDescription>{activeProfile.major} · {activeProfile.college} · {activeProfile.matchScore}% match</SheetDescription>
              </SheetHeader>
              <div className="mt-8 space-y-6">
                <section>
                  <h3 className="text-sm font-semibold">Onboarding transition feedback</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{activeProfile.transitionFeedback}</p>
                </section>
                <section>
                  <h3 className="text-sm font-semibold">Academic goals</h3>
                  <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                    {activeProfile.academicGoals.map((goal) => <li key={goal}>{goal}</li>)}
                  </ul>
                </section>
                <section>
                  <h3 className="text-sm font-semibold">Coping and support strategies</h3>
                  <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                    {activeProfile.copingStrategies.map((strategy) => <li key={strategy}>{strategy}</li>)}
                  </ul>
                </section>
                <Button className="w-full" onClick={() => { setProfileStudent(null); setScheduleStudent(activeProfile); }}><CalendarPlus className="mr-2 h-4 w-4" />Schedule Check-in</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
        <DialogContent>
          <form onSubmit={saveSessionNote} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Log Session Notes</DialogTitle>
              <DialogDescription>Capture mentee takeaways, coping strategies, and next steps for your advising records. Notes stay on this device.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="note-student">Mentee</Label>
              <Select name="studentId" required>
                <SelectTrigger id="note-student"><SelectValue placeholder="Choose an assigned mentee" /></SelectTrigger>
                <SelectContent>
                  {assignedMentees.map((student) => <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-takeaways">Meeting takeaways</Label>
              <Textarea id="note-takeaways" name="takeaways" rows={4} required placeholder="Record the student's perspective, strengths, and agreed next steps…" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-focus">Student development focus</Label>
              <Select name="theoryFocus" defaultValue="coping">
                <SelectTrigger id="note-focus"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="coping">Schlossberg: coping resources and transition strategies</SelectItem>
                  <SelectItem value="time-management">Time management and academic routines</SelectItem>
                  <SelectItem value="involvement">Astin: student involvement and campus connection</SelectItem>
                  <SelectItem value="goals">Goal-setting and academic self-efficacy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setNotesOpen(false)}>Cancel</Button>
              <Button type="submit">Save Session Notes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!scheduleStudent} onOpenChange={(open) => { if (!open) setScheduleStudent(null); }}>
        <DialogContent>
          <form onSubmit={scheduleCheckin} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Schedule Check-in</DialogTitle>
              <DialogDescription>{scheduleStudent ? `Plan a mentoring check-in with ${scheduleStudent.name}.` : "Plan an upcoming mentoring check-in."}</DialogDescription>
            </DialogHeader>
            <div className="space-y-2"><Label htmlFor="checkin-topic">Topic</Label><Input id="checkin-topic" name="topic" required placeholder="Study routines, campus resources…" /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="checkin-date">Date</Label><Input id="checkin-date" name="date" type="date" min={new Date().toISOString().slice(0, 10)} required /></div>
              <div className="space-y-2"><Label htmlFor="checkin-time">Time</Label><Input id="checkin-time" name="time" type="time" required /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setScheduleStudent(null)}>Cancel</Button>
              <Button type="submit">Save Check-in</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
