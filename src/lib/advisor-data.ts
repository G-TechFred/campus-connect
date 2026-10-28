import { DEFAULT_GUEST_PROFILE, type GuestConnection, type GuestProfile } from "./guest-matching";
import { SAMPLE_STUDENTS } from "./mock-data";

export const ADVISOR_STATE_KEY = "fred-advisor-management-v1";
export const ADVISOR_NOTES_KEY = "fred-advisor-session-notes-v1";

export type AdvisorStudent = {
  id: string;
  name: string;
  major: string;
  college: string;
  matchScore: number;
  transitionFeedback: string;
  academicGoals: string[];
  copingStrategies: string[];
};

export type AdvisorRequest = {
  id: string;
  studentId: string;
  student: AdvisorStudent;
  matchScore: number;
  status: "pending" | "accepted" | "declined";
  connectionId?: string;
};

export type AdvisorLocalState = {
  requestStatuses: Record<string, "accepted" | "declined">;
  checkins: AdvisorCheckin[];
};

export type AdvisorCheckin = {
  id: string;
  studentId: string;
  date: string;
  time: string;
  topic: string;
};

export type AdvisorSessionNote = {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  takeaways: string;
  theoryFocus: string;
};

export const ADVISOR_STUDENTS: AdvisorStudent[] = [
  {
    id: "student-01",
    name:
      SAMPLE_STUDENTS.find((student) => student.id === "student-01")?.full_name ?? "Kwame Mensah",
    major: "Business Administration",
    college: "College of Business",
    matchScore: 100,
    transitionFeedback:
      "Finding the campus routine exciting, but still adjusting to asking for help and navigating office hours.",
    academicGoals: [
      "Build a consistent weekly study plan",
      "Explore an entrepreneurship internship",
    ],
    copingStrategies: [
      "Break large assignments into weekly milestones",
      "Use peer study sessions and faculty office hours",
    ],
  },
  {
    id: "student-akosua",
    name: "Akosua Appiah",
    major: "Accounting",
    college: "College of Business",
    matchScore: 85,
    transitionFeedback:
      "Feels confident socially and wants more structure around workload during exam weeks.",
    academicGoals: ["Improve exam preparation routines", "Join the student accounting association"],
    copingStrategies: [
      "Schedule short, regular review blocks",
      "Balance study time with restorative breaks",
    ],
  },
  {
    id: "student-active-01",
    name: "Esi Mensah",
    major: "Marketing",
    college: "College of Business",
    matchScore: 92,
    transitionFeedback:
      "Settling into campus life and building confidence connecting coursework to career interests.",
    academicGoals: [
      "Meet with a faculty advisor about course planning",
      "Practice networking with alumni",
    ],
    copingStrategies: [
      "Set one manageable weekly connection goal",
      "Reflect on progress at monthly check-ins",
    ],
  },
];

export const SAMPLE_ADVISOR_REQUESTS: AdvisorRequest[] = ADVISOR_STUDENTS.filter(
  (student) => student.id !== "student-active-01",
).map((student) => ({
  id: `advisor-request-${student.id}`,
  studentId: student.id,
  student,
  matchScore: student.matchScore,
  status: "pending" as const,
}));

export const INITIAL_ADVISOR_CHECKINS: AdvisorCheckin[] = [
  {
    id: "checkin-godfred",
    studentId: "student-01",
    date: "2026-10-29",
    time: "4:00 PM",
    topic: "Building a study routine",
  },
  {
    id: "checkin-esi",
    studentId: "student-active-01",
    date: "2026-10-30",
    time: "2:30 PM",
    topic: "Career exploration check-in",
  },
];

export const ADVISOR_STUDENT_PROFILES: AdvisorStudent[] = [
  ...ADVISOR_STUDENTS,
  {
    ...DEFAULT_GUEST_PROFILE,
    id: DEFAULT_GUEST_PROFILE.id,
    name: DEFAULT_GUEST_PROFILE.full_name,
    major: DEFAULT_GUEST_PROFILE.major ?? "Undeclared",
    college: DEFAULT_GUEST_PROFILE.college ?? "Undeclared",
    matchScore: 100,
    transitionFeedback: "A first-year student exploring campus resources and peer support.",
    academicGoals: [
      "Complete the first semester successfully",
      "Build confidence using campus resources",
    ],
    copingStrategies: ["Reach out to a peer mentor", "Create a weekly routine with time for rest"],
  },
];

export function createDefaultAdvisorState(): AdvisorLocalState {
  return {
    requestStatuses: {},
    checkins: INITIAL_ADVISOR_CHECKINS.map((checkin) => ({ ...checkin })),
  };
}

export function readAdvisorState(serialized: string | null): AdvisorLocalState {
  const defaults = createDefaultAdvisorState();
  if (!serialized) return defaults;
  try {
    const parsed: unknown = JSON.parse(serialized);
    if (!parsed || typeof parsed !== "object") return defaults;
    const value = parsed as Partial<AdvisorLocalState>;
    const requestStatuses =
      value.requestStatuses && typeof value.requestStatuses === "object"
        ? Object.fromEntries(
            Object.entries(value.requestStatuses).filter(
              (entry): entry is [string, "accepted" | "declined"] =>
                entry[1] === "accepted" || entry[1] === "declined",
            ),
          )
        : {};
    const checkins = Array.isArray(value.checkins)
      ? value.checkins.filter(
          (item): item is AdvisorCheckin =>
            !!item &&
            typeof item.id === "string" &&
            typeof item.studentId === "string" &&
            ADVISOR_STUDENT_PROFILES.some((student) => student.id === item.studentId) &&
            typeof item.date === "string" &&
            typeof item.time === "string" &&
            typeof item.topic === "string",
        )
      : defaults.checkins;
    return { requestStatuses, checkins };
  } catch {
    return defaults;
  }
}

export function readAdvisorNotes(serialized: string | null): AdvisorSessionNote[] {
  if (!serialized) return [];
  try {
    const parsed: unknown = JSON.parse(serialized);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is AdvisorSessionNote =>
          !!item &&
          typeof item.id === "string" &&
          typeof item.studentId === "string" &&
          typeof item.studentName === "string" &&
          typeof item.date === "string" &&
          typeof item.takeaways === "string" &&
          typeof item.theoryFocus === "string",
      )
      .map((note) =>
        note.studentId === "student-01" && note.studentName === "Godfred A."
          ? {
              ...note,
              studentName:
                SAMPLE_STUDENTS.find((student) => student.id === "student-01")?.full_name ??
                "Kwame Mensah",
            }
          : note,
      );
  } catch {
    return [];
  }
}

export function getIncomingConnectionStudent(
  connection: GuestConnection,
  profile: GuestProfile,
): AdvisorStudent {
  const known = ADVISOR_STUDENT_PROFILES.find((student) => student.id === profile.id);
  return (
    known ?? {
      id: profile.id,
      name: profile.full_name,
      major: profile.major ?? "Undeclared",
      college: profile.college ?? "Undeclared",
      matchScore: connection.match_score,
      transitionFeedback:
        profile.bio || "New mentee preview profile. Transition feedback has not been added yet.",
      academicGoals: profile.interests.length
        ? profile.interests.map((interest) => `Explore ${interest}`)
        : ["Set an academic goal for this term"],
      copingStrategies: [
        "Create a manageable weekly routine",
        "Connect with campus and peer support",
      ],
    }
  );
}

export function getAdvisorRequests(
  state: AdvisorLocalState,
  connections: GuestConnection[],
  guestProfile: GuestProfile,
): AdvisorRequest[] {
  const sampleRequests = SAMPLE_ADVISOR_REQUESTS.map((request) => ({
    ...request,
    status: state.requestStatuses[request.id] ?? request.status,
  }));
  const guestRequests = connections.map((connection) => ({
    id: `connection-${connection.id}`,
    studentId: connection.mentee_id,
    student: getIncomingConnectionStudent(connection, guestProfile),
    matchScore: connection.match_score,
    status: connection.status,
    connectionId: connection.id,
  }));
  const guestStudentIds = new Set(guestRequests.map((request) => request.studentId));
  const guestStudentNames = new Set(
    guestRequests.map((request) => request.student.name.trim().toLowerCase()),
  );
  return [
    ...guestRequests,
    ...sampleRequests.filter(
      (request) =>
        !guestStudentIds.has(request.studentId) &&
        !guestStudentNames.has(request.student.name.trim().toLowerCase()),
    ),
  ];
}

export function getAssignedAdvisorMentees(requests: AdvisorRequest[]): AdvisorStudent[] {
  const acceptedRequests = requests
    .filter((request) => request.status === "accepted")
    .map((request) => request.student);
  const activeStudent = ADVISOR_STUDENT_PROFILES.find(
    (student) => student.id === "student-active-01",
  );
  const rows = activeStudent ? [activeStudent, ...acceptedRequests] : acceptedRequests;
  return [...new Map(rows.map((student) => [student.id, student])).values()];
}

export function updateRequestStatus(
  current: AdvisorLocalState,
  requestId: string,
  status: "accepted" | "declined",
): AdvisorLocalState {
  return { ...current, requestStatuses: { ...current.requestStatuses, [requestId]: status } };
}
