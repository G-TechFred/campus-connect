import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  Activity,
  CalendarClock,
  Check,
  CircleAlert,
  ClipboardCheck,
  Megaphone,
  Plus,
  Settings2,
  ShieldCheck,
  Trash2,
  Users,
  UserRoundCog,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { COLLEGES, SAMPLE_MENTORS, type Mentor } from "@/lib/mentorship-data";
import { SAMPLE_ADMIN_LOGS, SAMPLE_STUDENTS } from "@/lib/mock-data";
import {
  ADMIN_STATE_KEY,
  createDefaultAdminState,
  DEFAULT_DASHBOARD_CONFIGURATION,
  SAMPLE_ADVISOR_PERFORMANCE,
  SAMPLE_CHECKIN_LOGS,
  countCompletedCheckins,
  getCollegeOptions,
  getMatchSuccessRate,
  readAdminState,
  type AdminMetric,
  type AdminPortalState,
  type DashboardConfiguration,
  type ProgramSettings,
  type StudentIntervention,
} from "@/lib/admin-data";

export function Admin() {
  const [adminState, setAdminState] = useState<AdminPortalState>(createDefaultAdminState);
  const [storageReady, setStorageReady] = useState(false);
  const [college, setCollege] = useState("All colleges");
  const [selectedMetric, setSelectedMetric] = useState<AdminMetric | null>(null);
  const [selectedAdvisor, setSelectedAdvisor] = useState<Mentor | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState<ProgramSettings>(
    () => createDefaultAdminState().settings,
  );
  const [dashboardDraft, setDashboardDraft] = useState<DashboardConfiguration>(
    () => createDefaultAdminState().dashboard,
  );
  const [selectedIntervention, setSelectedIntervention] = useState<StudentIntervention | null>(
    null,
  );
  const [interventionDate, setInterventionDate] = useState("");
  const [interventionNote, setInterventionNote] = useState("");
  const collegeOptions = useMemo(getCollegeOptions, []);

  useEffect(() => {
    try {
      setAdminState(readAdminState(window.localStorage.getItem(ADMIN_STATE_KEY)));
    } catch {
      toast.error("Saved admin changes could not be loaded from browser storage.");
    }
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem(ADMIN_STATE_KEY, JSON.stringify(adminState));
    } catch {
      toast.error(
        "Admin changes are available for this session but could not be saved in browser storage.",
      );
    }
  }, [adminState, storageReady]);

  const students = SAMPLE_STUDENTS.filter(
    (student) => college === "All colleges" || student.college === college,
  );
  const advisors = SAMPLE_MENTORS.filter(
    (advisor) => college === "All colleges" || advisor.college === college,
  );
  const activeAdvisors = advisors.filter(
    (advisor) => !adminState.pausedAdvisorKeys.includes(advisor.key),
  ).length;
  const visibleInterventions = adminState.interventions.filter((item) => {
    const student = SAMPLE_STUDENTS.find((row) => row.id === item.studentId);
    return college === "All colleges" || student?.college === college;
  });
  const openInterventions = visibleInterventions.filter((item) => item.status !== "resolved");
  const latestAnnouncement = adminState.settings.announcements.at(-1);

  const metrics = [
    {
      id: "mentees" as const,
      label: "Total Mentees Enrolled",
      value: students.length,
      icon: Users,
    },
    {
      id: "advisors" as const,
      label: "Active Peer Advisors",
      value: activeAdvisors,
      icon: ShieldCheck,
    },
    {
      id: "matches" as const,
      label: "Match Success Rate",
      value: `${getMatchSuccessRate(college)}%`,
      icon: Activity,
    },
    {
      id: "checkins" as const,
      label: "Completed Check-ins",
      value: countCompletedCheckins(college),
      icon: ClipboardCheck,
    },
  ];
  const metricDialogTitle = selectedMetric
    ? (metrics.find((metric) => metric.id === selectedMetric)?.label ?? "Program details")
    : "";
  const menteeRoster = students.map((student) => {
    const assignedAdvisor = SAMPLE_MENTORS.find((mentor) =>
      (adminState.assignments[mentor.key] ?? []).includes(student.id),
    );
    const needsCheckin = visibleInterventions.some(
      (intervention) => intervention.studentId === student.id && intervention.status !== "resolved",
    );
    return {
      student,
      assignedAdvisor,
      status: needsCheckin ? "Needs Check-in" : "On Track",
    };
  });
  const checkinLogs = SAMPLE_CHECKIN_LOGS.filter((log) => {
    const student = SAMPLE_STUDENTS.find((row) => row.id === log.studentId);
    return college === "All colleges" || student?.college === college;
  }).sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));
  const departmentDistribution = COLLEGES.map((department) => ({
    department,
    count: SAMPLE_STUDENTS.filter((student) => student.college === department).length,
  })).filter((row) => row.count > 0);

  function updateAdminState(update: (current: AdminPortalState) => AdminPortalState) {
    setAdminState(update);
  }

  function openSettings() {
    setSettingsDraft(adminState.settings);
    setDashboardDraft(adminState.dashboard);
    setSettingsOpen(true);
  }

  function addDashboardAction() {
    const available = DEFAULT_DASHBOARD_CONFIGURATION.quickActions.find(
      (action) => !dashboardDraft.quickActions.some((current) => current.id === action.id),
    );
    if (!available) {
      toast.info("All available dashboard quick actions are already configured.");
      return;
    }
    setDashboardDraft((current) => ({
      ...current,
      quickActions: [...current.quickActions, { ...available }],
    }));
  }

  function addDashboardMilestone() {
    setDashboardDraft((current) => ({
      ...current,
      milestones: [...current.milestones, { id: `milestone-${Date.now()}`, label: "", week: "" }],
    }));
  }

  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !settingsDraft.termStart ||
      !settingsDraft.termEnd ||
      settingsDraft.termStart > settingsDraft.termEnd
    ) {
      toast.error("Enter a valid term date range.");
      return;
    }
    const announcement = String(new FormData(event.currentTarget).get("announcement") ?? "").trim();
    updateAdminState((current) => ({
      ...current,
      settings: {
        ...settingsDraft,
        announcements: announcement
          ? [...current.settings.announcements, announcement]
          : current.settings.announcements,
      },
      dashboard: dashboardDraft,
    }));
    setSettingsOpen(false);
    toast.success(
      announcement
        ? "Settings saved and announcement broadcast in this demo."
        : "Program settings saved on this device.",
    );
  }

  function assignStudent(advisor: Mentor, studentId: string) {
    const currentAssigned = adminState.assignments[advisor.key] ?? [];
    if (
      studentId &&
      currentAssigned.length >= advisor.capacity &&
      !currentAssigned.includes(studentId)
    ) {
      toast.error(
        "This advisor is at capacity. Remove an assignment before adding another student.",
      );
      return;
    }
    updateAdminState((current) => {
      const assignments = Object.fromEntries(
        Object.entries(current.assignments).map(([key, ids]) => [
          key,
          ids.filter((id) => id !== studentId),
        ]),
      );
      assignments[advisor.key] = studentId
        ? [...(assignments[advisor.key] ?? []), studentId]
        : currentAssigned;
      return { ...current, assignments };
    });
    toast.success(studentId ? "Mentee assignment updated." : "Mentee reassigned.");
  }

  function toggleAdvisorStatus(advisor: Mentor) {
    updateAdminState((current) => ({
      ...current,
      pausedAdvisorKeys: current.pausedAdvisorKeys.includes(advisor.key)
        ? current.pausedAdvisorKeys.filter((key) => key !== advisor.key)
        : [...current.pausedAdvisorKeys, advisor.key],
    }));
    toast.success(
      adminState.pausedAdvisorKeys.includes(advisor.key)
        ? "Advisor returned to active status."
        : "Advisor marked as paused.",
    );
  }

  function resolveIntervention(id: string) {
    updateAdminState((current) => ({
      ...current,
      interventions: current.interventions.map((item) =>
        item.id === id ? { ...item, status: "resolved" } : item,
      ),
    }));
    toast.success("Student alert marked resolved.");
  }

  function scheduleIntervention(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedIntervention || !interventionDate) {
      toast.error("Choose a date for the intervention.");
      return;
    }
    updateAdminState((current) => ({
      ...current,
      interventions: current.interventions.map((item) =>
        item.id === selectedIntervention.id
          ? {
              ...item,
              status: "scheduled",
              scheduledDate: interventionDate,
              note: interventionNote.trim(),
            }
          : item,
      ),
    }));
    setSelectedIntervention(null);
    toast.success("Student intervention scheduled.");
  }

  function openIntervention(item: StudentIntervention) {
    setSelectedIntervention(item);
    setInterventionDate(item.scheduledDate || "");
    setInterventionNote(item.note || "");
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-accent">
            Staff View · Sample Program Data
          </p>
          <h1 className="font-display text-3xl text-primary">Admin Portal</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Program-wide metrics and student support tools. Changes are saved on this device.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-60">
            <Label htmlFor="college-filter" className="sr-only">
              Filter by college
            </Label>
            <Select value={college} onValueChange={setCollege}>
              <SelectTrigger id="college-filter" className="bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {collegeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={openSettings}>
            <Settings2 className="mr-2 h-4 w-4" />
            Manage Program Settings
          </Button>
        </div>
      </header>

      {latestAnnouncement && (
        <div className="flex items-start gap-3 rounded-lg border border-accent/30 bg-accent-soft p-4 text-sm">
          <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <div>
            <span className="font-semibold">Latest announcement:</span> {latestAnnouncement}
          </div>
        </div>
      )}

      <section
        aria-label="Program metrics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <button
              type="button"
              key={metric.id}
              aria-haspopup="dialog"
              onClick={() => setSelectedMetric(metric.id)}
              className="w-full cursor-pointer rounded-xl border bg-card p-5 text-left shadow-card transition hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{metric.label}</span>
                <Icon className="h-5 w-5 text-accent" />
              </div>
              <div className="mt-3 text-3xl font-bold text-primary">{metric.value}</div>
              <div className="mt-2 text-xs text-muted-foreground">
                {college === "All colleges" ? "All colleges" : college} · Click to explore
              </div>
            </button>
          );
        })}
      </section>

      <section className="rounded-xl border bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-primary">Advisor Capacity</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review availability, assigned mentees, and workload by advisor.
            </p>
          </div>
          <Badge variant="outline">{advisors.length} advisors shown</Badge>
        </div>
        <Table className="mt-3">
          <TableHeader>
            <TableRow>
              <TableHead>Advisor</TableHead>
              <TableHead>College</TableHead>
              <TableHead>Focus</TableHead>
              <TableHead className="min-w-44">Load</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {advisors.map((advisor) => {
              const assignedIds = adminState.assignments[advisor.key] ?? [];
              const load = Math.min(assignedIds.length, advisor.capacity);
              const paused = adminState.pausedAdvisorKeys.includes(advisor.key);
              const full = load >= advisor.capacity;
              return (
                <TableRow key={advisor.key}>
                  <TableCell className="font-medium">
                    {advisor.name}
                    <span className="block text-xs font-normal text-muted-foreground">
                      {advisor.year}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{advisor.college}</TableCell>
                  <TableCell>{advisor.backgrounds[0] ?? "General advising"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={(load / advisor.capacity) * 100} className="h-2" />
                      <span className="min-w-8 text-xs tabular-nums">
                        {load}/{advisor.capacity}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        paused
                          ? "bg-muted text-muted-foreground"
                          : full
                            ? "bg-accent-soft text-accent-foreground"
                            : "bg-teal-soft text-teal"
                      }
                    >
                      {paused ? "Paused" : full ? "At capacity" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => setSelectedAdvisor(advisor)}>
                      <UserRoundCog className="mr-1 h-4 w-4" />
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {!advisors.length && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No advisors in this college.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>

      <section className="rounded-xl border bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-primary">
              Student Intervention &amp; Support Alerts
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pulse check-ins and support requests needing follow-up.
            </p>
          </div>
          <Badge variant="outline">{openInterventions.length} open</Badge>
        </div>
        <div className="mt-4 space-y-3">
          {visibleInterventions.map((item) => {
            const student = SAMPLE_STUDENTS.find((row) => row.id === item.studentId);
            if (!student) return null;
            const resolved = item.status === "resolved";
            return (
              <article
                key={item.id}
                className={`rounded-lg border p-4 ${resolved ? "opacity-70" : "border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/10"}`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <CircleAlert
                    className={`mt-0.5 h-5 w-5 shrink-0 ${resolved ? "text-muted-foreground" : "text-amber-600"}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{student.full_name}</h3>
                      <Badge variant="outline">{student.college}</Badge>
                      <Badge
                        className={
                          resolved
                            ? "bg-muted text-muted-foreground"
                            : item.status === "scheduled"
                              ? "bg-teal-soft text-teal"
                              : "bg-accent-soft text-accent-foreground"
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{item.reason}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Pulse check-in: {item.pulseDate}
                      {item.scheduledDate ? ` · Scheduled: ${item.scheduledDate}` : ""}
                      {item.note ? ` · ${item.note}` : ""}
                    </p>
                  </div>
                  {!resolved && (
                    <div className="flex shrink-0 gap-2 sm:flex-col">
                      <Button size="sm" onClick={() => openIntervention(item)}>
                        <CalendarClock className="mr-1 h-4 w-4" />
                        {item.status === "scheduled" ? "Edit Schedule" : "Schedule Intervention"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveIntervention(item.id)}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Mark Resolved
                      </Button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
          {!visibleInterventions.length && (
            <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No student alerts for this college.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6 shadow-card">
        <h2 className="font-display text-xl text-primary">Sample student profiles</h2>
        <Table className="mt-3">
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>College</TableHead>
              <TableHead>Major</TableHead>
              <TableHead>Background</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.full_name}</TableCell>
                <TableCell className="text-muted-foreground">{student.college}</TableCell>
                <TableCell>{student.major}</TableCell>
                <TableCell>{student.backgrounds.join(", ")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="rounded-xl border bg-card p-6 shadow-card">
        <h2 className="font-display text-xl text-primary">Sample program activity</h2>
        <Table className="mt-3">
          <TableHeader>
            <TableRow>
              <TableHead>Activity</TableHead>
              <TableHead>Person</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SAMPLE_ADMIN_LOGS.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.action}</TableCell>
                <TableCell className="font-medium">{entry.actor}</TableCell>
                <TableCell className="text-muted-foreground">{entry.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <Dialog
        open={!!selectedAdvisor}
        onOpenChange={(open) => {
          if (!open) setSelectedAdvisor(null);
        }}
      >
        <DialogContent>
          {selectedAdvisor &&
            (() => {
              const advisor = selectedAdvisor;
              const assignedIds = adminState.assignments[advisor.key] ?? [];
              const paused = adminState.pausedAdvisorKeys.includes(advisor.key);
              return (
                <>
                  <DialogHeader>
                    <DialogTitle>Manage {advisor.name}</DialogTitle>
                    <DialogDescription>
                      {advisor.year} · {advisor.college} · {advisor.major}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="rounded-lg bg-muted/50 p-3 text-sm">
                      <div className="flex justify-between">
                        <span>Current mentees</span>
                        <span className="font-medium">
                          {assignedIds.length} / {advisor.capacity}
                        </span>
                      </div>
                      <Progress
                        value={
                          (Math.min(assignedIds.length, advisor.capacity) / advisor.capacity) * 100
                        }
                        className="mt-2 h-2"
                      />
                      <p className="mt-2 text-muted-foreground">
                        {assignedIds.length
                          ? assignedIds
                              .map(
                                (id) =>
                                  SAMPLE_STUDENTS.find((student) => student.id === id)?.full_name,
                              )
                              .filter(Boolean)
                              .join(", ")
                          : "No mentees assigned."}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reassign-student">Reassign a mentee to this advisor</Label>
                      <Select onValueChange={(studentId) => assignStudent(advisor, studentId)}>
                        <SelectTrigger id="reassign-student">
                          <SelectValue placeholder="Choose a student" />
                        </SelectTrigger>
                        <SelectContent>
                          {SAMPLE_STUDENTS.map((student) => (
                            <SelectItem
                              key={student.id}
                              value={student.id}
                              disabled={
                                assignedIds.length >= advisor.capacity &&
                                !assignedIds.includes(student.id)
                              }
                            >
                              {student.full_name} · {student.college}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        A reassignment removes the student from their previous advisor. Capacity
                        limits are enforced.
                      </p>
                    </div>
                    <Button
                      variant={paused ? "default" : "outline"}
                      className="w-full"
                      onClick={() => toggleAdvisorStatus(advisor)}
                    >
                      {paused ? "Reactivate Advisor" : "Pause New Assignments"}
                    </Button>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setSelectedAdvisor(null)}>
                      Done
                    </Button>
                  </DialogFooter>
                </>
              );
            })()}
        </DialogContent>
      </Dialog>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <form onSubmit={saveSettings} className="space-y-5">
            <DialogHeader>
              <DialogTitle>Manage Program Settings</DialogTitle>
              <DialogDescription>
                Configure matching, term dates, dashboard content, and program-wide announcements
                for this demo.
              </DialogDescription>
            </DialogHeader>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Mentor matching algorithm</legend>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3">
                <input
                  type="radio"
                  name="algorithm"
                  checked={settingsDraft.matchingAlgorithm === "balanced"}
                  onChange={() =>
                    setSettingsDraft((current) => ({ ...current, matchingAlgorithm: "balanced" }))
                  }
                />
                <span>
                  <span className="block text-sm font-medium">Balanced compatibility</span>
                  <span className="text-xs text-muted-foreground">
                    Use academic, background, interest, and language fit.
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3">
                <input
                  type="radio"
                  name="algorithm"
                  checked={settingsDraft.matchingAlgorithm === "college-first"}
                  onChange={() =>
                    setSettingsDraft((current) => ({
                      ...current,
                      matchingAlgorithm: "college-first",
                    }))
                  }
                />
                <span>
                  <span className="block text-sm font-medium">College-first matching</span>
                  <span className="text-xs text-muted-foreground">
                    Prioritize mentors in the mentee's college.
                  </span>
                </span>
              </label>
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="term-start">Term start</Label>
                <Input
                  id="term-start"
                  type="date"
                  value={settingsDraft.termStart}
                  onChange={(event) =>
                    setSettingsDraft((current) => ({ ...current, termStart: event.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="term-end">Term end</Label>
                <Input
                  id="term-end"
                  type="date"
                  value={settingsDraft.termEnd}
                  onChange={(event) =>
                    setSettingsDraft((current) => ({ ...current, termEnd: event.target.value }))
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcement">Broadcast announcement (optional)</Label>
              <Textarea
                id="announcement"
                name="announcement"
                rows={3}
                placeholder="Share a program update with all mentors and mentees…"
              />
              <p className="text-xs text-muted-foreground">
                In this client-only demo, the announcement is shown in this portal and stored on
                this device.
              </p>
            </div>
            <section className="space-y-3 border-t pt-4">
              <div>
                <h3 className="text-sm font-semibold">Student dashboard quick actions</h3>
                <p className="text-xs text-muted-foreground">
                  Update the labels and supporting text students see on their dashboard.
                </p>
              </div>
              <div className="space-y-3">
                {dashboardDraft.quickActions.map((action, index) => (
                  <div
                    key={action.id}
                    className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_auto]"
                  >
                    <div className="space-y-1">
                      <Label htmlFor={`dashboard-action-${action.id}`}>
                        {action.id === "book"
                          ? "Advising"
                          : action.id === "resources"
                            ? "Resources"
                            : action.id === "milestones"
                              ? "Checklist"
                              : "Feedback"}{" "}
                        action
                      </Label>
                      <Input
                        id={`dashboard-action-${action.id}`}
                        value={action.label}
                        onChange={(event) =>
                          setDashboardDraft((current) => ({
                            ...current,
                            quickActions: current.quickActions.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, label: event.target.value } : item,
                            ),
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`dashboard-action-description-${action.id}`}>
                        Description
                      </Label>
                      <Input
                        id={`dashboard-action-description-${action.id}`}
                        value={action.description}
                        onChange={(event) =>
                          setDashboardDraft((current) => ({
                            ...current,
                            quickActions: current.quickActions.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, description: event.target.value }
                                : item,
                            ),
                          }))
                        }
                        required
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="self-end"
                      aria-label={`Remove ${action.label} quick action`}
                      onClick={() =>
                        setDashboardDraft((current) => ({
                          ...current,
                          quickActions: current.quickActions.filter(
                            (item) => item.id !== action.id,
                          ),
                        }))
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addDashboardAction}>
                <Plus className="mr-2 h-4 w-4" />
                Add Quick Action
              </Button>
            </section>
            <section className="space-y-3 border-t pt-4">
              <div>
                <h3 className="text-sm font-semibold">Transition milestone checklist</h3>
                <p className="text-xs text-muted-foreground">
                  Edit the checklist labels and term week shown to students.
                </p>
              </div>
              <div className="space-y-3">
                {dashboardDraft.milestones.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_8rem_auto]"
                  >
                    <div className="space-y-1">
                      <Label htmlFor={`dashboard-milestone-${milestone.id}`}>Milestone</Label>
                      <Input
                        id={`dashboard-milestone-${milestone.id}`}
                        value={milestone.label}
                        onChange={(event) =>
                          setDashboardDraft((current) => ({
                            ...current,
                            milestones: current.milestones.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, label: event.target.value } : item,
                            ),
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`dashboard-milestone-week-${milestone.id}`}>Week</Label>
                      <Input
                        id={`dashboard-milestone-week-${milestone.id}`}
                        value={milestone.week}
                        onChange={(event) =>
                          setDashboardDraft((current) => ({
                            ...current,
                            milestones: current.milestones.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, week: event.target.value } : item,
                            ),
                          }))
                        }
                        required
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="self-end"
                      aria-label={`Remove milestone ${index + 1}`}
                      onClick={() =>
                        setDashboardDraft((current) => ({
                          ...current,
                          milestones: current.milestones.filter((item) => item.id !== milestone.id),
                        }))
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addDashboardMilestone}>
                <Plus className="mr-2 h-4 w-4" />
                Add Milestone
              </Button>
            </section>
            <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
              Campus resources are managed in the Resource Hub.{" "}
              <a className="font-medium text-accent underline underline-offset-2" href="/resources">
                Open Resource Hub
              </a>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSettingsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Megaphone className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedIntervention}
        onOpenChange={(open) => {
          if (!open) setSelectedIntervention(null);
        }}
      >
        <DialogContent>
          <form onSubmit={scheduleIntervention} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Schedule Student Intervention</DialogTitle>
              <DialogDescription>
                {selectedIntervention
                  ? SAMPLE_STUDENTS.find((student) => student.id === selectedIntervention.studentId)
                      ?.full_name
                  : "Choose a follow-up date and add a note."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="intervention-date">Follow-up date</Label>
              <Input
                id="intervention-date"
                type="date"
                value={interventionDate}
                onChange={(event) => setInterventionDate(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="intervention-note">Support plan / note</Label>
              <Textarea
                id="intervention-note"
                value={interventionNote}
                onChange={(event) => setInterventionNote(event.target.value)}
                rows={3}
                placeholder="Add a short follow-up plan…"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSelectedIntervention(null)}>
                Cancel
              </Button>
              <Button type="submit">
                <CalendarClock className="mr-2 h-4 w-4" />
                Save Schedule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedMetric}
        onOpenChange={(open) => {
          if (!open) setSelectedMetric(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-primary">
              {metricDialogTitle}
            </DialogTitle>
            <DialogDescription>
              {college === "All colleges" ? "Program-wide" : college} · Illustrative local demo data
            </DialogDescription>
          </DialogHeader>

          {selectedMetric === "mentees" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Enrolled first-year mentees, their current advisor assignment, and support status.
              </p>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Mentee</TableHead>
                      <TableHead>Major</TableHead>
                      <TableHead>Assigned advisor</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {menteeRoster.map(({ student, assignedAdvisor, status }) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-mono text-xs">
                          {student.id.toUpperCase()}
                        </TableCell>
                        <TableCell className="font-medium">{student.full_name}</TableCell>
                        <TableCell>{student.major}</TableCell>
                        <TableCell>
                          {assignedAdvisor?.name ?? (
                            <span className="text-muted-foreground">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              status === "On Track"
                                ? "bg-teal-soft text-teal"
                                : "bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
                            }
                          >
                            {status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!menteeRoster.length && (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                          No mentees match this college filter.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {selectedMetric === "advisors" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Active peer advisor directory with current assignments and sample mentee feedback
                ratings.
              </p>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Advisor</TableHead>
                      <TableHead>Leadership role</TableHead>
                      <TableHead>Mentee load</TableHead>
                      <TableHead>Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {advisors
                      .filter((advisor) => !adminState.pausedAdvisorKeys.includes(advisor.key))
                      .map((advisor) => {
                        const count = (adminState.assignments[advisor.key] ?? []).length;
                        const performance = SAMPLE_ADVISOR_PERFORMANCE[advisor.key];
                        return (
                          <TableRow key={advisor.key}>
                            <TableCell>
                              <span className="font-medium">{advisor.name}</span>
                              <span className="block text-xs text-muted-foreground">
                                {advisor.year} · {advisor.college}
                              </span>
                            </TableCell>
                            <TableCell>{performance?.leadershipRole ?? "Peer Advisor"}</TableCell>
                            <TableCell>
                              <span className="tabular-nums">
                                {count}/{advisor.capacity}
                              </span>
                              <span className="ml-2 text-xs text-muted-foreground">active</span>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold">
                                {performance?.rating.toFixed(1) ?? "—"}
                              </span>
                              <span className="text-muted-foreground">/5.0</span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    {!advisors.some(
                      (advisor) => !adminState.pausedAdvisorKeys.includes(advisor.key),
                    ) && (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                          No active advisors match this college filter.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {selectedMetric === "matches" && (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <article className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">Successful match outcomes</p>
                  <p className="mt-1 text-2xl font-bold text-primary">
                    {getMatchSuccessRate(college)}%
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Sample requests matched within the program reporting window.
                  </p>
                </article>
                <article className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">Cohort compatibility alignment</p>
                  <p className="mt-1 text-2xl font-bold text-primary">96.4%</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Illustrative demo indicator using academic interest and college-fit signals.
                  </p>
                </article>
              </div>
              <section>
                <h3 className="mb-3 text-sm font-semibold text-primary">
                  Mentee department distribution
                </h3>
                <div className="space-y-3">
                  {departmentDistribution.map(({ department, count }) => (
                    <div
                      key={department}
                      className="grid grid-cols-[minmax(0,1fr)_2fr_auto] items-center gap-3 text-sm"
                    >
                      <span className="truncate">{department}</span>
                      <Progress
                        value={students.length ? (count / students.length) * 100 : 0}
                        className="h-2"
                      />
                      <span className="w-6 text-right tabular-nums text-muted-foreground">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <h3 className="mb-2 text-sm font-semibold text-primary">
                  Recent program feedback and activity
                </h3>
                <ul className="divide-y rounded-lg border">
                  {SAMPLE_ADMIN_LOGS.slice(0, 3).map((entry) => (
                    <li
                      key={entry.id}
                      className="flex flex-wrap justify-between gap-2 px-3 py-2.5 text-sm"
                    >
                      <span>
                        {entry.action} · <span className="font-medium">{entry.actor}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">{entry.date}</span>
                    </li>
                  ))}
                </ul>
              </section>
              <p className="text-xs text-muted-foreground">
                The active matching strategy is{" "}
                {adminState.settings.matchingAlgorithm === "college-first"
                  ? "college-first"
                  : "balanced compatibility"}
                .
              </p>
            </div>
          )}

          {selectedMetric === "checkins" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Recent completed advisor and mentee sessions with demo completion signatures.
              </p>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date &amp; time</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Advisor</TableHead>
                      <TableHead>Meeting type &amp; note</TableHead>
                      <TableHead>Completion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {checkinLogs.map((log) => {
                      const student = SAMPLE_STUDENTS.find((row) => row.id === log.studentId);
                      const advisor = SAMPLE_MENTORS.find((row) => row.key === log.advisorKey);
                      return (
                        <TableRow key={log.id}>
                          <TableCell className="whitespace-nowrap text-xs">
                            {new Date(log.occurredAt).toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </TableCell>
                          <TableCell className="font-medium">
                            {student?.full_name ?? "Student"}
                          </TableCell>
                          <TableCell>{advisor?.name ?? log.signature}</TableCell>
                          <TableCell>
                            <span className="font-medium">{log.type}</span>
                            <span className="block max-w-xs text-xs text-muted-foreground">
                              {log.note}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className="whitespace-nowrap bg-teal-soft text-teal">
                              <Check className="mr-1 h-3 w-3" />
                              {log.signature} · Verified
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {!checkinLogs.length && (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                          No completed check-ins match this college filter.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSelectedMetric(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
