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
variables in the Vercel project settings.

## Project docs

- `CLAUDE.md` — conventions and working agreement
- `context.md` — current state, decisions, open questions
