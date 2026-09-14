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

**Session 5 — Pre-Level brief, Commit 4: journey map**
`/journey` (the commit 1 placeholder) is now the real map: one Supabase query for the
profile, one for all `mission_progress` rows, then levels are derived — a level is
available once every mission in the preceding level is `done`; Pre-Level is always
available. No `locked` column, by design, so reordering content never goes stale.
Header shows first name, total XP, and earned badges. Challenges 1-5 render as muted
"Coming soon" placeholders (`app/journey/page.js`), since they aren't written yet.

Went through two rounds of visual iteration with the owner: started as a plain card
grid, then to a zigzag node path per the owner's "like an actual game map" request
(`components/JourneyPath.js` — alternating left/right circular nodes), then fixed a
connector bug where the dashed line ran straight down the center regardless of node
position — it now bends as a dashed SVG S-curve between each pair of nodes, following
the zigzag.

Clicking "Start" on Pre-Level currently 404s — the mission runner route
(`/journey/[levelId]/[missionId]`) is commit 5, not built yet. Expected at this stage.
Verified in-browser (logged-in test account): name, XP, Pre-Level node, five muted
placeholders. Build passes.

**Session 5 — Pre-Level brief, Commit 5: mission runner**
`app/journey/[levelId]/[missionId]/page.js` (server component: resolves level/mission
from content, loads profile + any existing `mission_progress` row) plus
`components/MissionRunner.js` (client component: renders `teach` blocks, prompt
panel(s) with copy buttons and an Open Claude link, the proof field(s), and Continue).
Saves on every field blur, upserting `mission_progress` on `(user_id, mission_id)`;
Continue marks the mission `done` and awards its XP, then routes to the next mission
or back to `/journey` if it was the last one.

Mission shapes ended up meaningfully different (single paste, A/B compare, stepped
improve-with-chips, freeform-with-starter-chips), so the runner branches on structural
signals in the content (presence of `prompt` vs `prompts`, `proof.mode`, presence of
`improvementChips`/`starterChips`) rather than checking mission IDs — keeps it
data-driven for whatever content comes next.

The owner reported Mission 4 being skipped after Mission 3's Continue. Investigated
live in the owner's own account via browser automation (logged into their test
account) rather than guessing from code alone: revisited Mission 3 and clicked
Continue — it correctly loaded Mission 4; completing Mission 4 correctly brought the
level to 50 XP with the AI Co-Pilot badge and "Review" on the map. Could not reproduce
the bug; the account is genuinely fully complete now. Did surface one real gap while
reviewing: `saveProgress` swallows write failures silently and `handleContinue`
navigates forward regardless of whether the save succeeded, so a network hiccup at the
exact moment of clicking Continue could silently lose that completion. Proposed a
fix (block navigation and show an inline error on Continue-save failure); owner
decided it's not worth doing right now — left as is, silent-and-continue.

Verified end to end in the owner's real account: all 4 Pre-Level missions playable,
progress and XP survive revisits, journey map reflects 50 XP / badge / Review. Build
passes.

**Session 6 — Pre-Level brief, Commit 6: rewards (badge reveal + closing line)**
The last gap from Commit 6: `level.completionMessage` existed in content but was never
shown anywhere. Finishing the level's last mission now holds on a brief overlay
(mint checkmark circle, the level's badge name, `+{xp} XP`, and the closing line) for
1.8s before routing to `/journey` — skipped down to ~instant if the browser has
`prefers-reduced-motion` set. Verified the exact rendered text via the live DOM in the
owner's account (`AI Co-Pilot` / `+50 XP` / `You are ready to build something real.`)
after screenshot timing proved too slow to reliably catch a sub-2-second overlay
mid-flight. Build passes.

Next: the owner handed over the Level 1 brief ("Build Your Own") — nine challenges
(zomato, zepto, amazon, youtube, spotify, netflix, instagram, makemytrip, muscleblaze),
one chosen per student, built via nine shared mission templates whose tokens each
challenge file fills in. Day/pacing metadata is for internal understanding only —
never surfaced to students. Working through its six commits in order.

**Session 6 — Level 1 brief, Commit 1: schema**
Appended `public.builds` to `schema.sql` — one row per student (`user_id` is the
primary key, not a separate id column), `answers` jsonb so later missions can add keys
without a migration, `locked_at` for the mission-02 challenge lock. Same RLS shape as
`mission_progress`: ordinary policies, no trigger, since there's a session by the time
a student writes here. Owner ran it twice in the Supabase SQL editor, clean both times.

**Session 6 — Level 1 brief, Commit 2: content**
`content/level-1/missions.js` (9 shared templates, tokens unresolved until commit 3),
`content/level-1/challenges/*.js` (9 vocabulary files), `content/level-1/index.js`
(aggregates both, `getChallenge(id)`, level metadata). XP sums to the specified 200.
No badge on the level object — it's per challenge, read from the student's chosen
`builds.challenge_id` at completion time.

Three small gaps the brief didn't fully specify, filled in with a reasonable default —
flagging in case any should be different:
- Mission 01's `audience` field was meant to prefill with "their college city," but
  `profiles` only stores the college's name, not a city. Left unprefilled.
- Mission 05's proof paste has no minimum length in the brief. Set to 60, matching the
  other same-weight missions.
- `BUILD_CONSTRAINTS` is appended only to mission 02's prompt (literally as instructed
  there), not repeated on missions 03-08 — those stay in the same chat where the
  one-file/inline/mobile-friendly pattern is already established, and repeating the
  full constraint block in every two-line prompt would defeat the "short prompt"
  design goal the brief itself sets out.

Verified all 9 mission templates and 9 challenge files import cleanly and check out
structurally (XP totals, 4 wowIdeas each, non-empty extraPages/filterIdeas, valid
badges) via a Node script, since nothing renders yet — Commit 4 (picker) is the first
place this content actually shows up. Build passes.

**Session 6 — Level 1 brief, Commit 3: resolver**
`lib/prompt.js` exports `resolvePrompt(template, { challenge, student, build })` —
throws `MissingTokenError` rather than rendering blank, for any of the three
namespaces, including an empty string or empty array (not just `undefined`/`null`).
Array values (`filterIdeas`, `extraPages`) join into readable prose automatically.
`findMissionForBuildKey(key)` looks up which mission's `inputs`/`postInputs` sets a
given `build.*` key, for redirecting a student back to the right earlier mission with
a plain explanation when a later one isn't startable yet — that redirect UI itself is
commit 5's job, this just gives it the lookup. `extractTokens` pulls every token out
of a string, for that same not-startable check.

Verified with a standalone script mirroring the algorithm (`@/` aliases only resolve
inside Next's webpack, not raw Node): array-join prose reads naturally, missing/empty
string/empty array all throw, dynamic tokens inside mission titles resolve correctly.
`npm run build` confirms the real file's `@/content/level-1/missions` import compiles.
Build passes.

**Session 6 — Level 1 brief, Commit 4: challenge picker**
`content/index.js` now exports `[preLevel, level1]` — Level 1 is a real node on the
journey path. Its journey-map card shows "Choose" until a `builds` row exists, then
routes straight to the right mission like any other level; remaining not-yet-built
levels renamed placeholder "Challenge N" &rarr; "Level N" to stop colliding with the
nine in-level challenge names (Zomato, Zepto, etc.).

`app/journey/level-1/page.js` + `components/ChallengePicker.js`: nine cards (icon,
name, tagline, a page list synthesized from each challenge's `discoveryName` /
`detailName` / `extraPages`). No build yet &rarr; pick writes the row and redirects
into mission 1. Build exists, unlocked &rarr; the current pick shows "Your pick" with
a plain Continue; every other card offers "Switch to this," which shows an inline
confirm (not a native `confirm()`) before calling the `selectChallenge` server action
— that action also deletes any `level-1` `mission_progress` rows first, since a
switch is only reachable before mission 2 locks it, so at most mission 1's row could
exist and its answers describe the old pick. Locked (`builds.locked_at` set) &rarr;
condensed view, just the chosen challenge and a Continue link — nothing here sets
`locked_at` yet, that's commit 5's job when it builds mission 2's completion.

Verified live end to end in the owner's account: journey map shows "0/9 missions,
~160 min, 200 XP, Choose"; all 9 cards render correctly; picking Zomato writes the
build and lands on `/journey/level-1/choose-your-brand`, rendered by the *unmodified*
Pre-Level runner — showing raw `{{challenge.domain}}`-style unresolved tokens, exactly
as expected since the new token syntax and input fields aren't wired into the runner
until commit 5; switching to Zepto updates "Your pick" correctly. Build passes.

**Session 6 — Level 1 brief, Commit 5: runner extensions**
`app/journey/level-1/[missionId]/page.js` — a *more specific static route* than the
generic `app/journey/[levelId]/[missionId]`, which Next.js routes to automatically
ahead of the dynamic one. Pre-Level's runner is completely untouched; Level 1 gets its
own `components/Level1MissionRunner.js`. Page-level, before rendering anything: tries
resolving every token the mission's title/prompt/checklist reference via
`lib/prompt.js`, skipping any `build.*` key the mission collects itself (those start
blank, filled live) — a genuinely missing token (an earlier mission not yet done)
shows a plain "this needs something from &lsquo;X&rsquo; first" screen instead of a
broken prompt, per the brief's strict-resolver requirement.

Runner handles: `inputs` (line / chips-single / chips-or-custom, live-updating a
prompt preview the same way signup's player card fills in — unresolved self-fields
show as `___`, not blank or broken syntax), `postInputs` (recorded after the prompt,
e.g. mission 1's palette), `checklist` (mission 8, gates Continue same as proof
minLengths), and a new `showcase` proof mode (mission 9's three fields). Two separate
tables get written: `mission_progress` (per-mission artifact/status/xp, same shape as
Pre-Level) and `builds.answers` (accumulates across missions, one upsert of the whole
answers object per save — call sites always seed from the latest known state so
earlier missions' keys are never dropped). Completing `build-the-foundation`
(mission 2) also sets `builds.locked_at`, which is what makes the picker show its
locked view from commit 4.

Live-verified in the owner's account (missions 1-3, in order, for real): input fields
+ live preview updating correctly as fields were typed and a mood chip picked;
mission 2's prompt fully resolved every mission-1 answer plus `BUILD_CONSTRAINTS`
appended; mission 3's title and filter list resolved `{{challenge.x}}` tokens
including array-join prose; proof correctly re-hydrates on revisiting a mission;
completing mission 2 set the lock and the picker's condensed view + "Continue
building" appeared immediately after; XP and mission-count on `/journey` tracked
correctly throughout (115 XP = 50 + 15 + 25 + 25, "3/9 missions"). Not live-tested,
relying on code review and the already-verified shared patterns: mission 7's
chips-or-custom input, mission 8's checklist gating, mission 9's showcase proof mode,
and the not-ready redirect screen itself (never actually hit one, since every mission
after 1 only depends on mission 1's answers). Ran into repeated session
expiry mid-testing (re-logged in twice) — unrelated to this commit, same as a similar
one-off in an earlier session. Build passes.

**Session 6 — Level 1 brief, Commit 6: rewards**
Same reveal mechanic as Pre-Level's commit 6 (mint-circle-style overlay, 1.8s hold,
skips to instant under `prefers-reduced-motion`), added to `Level1MissionRunner`'s
`handleContinue` for the last mission. Uses the chosen challenge's own icon and badge
name instead of a generic checkmark — nine distinct badges, matching the brief's "more
fun and instantly readable" reasoning. `level1.completionMessage` ("You built a real
product today.") added to content. XP (200) and badge derivation were already correct
from commit 4's `earnedBadges` logic on `/journey`; this only adds the missing
in-mission celebration moment.

Not live-tested end to end — reaching mission 9 needs 6 more mission completions
through a browser session that's already hit repeated auth expiry this session.
Relying instead on: code symmetry with Pre-Level's reveal (already verified live),
and confirming via the commit 2 test script that all 9 challenges have valid
`icon`/`badge.name`, `level1.xp` is 200, and `completionMessage` is a plain string
(no risk of an undefined-prop crash). Build passes. Recommend the owner runs one full
mission 1-9 playthrough before this reaches students.

**Level 1 brief complete** — all 6 commits done: schema, content, resolver, picker,
runner, rewards.

**Session 7 — Pre-Level runner: back navigation**
Added a "Back" button to the Pre-Level mission runner (`components/MissionRunner.js`),
next to Continue. `app/journey/[levelId]/[missionId]/page.js` now also resolves
`previousMission` (mirroring the existing `nextMission` lookup) and passes
`previousMissionId` down. Only rendered when a previous mission exists (hidden on a
level's first mission) — no disabled state. Clicking it saves current field values to
`mission_progress` first (same as blur-autosave: keeps `done`/xp if already done,
`in_progress`/0 otherwise, silent on failure per the existing save pattern), then
routes to the previous mission. Layout: Back is a secondary (white/border) button on
the left, Continue stays the primary (volt) button on the right, both `justify-end`
inside the row so Continue anchors right even solo on a level's first mission — a
small consistency change from Continue's previous left-aligned default. On mobile the
buttons stack with Continue on top (`flex-col-reverse`). Build passes; not live-tested
in a browser session.

**Session 7 — Level 1 runner: same back navigation**
Extended the identical pattern to `Level1MissionRunner.js` /
`app/journey/level-1/[missionId]/page.js`: `previousMissionId` resolved and passed
through, Back button (same left/secondary, hidden on mission 1) added next to
Continue. `handleBack` saves both `builds.answers` (via `persistAnswers`, `lock`
always `false` — going back never sets or clears `locked_at`) and `mission_progress`
(via `persistProgress`, same done/xp-preserving logic as `handleAnswerBlur`/
`handleProofBlur`) before routing to the previous mission. Build passes; not
live-tested in a browser session — recommend a click-through before students hit it.

**Session 7 — Reset level (both runners)**
Added a quiet "Reset level" text link in each mission runner's header (next to the
"Mission X of N" counter), opening a confirm modal before doing anything destructive
— same button-language convention as Continue/Back, but the confirm action uses
`marigold` (not `volt`) so it doesn't read as the "good" choice, and the copy says
plainly it can't be undone.

- **Pre-Level** (`components/MissionRunner.js`): deletes all `mission_progress` rows
  for `(user_id, level_id)`, then routes to `/journey`.
- **Level 1** (`components/Level1MissionRunner.js`): deletes `mission_progress` rows
  for `level_id = "level-1"` and resets the student's `builds` row (`answers` back to
  `{}`, `locked_at` back to `null`) — keeps the same `challenge_id` rather than
  sending them back to the picker, per owner's call.

Unlike the existing autosave pattern (which fails silently since a missed autosave
just retries on the next blur), a failed reset shows an inline "Couldn't reset the
level. Try again." and leaves the modal open — silently pretending a delete succeeded
would be misleading for a destructive, user-initiated action.

**Requires a Supabase migration the owner needs to run**: `mission_progress` had no
delete policy before this, so `supabase/schema.sql` gained one — "own progress
delete", `for delete using (auth.uid() = user_id)`. The `builds` table needed no
schema change (reset there is a plain `update`, covered by its existing update
policy). Resetting will fail under RLS in production until the owner re-runs
`schema.sql` in the Supabase SQL editor. Build passes; not live-tested.
