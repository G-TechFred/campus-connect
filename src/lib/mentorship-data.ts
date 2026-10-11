export type Mentor = {
  key: string;
  id?: string; // real account id when the mentor signed up
  name: string;
  initials: string;
  year: string;
  college: string;
  major: string;
  languages: string[];
  backgrounds: string[];
  interests: string[];
  bio: string;
  capacity: number;
};

export type MenteeProfile = {
  major?: string | null;
  college?: string | null;
  languages?: string[];
  backgrounds?: string[];
  interests?: string[];
};

export const COLLEGES = [
  "College of Business",
  "College of Engineering",
  "College of Arts & Sciences",
  "College of Health Sciences",
  "College of Education",
];

export const BACKGROUNDS = [
  "First-Generation Advocate",
  "International Student Support",
  "Transfer Student",
  "Student-Athlete",
  "Commuter Student",
  "LGBTQ+ Ally",
];

export const SAMPLE_MENTORS: Mentor[] = [
  {
    key: "s-ama",
    name: "Ama Owusu",
    initials: "AO",
    year: "Senior",
    college: "College of Business",
    major: "Business Administration",
    languages: ["English", "Twi"],
    backgrounds: ["First-Generation Advocate"],
    interests: ["Entrepreneurship", "Consulting", "Finance"],
    bio: "First in my family to attend university. I help new students navigate financial aid, internships and imposter syndrome.",
    capacity: 2,
  },
  {
    key: "s-daniel",
    name: "Daniel Mensah",
    initials: "DM",
    year: "Junior",
    college: "College of Business",
    major: "Accounting",
    languages: ["English", "French"],
    backgrounds: ["International Student Support", "Commuter Student"],
    interests: ["Finance", "Data Analytics"],
    bio: "Came from Lomé for university. Ask me about visas, budgeting, and finding community off-campus.",
    capacity: 3,
  },
  {
    key: "s-priya",
    name: "Priya Raman",
    initials: "PR",
    year: "Senior",
    college: "College of Engineering",
    major: "Computer Science",
    languages: ["English", "Tamil", "Hindi"],
    backgrounds: ["International Student Support"],
    interests: ["Software", "Research", "Data Analytics"],
    bio: "Research assistant in the AI lab. Happy to talk study habits, office hours, and landing a first internship.",
    capacity: 1,
  },
  {
    key: "s-marcus",
    name: "Marcus Bell",
    initials: "MB",
    year: "Junior",
    college: "College of Arts & Sciences",
    major: "Psychology",
    languages: ["English", "Spanish"],
    backgrounds: ["First-Generation Advocate", "Student-Athlete"],
    interests: ["Counseling", "Research", "Leadership"],
    bio: "Track & field and peer counselor. Balancing athletics and academics is my specialty.",
    capacity: 2,
  },
  {
    key: "s-sofia",
    name: "Sofía Hernández",
    initials: "SH",
    year: "Senior",
    college: "College of Health Sciences",
    major: "Nursing",
    languages: ["English", "Spanish"],
    backgrounds: ["Transfer Student", "Commuter Student"],
    interests: ["Healthcare", "Community Service"],
    bio: "Transferred from community college. I know how to make a big campus feel small.",
    capacity: 2,
  },
  {
    key: "s-kwame",
    name: "Kwame Asante",
    initials: "KA",
    year: "Graduate Assistant",
    college: "College of Business",
    major: "Business Administration",
    languages: ["English", "Twi", "Ga"],
    backgrounds: ["First-Generation Advocate", "International Student Support"],
    interests: ["Marketing", "Entrepreneurship", "Leadership"],
    bio: "MBA candidate and former orientation leader. I run the first-gen business circle on Thursdays.",
    capacity: 3,
  },
  {
    key: "s-lena",
    name: "Lena Fischer",
    initials: "LF",
    year: "Junior",
    college: "College of Education",
    major: "Elementary Education",
    languages: ["English", "German"],
    backgrounds: ["LGBTQ+ Ally", "International Student Support"],
    interests: ["Teaching", "Community Service", "Leadership"],
    bio: "Residence hall advisor. Let's find your people through clubs and service.",
    capacity: 2,
  },
];

// The sample first-year student used across the dashboard when no real profile is filled in.
export const DEMO_MENTEE: MenteeProfile = {
  major: "Business Administration",
  college: "College of Business",
  languages: ["English", "Twi"],
  backgrounds: ["First-Generation Advocate"],
  interests: ["Entrepreneurship", "Finance"],
};

export type MatchBreakdown = { label: string; points: number; max: number; detail: string };

const overlap = (a: string[] = [], b: string[] = []) => {
  const set = new Set(a.map((x) => x.toLowerCase()));
  return b.filter((x) => set.has(x.toLowerCase()));
};

/** Score out of 100: major 35, college 15, background 25, interests 15, language 10. */
export function scoreMatch(mentee: MenteeProfile, mentor: Mentor): { score: number; breakdown: MatchBreakdown[] } {
  const sameMajor = !!mentee.major && mentee.major.toLowerCase() === mentor.major.toLowerCase();
  const sameCollege = !!mentee.college && mentee.college === mentor.college;
  const bg = overlap(mentee.backgrounds, mentor.backgrounds);
  const ints = overlap(mentee.interests, mentor.interests);
  const langs = overlap(mentee.languages, mentor.languages).filter((l) => l !== "English");
  const breakdown: MatchBreakdown[] = [
    { label: "Academic major", max: 35, points: sameMajor ? 35 : 0, detail: sameMajor ? `Both in ${mentor.major}` : `Mentor studies ${mentor.major}` },
    { label: "College", max: 15, points: sameCollege ? 15 : 0, detail: mentor.college },
    { label: "Lived background", max: 25, points: Math.min(25, bg.length * 25), detail: bg.length ? bg.join(", ") : "No shared background" },
    { label: "Career interests", max: 15, points: Math.min(15, ints.length * 8), detail: ints.length ? ints.join(", ") : "Different interests" },
    { label: "Languages", max: 10, points: langs.length ? 10 : 0, detail: langs.length ? `Also speaks ${langs.join(", ")}` : "English" },
  ];
  return { score: breakdown.reduce((s, b) => s + b.points, 0), breakdown };
}

export const CHECKINS = [
  { id: 1, with: "Ama Owusu", topic: "Week 3: Building your study routine", date: "Tue, Oct 13", time: "4:00 PM", mode: "Video" },
  { id: 2, with: "First-Gen Business Circle", topic: "Group: Navigating office hours", date: "Thu, Oct 15", time: "5:30 PM", mode: "Video" },
  { id: 3, with: "Advising: Dr. Lindqvist", topic: "Spring course planning", date: "Mon, Oct 19", time: "10:00 AM", mode: "In person · Hall B 204" },
];

export const MILESTONES = [
  { id: "m1", label: "Complete transition self-assessment", week: "Week 1" },
  { id: "m2", label: "First meeting with peer mentor", week: "Week 2" },
  { id: "m3", label: "Join one student organization", week: "Week 4" },
  { id: "m4", label: "Visit the Writing or Tutoring Center", week: "Week 5" },
  { id: "m5", label: "Mid-semester academic check-in", week: "Week 8" },
  { id: "m6", label: "Register for spring courses", week: "Week 11" },
];

export const RESOURCES = [
  { title: "Academic Success Center", cat: "Academic", desc: "Free tutoring, study skills workshops and supplemental instruction." },
  { title: "First-Generation Student Hub", cat: "Belonging", desc: "Community lounge, peer circles and a lending library for textbooks." },
  { title: "International Student Services", cat: "Belonging", desc: "Immigration advising, cultural adjustment programs, host families." },
  { title: "Counseling & Wellness", cat: "Wellbeing", desc: "Confidential counseling, 24/7 crisis line and mindfulness sessions." },
  { title: "Financial Aid Office", cat: "Financial", desc: "FAFSA help, emergency micro-grants and work-study placements." },
  { title: "Career Development Center", cat: "Career", desc: "Résumé reviews, mock interviews and the first-year internship fair." },
  { title: "Campus Food Pantry", cat: "Financial", desc: "No-questions-asked groceries and toiletries for all students." },
  { title: "Student Involvement Office", cat: "Engagement", desc: "300+ student organizations, leadership retreats and service trips." },
];
