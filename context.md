# context.md

Running state of LevelUp AI. Updated every session.

---

## What this is

A platform that teaches AI to college students. Right now it is one page: signup.
The owner has said there's more to the concept ("the crux") that hasn't been shared
yet, so nothing beyond signup should be designed or built until it is.

## Where things stand

**Built:** signup page, live player-card preview, welcome page, Supabase schema.
**Not built:** login, dashboard, lessons, levels, anything after signup.
**Not decided:** what the actual learning experience is.

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
components/SignupForm.js   all form state, validation, Supabase calls
components/PlayerCard.js   live card preview and progress meter
lib/supabaseClient.js      client, returns null if env vars are missing
supabase/schema.sql        run once in the Supabase SQL editor
```

## Environment

Supabase project `fjsmcahvvveqjorvbawc`. Email confirmation is **on**
(`mailer_autoconfirm: false`). Keys live in `.env.local` locally and in the Vercel
dashboard — never in the repo. If the project is ever swapped, re-run `schema.sql`
against the new one.

## Known gaps

- No login page yet. The welcome page tells students to ask their instructor.
- Signing up with an email that already exists returns success rather than a clear
  message — Supabase hides this on purpose to stop people probing for registered
  addresses. Detectable via an empty `identities` array if we decide we want to.
- Phone validation assumes a 10-digit Indian number. Revisit if the audience widens.
- Nothing verifies the college name against a real list.

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

Next: owner runs `schema.sql`, tests a real signup, then GitHub + Vercel setup.
After that, owner shares the crux of the product.
