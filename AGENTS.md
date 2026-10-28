## Architecture rules
- Mentor matching score lives in `src/lib/mentorship-data.ts` (`scoreMatch`) and is covered by tests; change weights there only, so every screen agrees.
- Sample mentors, students, and program activity are local mock data; profile edits and mentor requests persist only in browser storage.
- Mentee/mentor is a profile type (not a privilege); any future staff/admin powers must use a separate roles table.
- The root route is the welcome screen; the student dashboard lives at `/dashboard` and sample advisor management at `/advisor`, so role previews have distinct destinations.
- Demo role selection is presentation-only React context, never authentication or authorization; local preview data does not represent real accounts and is not shared with a backend.
