# context.md

Running state of LevelUp AI. Updated every session.

---

## What this is

A platform that teaches AI to college students. Right now it is one page: signup.
The owner has said there's more to the concept ("the crux") that hasn't been shared
yet, so nothing beyond signup should be designed or built until it is.

## Where things stand

**Built:** signup page, live player-card preview, welcome page, Supabase schema,
login, session auth (middleware-gated `/journey`).
**Not built:** the journey map, missions, dashboard, lessons, levels, the artifact wall.
**Not decided:** what the actual learning experience is, beyond the Pre-Level brief now
in progress (see session 5).

## Decisions made so far

| Decision | Choice | When |
|---|---|---|
| Name | LevelUp AI | session 1 |
| Framework | Next.js 14 App Router, JavaScript | session 1 |
| Styling | Tailwind CSS 3 | session 1 |
| Backend | Supabase (auth + Postgres) | session 1 |
| Signup type | Real account, email + password | session 1 |
| Hosting | Vercel, auto-deploy from GitHub `main` | session 1 |
| Design concept | Form builds a live "player card" | session 1 |

## Signup fields

| Field | Type | Rule |
|---|---|---|
| Full name | text | 2+ characters |
| Email | email | standard format check, also the auth identifier |
| Phone number | tel | exactly 10 digits after stripping non-digits |
| College | text | 2+ characters |
| Program | select | Science, Commerce, Arts |
| Passing year | select | 2020–2030 |
| Password | password | 8+ characters |

## Data model

One table, `public.profiles`, keyed to `auth.users.id`. Row Level Security is on; a
student can read and update their own row and nobody else's. Full SQL in
`supabase/schema.sql`.

Profile rows are **not** written by the browser. The student's details are attached to
the `auth.signUp` call as user metadata, and an `after insert` trigger on `auth.users`
(`public.handle_new_user`, `security definer`) copies them into `profiles`. This is
required because email confirmation is on: at the moment of signup the student has no
session, so `auth.uid()` is null and any client-side insert would be refused.

The trigger falls back to placeholder values if a metadata field is missing, so a
malformed signup can never hard-fail with an opaque "Database error saving new user".
The form validates every field first, so the fallbacks should never fire in practice.

## File map

```
app/layout.js          fonts, metadata, html shell
app/page.js            signup page — heading and copy
app/globals.css        design tokens, .field / .label, reduced-motion
app/welcome/page.js    post-signup confirmation
app/login/page.js      login page — heading and copy
app/journey/page.js    placeholder post-login landing (real map is session 5, commit 4)
app/actions/auth.js    signOut() server action
middleware.js           refreshes the session; gates /journey/*, /wall; bounces signed-in
                        visitors off / and /login
components/SignupForm.js   all form state, validation, Supabase calls
components/LoginForm.js    login form, wrong-password copy, unconfirmed-account resend
components/PlayerCard.js   live card preview and progress meter
lib/supabase/client.js     browser Supabase client (createBrowserClient)
lib/supabase/server.js     cookie-bound server Supabase client (createServerClient)
supabase/schema.sql        run once in the Supabase SQL editor
```

## Environment

Supabase project `fjsmcahvvveqjorvbawc`. Email confirmation is **on**
(`mailer_autoconfirm: false`). Keys live in `.env.local` locally and in the Vercel
dashboard — never in the repo. If the project is ever swapped, re-run `schema.sql`
against the new one.

## Known gaps

- Signing up with an email that already exists returns success rather than a clear
  message — Supabase hides this on purpose to stop people probing for registered
  addresses. Detectable via an empty `identities` array if we decide we want to.
- Phone validation assumes a 10-digit Indian number. Revisit if the audience widens.
- Nothing verifies the college name against a real list.
- No password reset flow. Queued, not blocking.
- `/journey` is a placeholder card with just a sign-out button — the real journey map
  is Commit 4 of the Pre-Level brief (see session 5).

## Session log

**Session 1 — first build**
Scoped the project, picked the name and stack, built the signup page end to end.
Reviewed the rendered page and fixed two things: the player card was landing below the
submit button on mobile where students wouldn't see it while typing, and the empty
progress track was reading as a solid dark bar. Build passes.

**Session 2 — fixed signup against a live Supabase project**
Owner hit "Supabase isn't connected" — no `.env.local` existed. Checked the project
over the REST API and found two further problems: `profiles` had never been created,
and email confirmation was on, which would have blocked the client-side profile insert
under RLS. The owner's first project already had an unrelated `progress` table in it,
so they created a clean one. Moved profile writes to an `after insert` trigger on
`auth.users` and removed the insert from `SignupForm.js`. Build passes. Not yet
verified against a real signup — the owner still has to run `schema.sql`.

**Session 3 — pushed to GitHub**
Repo is `anandgoud-rgb/level-up-ai`, private, branch `main`. First push landed all 19
files.

Cost most of a session to a GitHub gotcha worth remembering: on a fine-grained token,
"Repository access" only chooses *which* repos are visible. It grants no abilities at
all on its own. Without **Permissions → Contents: read and write** every push returns
`403 Write access to repository not granted`, and the repo also 404s on the API, which
looks exactly like the repo not existing. Note that the owner has a second, unrelated
repo — `level-up-coding-app`, an active single-file HTML app teaching Java — that must
never be written to from this project.

**Session 4 — reconciled a second, un-cloned working copy against the repo**
This session started from a local folder that had never been `git init`'d — a separate
line of work that reinvented signup from scratch: `schema.sql` had no trigger, and
`SignupForm.js` inserted into `profiles` directly from the browser. That only worked
because email confirmation had been switched off in the Supabase dashboard to give the
browser a session to insert with (worked around the exact problem session 2 already
solved properly).

Cloned `anandgoud-rgb/level-up-ai` into a subfolder, diffed it against the local
folder, and adopted the repo's versions of `CLAUDE.md`, `README.md`,
`app/welcome/page.js`, `components/SignupForm.js`, and `supabase/schema.sql` — the
trigger-based approach, confirmation-safe. Moved the clone's `.git` into the working
folder so it's now the tracked copy.

Next: owner re-runs `schema.sql` (idempotent) against the live project to add the
trigger, turns "Confirm email" back on in Supabase, then commits and pushes this
reconciliation. After that: confirms the Vercel project is building, and shares the
crux of the product.

**Session 5 — Pre-Level brief, Commit 1: authentication**
Owner shared the crux: a three-day journey of levels and missions, "Meet Your AI
Co-Pilot" being the first (Pre-Level). Full brief covers six commits — auth, schema,
content model, journey map, mission runner, rewards. Working through them one at a
time, verifying each before moving on.

Commit 1 done: `@supabase/ssr` browser/server clients replace the old
`lib/supabaseClient.js` singleton; `middleware.js` refreshes sessions and gates
`/journey/*` and `/wall`; `/login` matches the signup page's visual language exactly,
with plain "wrong email or password" copy and a resend option for unconfirmed
accounts; a `signOut()` server action exists, to be wired into the header in commit 4.

Added a placeholder `/journey` page not in the brief's file list — the brief's own
"done when" for commit 1 requires landing on `/journey` after login, but that page
isn't built until commit 4. Without it, login had nowhere to land. It's just a
sign-out button; commit 4 replaces it outright.

Verified end to end in the browser: signup, email confirmation, log out, log back in,
landing on the placeholder `/journey`. Build passes.

**Session 5 — Pre-Level brief, Commit 2: schema**
Appended `public.mission_progress` to `schema.sql` — one row per `(user_id,
mission_id)`, `artifact` as `jsonb` (Mission 2 stores two pastes, Mission 3 a before
and after — a flat text column would force encoding hacks). Unlike `profiles`, there's
a real session by the time a student writes here, so ordinary RLS policies work; no
trigger needed.

Owner ran it twice in the Supabase SQL Editor, clean both times. Table confirmed in
Table Editor.

**Session 5 — Pre-Level brief, Commit 3: content model and Pre-Level content**
`content/index.js` exports the ordered `journey` array; `content/levels/00-pre-level.js`
exports the Pre-Level object with its four missions, verbatim from the brief. No JSX —
`teach` arrays are `text` / `formula` / `compare` blocks for the mission runner
(commit 5) to interpret. `content/resolveTemplate.js` fills `{{full_name}}` /
`{{college}}` / `{{program}}` tokens from the `profiles` row; a missing field stays
visible as `{{field}}` instead of going blank.

The brief specified block types and level metadata but left the exact JS object shape
for prompts/proof to this session's judgement. Chose per-mission shapes rather than
forcing one rigid schema, since the four missions are genuinely different (single
paste, A/B compare, stepped improve-with-chips, freeform) — flagged to the owner to
correct if it doesn't match their mental model. Nothing renders yet; verified by
importing the content module directly (mission count, XP sums to the level's 50,
template resolution) rather than in the browser. Build passes.

Next: commit 4 (journey map at `/journey`, replacing today's placeholder), then
continue through the remaining commits in order.
