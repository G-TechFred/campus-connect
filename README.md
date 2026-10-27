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

Link the database with the lovable cloud database so users can actually sign up as a "Mentee" or "Mentor" and store real matching records in a database table

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7c600130-9384-40c7-8450-bf459d0ca2a5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
