<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Mentor matching score lives in `src/lib/mentorship-data.ts` (`scoreMatch`) and is covered by tests; change weights there only, so every screen agrees.
- Sample mentors are UI-only and merged with real mentor accounts from the `profiles` table; connection rows store `mentor_key` so requests to sample mentors still persist.
- Mentee/mentor is a profile type (not a privilege); any future staff/admin powers must use a separate roles table.
- The root route is the welcome screen; the student dashboard lives at `/dashboard` and sample advisor management at `/advisor`, so role previews have distinct destinations.
- Demo role selection is presentation-only React context, never authentication or authorization; advisor demo actions only update local sample state.
