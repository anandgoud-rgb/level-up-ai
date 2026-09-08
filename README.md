# LevelUp AI

Signup for a platform that teaches AI to college students.

## Run it locally

```bash
npm install
cp .env.local.example .env.local   # then fill in your Supabase values
npm run dev
```

Open http://localhost:3000

## Supabase setup

1. In your Supabase project, open **SQL Editor** and run `supabase/schema.sql`.
2. Open **Project Settings → API** and copy the Project URL and the `anon` public key.
3. Paste both into `.env.local`.

## Deploy

Pushes to `main` deploy automatically to Vercel. Set the same two environment
variables in the Vercel project settings, ticking all three environments.

Two settings that are easy to get wrong:

- **Framework Preset** must be Next.js. If the repo was imported while empty,
  Vercel could not detect the framework and falls back to "Other", which fails
  the build with `No Output Directory named "public" found`.
- In Supabase, **Authentication → URL Configuration** needs the live Vercel URL
  as the Site URL, with both it and `http://localhost:3000` listed as redirect
  URLs. Otherwise confirmation emails send students to localhost.

## Project docs

- `CLAUDE.md` — conventions and working agreement
- `context.md` — current state, decisions, open questions
