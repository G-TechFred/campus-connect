export type Mentor = {
  id?: string;
  key: string;
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
    name: "Akosua Appiah",
    initials: "AA",
    year: "Senior",
    college: "College of Engineering",
    major: "Computer Science",
    languages: ["English", "Twi", "Ga"],
    backgrounds: ["International Student Support"],
    interests: ["Software", "Research", "Data Analytics"],
    bio: "Research assistant in the AI lab. Happy to talk study habits, office hours, and landing a first internship.",
    capacity: 1,
  },
  {
    key: "s-marcus",
    name: "Kofi Boateng",
    initials: "KB",
    year: "Junior",
    college: "College of Arts & Sciences",
    major: "Psychology",
    languages: ["English", "Twi"],
    backgrounds: ["First-Generation Advocate", "Student-Athlete"],
    interests: ["Counseling", "Research", "Leadership"],
    bio: "Track & field and peer counselor. Balancing athletics and academics is my specialty.",
    capacity: 2,
  },
  {
    key: "s-sofia",
    name: "Abena Frimpong",
    initials: "AF",
    year: "Senior",
    college: "College of Health Sciences",
    major: "Nursing",
    languages: ["English", "Twi"],
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
    name: "Kwabena Owusu",
    initials: "KO",
    year: "Junior",
    college: "College of Education",
    major: "Elementary Education",
    languages: ["English", "Twi"],
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
export type MatchingAlgorithm = "balanced" | "college-first";

const overlap = (a: string[] = [], b: string[] = []) => {
  const set = new Set(a.map((x) => x.toLowerCase()));
  return b.filter((x) => set.has(x.toLowerCase()));
};

/** Score out of 100 using the selected program matching strategy. */
export function scoreMatch(
  mentee: MenteeProfile,
  mentor: Mentor,
  algorithm: MatchingAlgorithm = "balanced",
): { score: number; breakdown: MatchBreakdown[] } {
  const weights =
    algorithm === "college-first"
      ? { major: 25, college: 35, background: 20, interests: 12, language: 8 }
      : { major: 35, college: 15, background: 25, interests: 15, language: 10 };
  const sameMajor = !!mentee.major && mentee.major.toLowerCase() === mentor.major.toLowerCase();
  const sameCollege = !!mentee.college && mentee.college === mentor.college;
  const bg = overlap(mentee.backgrounds, mentor.backgrounds);
  const ints = overlap(mentee.interests, mentor.interests);
  const langs = overlap(mentee.languages, mentor.languages).filter((l) => l !== "English");
  const breakdown: MatchBreakdown[] = [
    { label: "Academic major", max: weights.major, points: sameMajor ? weights.major : 0, detail: sameMajor ? `Both in ${mentor.major}` : `Mentor studies ${mentor.major}` },
    { label: "College", max: weights.college, points: sameCollege ? weights.college : 0, detail: mentor.college },
    { label: "Lived background", max: weights.background, points: Math.min(weights.background, bg.length * weights.background), detail: bg.length ? bg.join(", ") : "No shared background" },
    { label: "Career interests", max: weights.interests, points: Math.min(weights.interests, ints.length * 8), detail: ints.length ? ints.join(", ") : "Different interests" },
    { label: "Languages", max: weights.language, points: langs.length ? weights.language : 0, detail: langs.length ? `Also speaks ${langs.join(", ")}` : "English" },
  ];
  return { score: breakdown.reduce((s, b) => s + b.points, 0), breakdown };
}

export const CHECKINS = [
  { id: 1, with: "Ama Owusu", topic: "Week 3: Building your study routine", date: "Tue, Oct 13", time: "4:00 PM", mode: "Video" },
  { id: 2, with: "First-Gen Business Circle", topic: "Group: Navigating office hours", date: "Thu, Oct 15", time: "5:30 PM", mode: "Video" },
  { id: 3, with: "Advising: Dr. Akua Osei", topic: "Spring course planning", date: "Mon, Oct 19", time: "10:00 AM", mode: "In person · Hall B 204" },
];

export const MILESTONES = [
  { id: "m1", label: "Complete transition self-assessment", week: "Week 1" },
  { id: "m2", label: "First meeting with peer mentor", week: "Week 2" },
  { id: "m3", label: "Join one student organization", week: "Week 4" },
  { id: "m4", label: "Visit the Writing or Tutoring Center", week: "Week 5" },
  { id: "m5", label: "Mid-semester academic check-in", week: "Week 8" },
  { id: "m6", label: "Register for spring courses", week: "Week 11" },
];

export type CampusResource = {
  id?: string;
  title: string;
  cat: string;
  desc: string;
  location: string;
  hours: string;
  contact: string;
  services: string[];
  appointmentUrl?: string;
};

export const RESOURCES: CampusResource[] = [
  {
    title: "Academic Success Center",
    cat: "Academic",
    desc: "Free tutoring, study skills workshops and supplemental instruction.",
    location: "Asante Library, 2nd Floor, Room 214",
    hours: "Mon–Thu 8:00–19:00 · Fri 8:00–16:00",
    contact: "asc@fred.edu.gh · +233 30 274 0114",
    services: ["Walk-in tutoring for math, writing and sciences", "Weekly study skills workshops", "Supplemental instruction for gateway courses", "Exam preparation bootcamps before midterms"],
  },
  {
    title: "First-Generation Student Hub",
    cat: "Belonging",
    desc: "Community lounge, peer circles and a lending library for textbooks.",
    location: "Mensah Student Union, Ground Floor, Suite 12",
    hours: "Mon–Fri 9:00–17:00",
    contact: "firstgen@fred.edu.gh · +233 30 274 0130",
    services: ["Textbook lending library (semester loans)", "Thursday first-gen peer circles", "Family orientation materials in Twi, Ga and Ewe", "Staff advocates for navigating university processes"],
  },
  {
    title: "International Student Services",
    cat: "Belonging",
    desc: "Immigration advising, cultural adjustment programs, host families.",
    location: "International House, East Campus",
    hours: "Mon–Fri 8:30–16:30",
    contact: "iss@fred.edu.gh · +233 30 274 0158",
    services: ["Student visa and residence permit advising", "New-arrival airport pickup coordination", "Host family and buddy program", "Cultural adjustment workshops each semester"],
  },
  {
    title: "Counseling & Wellness Center",
    cat: "Wellbeing",
    desc: "Confidential counseling, crisis support and mindfulness sessions.",
    location: "Wellness Building, Room 108 (behind the Health Clinic)",
    hours: "Mon–Fri 8:00–17:00 · Crisis line evenings & weekends",
    contact: "wellness@fred.edu.gh · +233 30 274 0191",
    services: ["Individual counseling (up to 8 sessions per semester)", "Evening crisis line staffed by trained counselors", "Mindfulness and stress management groups", "Referrals to off-campus specialists when needed"],
  },
  {
    title: "Financial Aid Office",
    cat: "Financial",
    desc: "Scholarship guidance, emergency micro-grants and work-study placements.",
    location: "Administration Block, Room 22",
    hours: "Mon–Fri 9:00–15:30",
    contact: "finaid@fred.edu.gh · +233 30 274 0102",
    services: ["Scholarship and bursary application support", "Emergency micro-grants (decisions within 5 working days)", "Work-study job placement on campus", "Budgeting clinics for first-year students"],
  },
  {
    title: "Career Development Center",
    cat: "Career",
    desc: "Résumé reviews, mock interviews and the first-year internship fair.",
    location: "Mensah Student Union, 1st Floor, Room 140",
    hours: "Mon–Fri 9:00–17:00 · Sat 10:00–13:00 (by appointment)",
    contact: "careers@fred.edu.gh · +233 30 274 0177",
    services: ["One-on-one résumé and cover letter reviews", "Mock interviews with feedback", "First-year internship fair each November", "Job shadowing placements with alumni"],
  },
  {
    title: "Campus Food Pantry",
    cat: "Financial",
    desc: "No-questions-asked groceries and toiletries for all students.",
    location: "Akuafo Hall Annex, Rear Entrance",
    hours: "Tue & Thu 12:00–18:00 · Sat 9:00–12:00",
    contact: "pantry@fred.edu.gh · +233 30 274 0163",
    services: ["Weekly grocery pickups (no documentation needed)", "Toiletries and hygiene supplies", "Referrals to emergency meal vouchers", "Volunteer shifts open to all students"],
  },
  {
    title: "Student Involvement Office",
    cat: "Engagement",
    desc: "Student organizations, leadership retreats and service trips.",
    location: "Mensah Student Union, Room 105",
    hours: "Mon–Fri 9:00–17:00",
    contact: "getinvolved@fred.edu.gh · +233 30 274 0145",
    services: ["Directory of 120+ registered student organizations", "Club registration and funding support", "Annual leadership retreat in the Eastern Region", "Community service trip coordination"],
  },
];
