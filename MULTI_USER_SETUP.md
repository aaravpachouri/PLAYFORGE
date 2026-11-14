# PLAYFORGE multi-user setup (free tier)

PLAYFORGE uses one Supabase Auth identity per player. The main app's existing state shape remains one JSON document per authenticated player in `public.player_data`, so quests, logs, profile, nutrition preferences and progress stay together without changing the existing app screens.

## One-time Supabase setup

1. Create a Supabase project on the free plan. Do not enable paid compute or paid add-ons.
2. In **SQL Editor**, run `supabase/migrations/001_player_data.sql` and `supabase/migrations/002_challenge_day_completions.sql`.
3. In **Project Settings → API**, copy the Project URL and the publishable key. Never use the service-role key in the browser.
4. In Vercel → PLAYFORGE project → Settings → Environment Variables, configure:
   - `VITE_SUPABASE_URL` = Project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = publishable/anon key
5. Apply the correct values to Production, Preview and Development, then redeploy.

## Email authentication

In Supabase → Authentication → URL Configuration:
- Set **Site URL** to the existing production site: `https://playforge-fawn.vercel.app`.
- Add `https://*-aaravpachouri.vercel.app/**` to Redirect URLs for Vercel preview deployments.
- Add `http://localhost:5173/**` for local development.

The signup flow explicitly returns the confirmation link to the current app origin. Keep email confirmation enabled. A newly created account needs the normal one-time email confirmation; the same verified account then works in both PLAYFORGE and the Challenge. Supabase's built-in email sender has low sending limits; use it for limited testing only. Do not add a paid SMTP service without approval. If you customise the confirmation template, use `{{ .RedirectTo }}` for the redirect target instead of hardcoding the Site URL.

## Shared identity, separate application data

The standalone page at `/challenge/` uses the same Supabase project URL, publishable key, and default browser Auth storage as PLAYFORGE. Both experiences are served from the same origin, so a session created in either page is recognised by the other without another sign-in. Signing out from the Challenge signs out the shared browser session from PLAYFORGE too.

The data remains separate:
- `public.player_data` stores the main PLAYFORGE player save.
- `public.challenge_day_completions` stores only the seven Challenge checkboxes.
- Both tables are keyed by the same Supabase Auth `user_id`, but each has its own row-level security policies.
- No service-role key is shipped to either browser page.

The Challenge offers a one-time import of old browser-only checklist progress after sign-in. It does not silently assign anonymous progress to whichever account signs in.

## Acceptance checks before production

1. Sign in to PLAYFORGE, open `/challenge/` in the same browser, and verify the Challenge opens without another sign-in.
2. Complete one Challenge day; verify it appears in `challenge_day_completions` for that Auth user and does not modify `player_data`.
3. Sign out from the Challenge; verify PLAYFORGE now shows its signed-out state.
4. Create a new account from the Challenge, complete email confirmation once, then open PLAYFORGE and verify the same account is signed in.
5. Create a second test user and verify they cannot read, insert or delete the first user's Challenge days.
6. Open the same account on a second browser/device and verify Challenge progress persists.
7. Test password reset, email confirmation, mobile layout, and legacy checklist import/discard.
8. Run `npm test` and `npm run build`.

Do not merge this branch or replace the production deployment until all acceptance checks pass. Concurrent editing of main PLAYFORGE cloud saves from two devices remains last-write-wins in this release; do not promise conflict-free concurrent editing.
