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
- Current cloud save size is capped at 1 MiB per player.

## Challenge UI shared account

The standalone page at `/challenge/` uses the same Supabase project URL, publishable key, and default browser Auth storage as PLAYFORGE. Because both experiences are served from the same origin, a user who is already signed in to PLAYFORGE is recognised by the Challenge UI without another login. Signing in or creating an account in the Challenge also creates the same Auth session used by the main app. Email confirmation remains a one-time requirement for a newly created account; it is not repeated per experience.

Challenge completion records are stored only in `public.challenge_day_completions`, keyed by the same Auth `user_id`. PLAYFORGE progress remains in `public.player_data`. Separate tables and per-user RLS policies keep the experiences' data independent.

Run `supabase/migrations/002_challenge_day_completions.sql` in the same Supabase project if the challenge completion table or its RLS policies are not already present. Never expose a service-role key in the Challenge page.

The Challenge page uses the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` Vercel environment variables as the main app. Preview deployments should use the same Supabase project and have the appropriate preview redirect URLs configured.

Existing anonymous Challenge checkboxes are offered as a one-time import after sign-in. They are not silently assigned to an account. Signing out from the Challenge signs out the shared browser session from PLAYFORGE too.

## Acceptance checks before production

1. Sign in to PLAYFORGE, open `/challenge/` in the same browser, and verify the Challenge opens without another sign-in.
2. Complete one Challenge day; verify it appears in `challenge_day_completions` for that Auth user and does not modify `player_data`.
3. Sign out from the Challenge; verify PLAYFORGE now shows its signed-out state.
4. Create a new account from the Challenge, complete email confirmation once, then open PLAYFORGE and verify the same account is signed in.
5. Create a second test user and verify they cannot read, insert or delete the first user's Challenge days.
6. Open the same account on a second browser/device and verify Challenge progress persists.
7. Test password reset, email confirmation, mobile layout, and legacy checklist import/discard.
8. Run `npm test` and `npm run build`.

Do not merge this branch or replace the production deployment until all acceptance checks pass.

1. Create Player A, import or create progress, complete a quest and verify the row updates.
2. Sign in as Player A on a second browser/device; verify the same progress appears.
3. Create Player B; verify B sees no A data.
4. Confirm B cannot select or update A's row through the Supabase client (RLS must deny it).
5. Refresh, sign out/in and verify persistence.
6. Test email confirmation, password reset, mobile layout, offline behavior and simultaneous edits.
7. Run `npm test` and `npm run build`.

Do not merge this branch or replace the production deployment until the Supabase project is configured and all acceptance checks pass. Concurrent editing from two devices is last-write-wins in this first release; a future revision should add revision checks/merge handling before promising conflict-free collaboration.
