# PLAYFORGE multi-user setup (free tier)

This branch adds account-gated cloud saves. The existing app state shape is retained as one JSON document per authenticated player, so quests, logs, profile, nutrition preferences and progress move together without changing the existing app screens.

## One-time Supabase setup

1. Create a Supabase project on the free plan. Do not enable paid compute or paid add-ons.
2. In **SQL Editor**, run the complete migration at `supabase/migrations/001_player_data.sql`.
3. In **Project Settings → API**, copy the Project URL and the publishable key. Never use the service-role key in the browser.
4. In Vercel → PLAYFORGE project → Settings → Environment Variables, add:
   - `VITE_SUPABASE_URL` = Project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = publishable/anon key
5. Apply to Production, Preview and Development as needed, then redeploy the branch preview.

## Email authentication

In Supabase → Authentication → URL Configuration:
- Set **Site URL** to the existing production site: `https://playforge-fawn.vercel.app`.
- Add `https://*-aaravpachouri.vercel.app/**` to Redirect URLs for Vercel preview deployments.
- Add `http://localhost:5173/**` for local development.

The signup flow explicitly returns the confirmation link to the current app origin. Keep email confirmation enabled. Supabase's built-in email sender has low sending limits; use it for limited testing only. Do not add a paid SMTP service without approval. If you customise the confirmation template, use `{{ .RedirectTo }}` for the redirect target instead of hardcoding the Site URL.

## Data and isolation

- Every player has one row in `public.player_data`, keyed by their Auth user ID.
- Row Level Security policies require `auth.uid() = user_id` for reads and writes.
- No service-role key is shipped to the browser.
- Existing browser-only progress is offered as an explicit one-time import after first sign-in; it is not silently assigned to whichever account logs in first.
- Saves are debounced and uploaded after changes. The app retains a local working copy while signed in.
- The public `/challenge/` page is usable without an account; guest checklist state remains on that device. Signed-in players use `public.challenge_day_completions`, a separate table with row-level policies scoped to `auth.uid()`. The page reuses the same Supabase browser session and auth credentials as the main app.
- Challenge progress is stored as one row per user and day. Players cannot read, create or remove another player's completion rows. Guest progress is imported only after the player explicitly chooses **Merge progress**.
- Current cloud save size is capped at 1 MiB per player.

## Acceptance checks before production

1. Create Player A, import or create progress, complete a quest and verify the row updates.
2. Sign in as Player A on a second browser/device; verify the same progress appears.
3. Create Player B; verify B sees no A data.
4. Confirm B cannot select or update A's row through the Supabase client (RLS must deny it).
5. Refresh, sign out/in and verify persistence.
6. Test email confirmation, password reset, mobile layout, offline behavior and simultaneous edits.
7. Run `npm test` and `npm run build`.

Do not merge this branch or replace the production deployment until the Supabase project is configured and all acceptance checks pass. Concurrent editing from two devices is last-write-wins in this first release; a future revision should add revision checks/merge handling before promising conflict-free collaboration.
