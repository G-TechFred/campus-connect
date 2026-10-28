# Campus Connect

Build a responsive web application for a university "First-Year Student Mentorship & Peer Advising Matching Platform" designed for a Higher Education Student Affairs (HESA) department.

Design & Aesthetic Guidelines:

- Adopt an authentic, high-end university portal aesthetic. Use a 60-30-10 color system: crisp institutional white/light slate background, deep university navy blue (#1E3A8A) for headers and primary containers, and a warm collegiate gold/amber (#D97706 or #F59E0B) or academic teal for interactive accents and status badges.
- Use clean card layouts, generous whitespace, rounded corners (rounded-lg or rounded-xl), subtle drop shadows, and professional typography (such as Inter or system sans-serif).
- Include an official-looking top navigation bar with a university crest placeholder icon, navigation tabs ("Dashboard", "Find a Mentor", "My Matches", "Resource Hub", "Admin Portal"), and a user profile dropdown indicating "Role: First-Year Mentee" or "Peer Advisor".

Core Features to Include on the Main Dashboard:

1. Welcome Banner: A personalized greeting card for a first-year student ("Welcome to Campus, Godfred! Your transition journey starts here.") with quick status indicators for matching progress.
2. Smart Match Preview Card: Displays a recommended Peer Mentor match based on academic major (e.g., Business Administration), first-generation college student status, and shared career interests. Include a "View Match Breakdown" and "Request Connection" button.
3. Quick Action Grid: Clean interactive tiles for "Book Advising Session", "View Campus Resources", "Mentorship Milestone Checklist", and "Submit Feedback".
4. Active Connections / Upcoming Check-ins Section: A neat list displaying scheduled peer check-ins with date, time, and a video call link placeholder.

Make the interface fully interactive with functional tabs, sample student/mentor data arrays so it looks populated immediately, and smooth transitions.

Also build a dedicated "Find a Mentor" directory page where students can filter mentors by college, major, languages spoken, or background (e.g., international student support, first-generation advocates).

Add a section or tooltip to the mentorship dashboard that references frameworks like Schlossberg’s Transition Theory or Astin’s Theory of Student Involvement to show admissions committees that you understand the academic theory underpinning student affairs.

The portal is a client-side demonstration. Role selection is simulated, and profile edits, mentor requests, and request statuses are stored only in the current browser's local storage. No account, backend database, or shared server persistence is used.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
