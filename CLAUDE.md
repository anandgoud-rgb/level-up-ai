# CLAUDE.md

Instructions for Claude when working on LevelUp AI. Read this first, every session.

## Working agreement

1. **Ask before doing anything.** No assumptions about scope, naming, libraries, data
   shape, or copy. If something is ambiguous, stop and ask.
2. **Never invent product decisions.** If the owner hasn't specified it, it isn't decided.
3. **Update `CLAUDE.md` and `context.md` on every change.** Every session that touches
   code also touches `context.md`. This is not optional.
4. **Never put secrets in the repo.** Keys live in `.env.local` (gitignored) and in the
   Vercel dashboard. Never ask the owner to paste a key into chat.
5. **Verify before handing off.** Run `npm run build` and confirm it passes before saying
   a change is done.

## Deploy loop

The owner runs the commands; Claude does not have GitHub or Vercel access.

- Claude changes files → owner runs `git add -A && git commit -m "..." && git push`
- Vercel is connected to the GitHub repo and redeploys `main` automatically.
- When the owner says "commit this", Claude gives the exact commands plus a commit
  message, and confirms the build passed first.

## Stack

- Next.js 14 (App Router), JavaScript — not TypeScript
- Tailwind CSS 3, configured in `tailwind.config.js`
- Supabase for auth (email + password) and the `profiles` table
- Deployed on Vercel

## Conventions

- Components live in `components/`, one per file, `"use client"` only where needed.
- Design tokens are Tailwind theme keys (`ink`, `paper`, `volt`, `marigold`, `mint`,
  `line`), not raw hex in JSX. Exception: program badge colours in `PlayerCard.js`.
- Shared input styling is the `.field` / `.label` classes in `app/globals.css`. Add new
  form controls using those, don't re-style per field.
- Copy is sentence case, plain verbs, no exclamation marks. Errors say what to fix.
- Buttons name the action they perform: "Create my card", not "Submit".
- **Never write to `profiles` from the browser at signup time.** There is no session
  yet, so RLS will refuse it. New profile fields get added in three places: the form,
  the `options.data` block in the `signUp` call, and the trigger in
  `supabase/schema.sql`. Miss one and the field silently vanishes.
- `schema.sql` must stay re-runnable. Use `if not exists`, `drop policy if exists`,
  and `create or replace`.
- Auth: `lib/supabase/client.js` (`createClient()`) in client components,
  `lib/supabase/server.js` (`createClient()`, cookie-bound) in server components and
  server actions. `middleware.js` refreshes the session on every request and gates
  `/journey/*` and `/wall` — signed-out visitors bounce to `/login`, signed-in visitors
  bounce off `/` and `/login` to `/journey`.
- `content/` holds only data, no JSX. A level exports `{ id, day, title, subtitle,
  estMinutes, xp, badge, completionMessage, missions }`. Each mission's `teach` array
  uses block types `text`, `formula`, `compare` (`callout` also supported, unused so
  far). Prompt templates use `{{field}}` tokens resolved against the `profiles` row by
  `content/resolveTemplate.js` — an unresolved field stays visible as `{{field}}`
  rather than going blank.
- The journey map (`/journey`) is a zigzag node path (`components/JourneyPath.js`), not
  a card grid — alternating left/right circular nodes connected by dashed SVG S-curves.
  Locking is always derived from `mission_progress` at render time, never stored.

## Design direction

The signup form builds a **player card** that fills in live as the student types. That
card is the one bold element — everything around it stays quiet. Do not add more
decorative flourishes, gradients, or card-grid sections without asking.

- Display type: Bricolage Grotesque. Body type: Instrument Sans.
- Base is cool navy on pale blue-grey, electric blue primary, marigold accent.
- Motion only in response to a user action. No scroll-triggered entrances.

## Non-negotiables

- Keyboard focus must stay visible.
- Must work down to a 360px viewport.
- `prefers-reduced-motion` is respected in `globals.css` — keep it that way.
