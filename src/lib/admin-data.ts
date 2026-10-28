import { COLLEGES, MILESTONES, RESOURCES, type CampusResource } from "./mentorship-data";
import { SAMPLE_STUDENTS } from "./mock-data";
import { readCampusResources } from "./resource-data";

export const ADMIN_STATE_KEY = "fred-admin-portal-v1";

export type AdminMetric = "mentees" | "advisors" | "matches" | "checkins";
export type InterventionStatus = "flagged" | "scheduled" | "resolved";

export type StudentIntervention = {
  id: string;
  studentId: string;
  reason: string;
  pulseDate: string;
  status: InterventionStatus;
  scheduledDate: string;
  note: string;
};

export type ProgramSettings = {
  matchingAlgorithm: "balanced" | "college-first";
  termStart: string;
  termEnd: string;
  announcements: string[];
};

export type DashboardQuickAction = {
  id: "book" | "resources" | "milestones" | "feedback";
  label: string;
  description: string;
};

export type DashboardMilestone = {
  id: string;
  label: string;
  week: string;
};

export type DashboardConfiguration = {
  quickActions: DashboardQuickAction[];
  milestones: DashboardMilestone[];
};

export type AdminPortalState = {
  assignments: Record<string, string[]>;
  pausedAdvisorKeys: string[];
  interventions: StudentIntervention[];
  settings: ProgramSettings;
  dashboard: DashboardConfiguration;
  resources: CampusResource[];
};

export const SAMPLE_ASSIGNMENTS: Record<string, string[]> = {
  "s-ama": ["student-01"],
  "s-daniel": ["student-02"],
  "s-priya": ["student-03"],
  "s-marcus": [],
  "s-sofia": [],
  "s-kwame": [],
  "s-lena": ["student-04"],
};

export const SAMPLE_INTERVENTIONS: StudentIntervention[] = [
  {
    id: "alert-01",
    studentId: "student-02",
    reason: "Two missed pulse check-ins; student reported difficulty finding community.",
    pulseDate: "2026-10-20",
    status: "flagged",
    scheduledDate: "",
    note: "",
  },
  {
    id: "alert-02",
    studentId: "student-03",
    reason: "Reported academic stress and has not met with an advisor this month.",
    pulseDate: "2026-10-22",
    status: "flagged",
    scheduledDate: "",
    note: "",
  },
  {
    id: "alert-03",
    studentId: "student-04",
    reason: "Requested support navigating campus resources.",
    pulseDate: "2026-10-18",
    status: "scheduled",
    scheduledDate: "2026-10-29",
    note: "Resource navigation check-in",
  },
];

export const SAMPLE_MATCH_OUTCOMES: Record<string, { matched: number; requests: number }> = {
  "College of Business": { matched: 9, requests: 10 },
  "College of Engineering": { matched: 8, requests: 10 },
  "College of Arts & Sciences": { matched: 7, requests: 8 },
  "College of Health Sciences": { matched: 9, requests: 10 },
  "College of Education": { matched: 8, requests: 9 },
};

export const SAMPLE_CHECKINS = [
  { id: "checkin-01", college: "College of Business", completed: true },
  { id: "checkin-02", college: "College of Business", completed: true },
  { id: "checkin-03", college: "College of Engineering", completed: true },
  { id: "checkin-04", college: "College of Engineering", completed: false },
  { id: "checkin-05", college: "College of Arts & Sciences", completed: true },
  { id: "checkin-06", college: "College of Health Sciences", completed: true },
  { id: "checkin-07", college: "College of Education", completed: true },
  { id: "checkin-08", college: "College of Education", completed: false },
] as const;

export const SAMPLE_CHECKIN_LOGS = [
  { id: "log-01", studentId: "student-01", advisorKey: "s-ama", occurredAt: "2026-10-27T15:00:00", type: "Academic Advising", note: "Reviewed weekly study blocks and course planning.", signature: "Ama Owusu" },
  { id: "log-02", studentId: "student-01", advisorKey: "s-ama", occurredAt: "2026-10-24T11:30:00", type: "Peer Mentoring Session", note: "Discussed campus belonging and student organization options.", signature: "Ama Owusu" },
  { id: "log-03", studentId: "student-03", advisorKey: "s-priya", occurredAt: "2026-10-26T14:00:00", type: "Academic Advising", note: "Set a plan for office hours and project milestones.", signature: "Akosua Appiah" },
  { id: "log-04", studentId: "student-05", advisorKey: "s-marcus", occurredAt: "2026-10-25T09:30:00", type: "Peer Mentoring Session", note: "Checked progress on first-generation student support resources.", signature: "Kofi Boateng" },
  { id: "log-05", studentId: "student-02", advisorKey: "s-daniel", occurredAt: "2026-10-23T13:00:00", type: "Academic Advising", note: "Reviewed public health course workload and study routine.", signature: "Daniel Mensah" },
  { id: "log-06", studentId: "student-04", advisorKey: "s-lena", occurredAt: "2026-10-22T16:15:00", type: "Peer Mentoring Session", note: "Discussed campus connections and education program goals.", signature: "Kwabena Owusu" },
] as const;

export const SAMPLE_ADVISOR_PERFORMANCE: Record<string, { leadershipRole: string; rating: number }> = {
  "s-ama": { leadershipRole: "Peer Mentor Lead", rating: 4.9 },
  "s-daniel": { leadershipRole: "Student Success Ambassador", rating: 4.8 },
  "s-priya": { leadershipRole: "Academic Peer Coach", rating: 4.9 },
  "s-marcus": { leadershipRole: "Wellbeing Peer Advocate", rating: 4.7 },
  "s-sofia": { leadershipRole: "Transfer Student Liaison", rating: 4.8 },
  "s-kwame": { leadershipRole: "First-Generation Circle Lead", rating: 5.0 },
  "s-lena": { leadershipRole: "Campus Engagement Mentor", rating: 4.9 },
};

export const DEFAULT_PROGRAM_SETTINGS: ProgramSettings = {
  matchingAlgorithm: "balanced",
  termStart: "2026-08-24",
  termEnd: "2026-12-18",
  announcements: [],
};

export const DEFAULT_DASHBOARD_CONFIGURATION: DashboardConfiguration = {
  quickActions: [
    { id: "book", label: "Book Advising Session", description: "Find a time to meet with an advisor." },
    { id: "resources", label: "View Campus Resources", description: "Explore support and services on campus." },
    { id: "milestones", label: "Transition Checklist", description: "Track important steps throughout the term." },
    { id: "feedback", label: "Submit Feedback", description: "Share how your mentorship is going." },
  ],
  milestones: MILESTONES.map((milestone) => ({ ...milestone })),
};

export function createDefaultAdminState(): AdminPortalState {
  return {
    assignments: Object.fromEntries(
      Object.entries(SAMPLE_ASSIGNMENTS).map(([key, ids]) => [key, [...ids]]),
    ),
    pausedAdvisorKeys: [],
    interventions: SAMPLE_INTERVENTIONS.map((item) => ({ ...item })),
    settings: { ...DEFAULT_PROGRAM_SETTINGS, announcements: [] },
    dashboard: {
      quickActions: DEFAULT_DASHBOARD_CONFIGURATION.quickActions.map((action) => ({ ...action })),
      milestones: DEFAULT_DASHBOARD_CONFIGURATION.milestones.map((milestone) => ({ ...milestone })),
    },
    resources: RESOURCES.map((resource) => ({ ...resource, services: [...resource.services] })),
  };
}

export function readAdminState(serialized: string | null): AdminPortalState {
  const defaults = createDefaultAdminState();
  if (!serialized) return defaults;

  try {
    const saved: unknown = JSON.parse(serialized);
    if (!saved || typeof saved !== "object") return defaults;
    const value = saved as Partial<AdminPortalState>;
    const settings = value.settings;
    const dashboard = value.dashboard;
    const assignments =
      value.assignments && typeof value.assignments === "object"
        ? Object.fromEntries(
            Object.entries(value.assignments)
              .filter(
                (entry): entry is [string, string[]] =>
                  Array.isArray(entry[1]) && entry[1].every((id) => typeof id === "string"),
              )
              .map(([key, ids]) => [key, ids.filter((id) => SAMPLE_STUDENTS.some((student) => student.id === id))]),
          )
        : defaults.assignments;
    const interventions = Array.isArray(value.interventions)
      ? value.interventions.filter(
          (item): item is StudentIntervention =>
            !!item &&
            typeof item.id === "string" &&
            SAMPLE_STUDENTS.some((student) => student.id === item.studentId) &&
            ["flagged", "scheduled", "resolved"].includes(item.status) &&
            typeof item.reason === "string" &&
            typeof item.pulseDate === "string" &&
            typeof item.scheduledDate === "string" &&
            typeof item.note === "string",
        )
      : defaults.interventions;
    return {
      assignments,
      pausedAdvisorKeys: Array.isArray(value.pausedAdvisorKeys)
        ? value.pausedAdvisorKeys.filter((key): key is string => typeof key === "string")
        : defaults.pausedAdvisorKeys,
      interventions,
      settings: {
        matchingAlgorithm:
          settings?.matchingAlgorithm === "college-first" ? "college-first" : "balanced",
        termStart:
          typeof settings?.termStart === "string" ? settings.termStart : defaults.settings.termStart,
        termEnd: typeof settings?.termEnd === "string" ? settings.termEnd : defaults.settings.termEnd,
        announcements: Array.isArray(settings?.announcements)
          ? settings.announcements.filter((text): text is string => typeof text === "string")
          : [],
      },
      dashboard: {
        quickActions: Array.isArray(dashboard?.quickActions)
          ? dashboard.quickActions.filter(
              (action): action is DashboardQuickAction =>
                !!action &&
                ["book", "resources", "milestones", "feedback"].includes(action.id) &&
                typeof action.label === "string" &&
                typeof action.description === "string",
            )
          : DEFAULT_DASHBOARD_CONFIGURATION.quickActions.map((action) => ({ ...action })),
        milestones: Array.isArray(dashboard?.milestones)
          ? dashboard.milestones.filter(
              (milestone): milestone is DashboardMilestone =>
                !!milestone &&
                typeof milestone.id === "string" &&
                typeof milestone.label === "string" &&
                typeof milestone.week === "string",
            )
          : DEFAULT_DASHBOARD_CONFIGURATION.milestones.map((milestone) => ({ ...milestone })),
      },
      resources: Array.isArray(value.resources)
        ? readCampusResources(JSON.stringify(value.resources))
        : defaults.resources,
    };
  } catch {
    return defaults;
  }
}

export function getCollegeOptions() {
  return ["All colleges", ...COLLEGES];
}

export function countCompletedCheckins(college: string) {
  return SAMPLE_CHECKINS.filter(
    (checkin) => checkin.completed && (college === "All colleges" || checkin.college === college),
  ).length;
}

export function getMatchSuccessRate(college: string) {
  const outcomes = Object.entries(SAMPLE_MATCH_OUTCOMES).filter(
    ([name]) => college === "All colleges" || name === college,
  );
  const totals = outcomes.reduce(
    (result, [, value]) => ({
      matched: result.matched + value.matched,
      requests: result.requests + value.requests,
    }),
    { matched: 0, requests: 0 },
  );
  return totals.requests ? Math.round((totals.matched / totals.requests) * 100) : 0;
}
