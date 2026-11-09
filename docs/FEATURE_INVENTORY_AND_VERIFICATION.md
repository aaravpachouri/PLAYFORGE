# PLAYFORGE Feature Inventory and Verification Plan

**Source reviewed:** `rebuild/product-foundation`  
**Review method:** repository source inspection; no local execution performed.  
**Purpose:** preserve existing user-facing behavior while planning safe improvements.

## Application entry and shell

| Area | Current implementation | Verification needed |
|---|---|---|
| App bootstrap | `src/main.tsx` mounts `App` under React StrictMode and imports both stylesheets | Confirm production build, font loading and no runtime errors |
| Navigation | `App.tsx` defines Game World, Quest Board, Training Arena, Nutrition Station, Habit Lab, Progress Observatory and Coach Nexus; Settings is represented as a tab/state path | Check desktop/mobile navigation, keyboard access, active states and route persistence |
| Motion | Framer Motion transitions and reduced-motion preference are used | Verify reduced-motion behavior and avoid excessive animation on low-end devices |
| Help/command UI | Keyboard shortcuts include Ctrl/Cmd+K, slash and Escape handling | Verify shortcuts do not intercept typing or assistive technology controls |

## Existing product areas

### Game World / Overview
- Receives player profile, XP, level, streak, weekly activity, quests, daily log and navigation callbacks.
- Acts as the product's landing/orientation area.
- Verify first-use empty state, returning-user state, demo labeling and next-action clarity.

### Quest Board
- Quest definitions can be produced by deterministic local logic or AI.
- AI path requests exactly three quests from `/api/chat`, validates JSON, title uniqueness, descriptions, activity type and icon values.
- Local quest generation adapts to profile goal, level, environment and recent logs.
- Quest completion is saved in the current day's `doneQuests`.
- Verify AI outage fallback, duplicate completion behavior, profile changes, date rollover and self-reported completion wording.

### Training Arena
- Uses `src/planEngine.ts` and `buildTrainingWeek` / `programPhase`.
- Training plans are generated from goal, experience, environment, program start date and generation counter.
- Existing session library includes warm-up, main and cool-down exercise instructions, set/rep targets and rest timing.
- Verify timer lifecycle, pause/resume, session completion, incomplete session handling, regeneration and saved activity entry.

### Nutrition Station
- Stores diet preferences, allergy/avoid-food text, cuisine, budget, preparation time, meal count and plan aim.
- Calls `POST /api/nutrition-plan`; backend can retrieve public nutrition references and use AI or local fallback.
- Supports meal logging/removal, water updates, plan alternatives and meal-photo lookup.
- Meal photo lookup is lazy-loaded with IntersectionObserver and a labelled fallback.
- Verify allergy/exclusion handling, provider outage, source attribution, plan regeneration, duplicate meal logging and photo-source fallback.

### Habit Lab
- Stores sleep, energy, mood, hydration, habit check-ins, notes and custom habits in daily logs.
- Habit options include movement, sleep routine, movement breaks, hydration, priority/focus and self-reflection.
- Verify custom habit CRUD, date-specific updates, reset behavior, repeated toggling and XP consistency.

### Progress Observatory
- Derives summaries and trends from stored daily logs and experiments.
- Verify date boundaries, empty history, incomplete logs, timezone transitions and consistency with the source records.

### Coach Nexus
- Calls `POST /api/chat`; optional personal context is only sent when explicitly selected.
- Backend system prompt sets age-appropriate and fitness/nutrition safety constraints.
- Verify consent state, context minimisation, request timeout, provider failure and clear indication that model output is not medical care.

### Settings / profile and data controls
- Profile stores display name, age band, goal, level, preferred minutes and environment.
- Includes JSON backup and CSV export, reset and demo-data controls.
- Verify backup contains all expected fields, CSV escaping, object URL cleanup, reset confirmation and demo isolation.

## Current state and data model

Browser key: `playforge.v1`.

Top-level state currently includes:
- `profile`, `logs`, `experiments`, `customHabits`, `demo`, `onboardingDone`
- `trainingProgram`, `nutritionPreferences`, `nutritionPlan`, `questPlanCache`

Daily log currently includes:
- date, sleep hours, energy, mood, water glasses
- habit map, activity entries
- completed quest IDs and quest notes
- meal entries and free-form notes

The storage reader normalises some missing fields (including meal arrays and experiments/custom habits), but catches any parse/access error and returns `null`. This means corrupted or inaccessible localStorage can appear like a fresh profile unless separately surfaced. Do not change this behavior without first designing a recovery/export path.

## Gamification observations

The current daily XP formula is:
- 35 XP per completed quest ID
- 8 XP per checked habit
- up to 30 XP per logged activity entry, based on minutes
- 12 XP per distinct meal slot represented in the day's meal entries

Total XP is derived from local logs. It is therefore a local game mechanic, not an authoritative or fraud-resistant reward ledger. Before accounts, leaderboards, subscriptions or redeemable rewards, define idempotency and server-side validation. Also test whether repeated activity entries, custom habits or quest state changes can produce unintended reward inflation.

The current streak calculation treats activity, completed quests or any checked habit as an active day. Verify the intended semantics and explain them to users.

## Backend endpoints observed

| Endpoint | Method | Current purpose | Key checks |
|---|---|---|---|
| `/api/health` | GET | Reports configured AI provider/model availability | Does not itself prove all AI operations work |
| `/api/meal-photo?q=` | GET | Wikimedia Commons photo lookup | Input bounds, attribution, upstream timeout/failure |
| `/api/nutrition-plan` | POST | Validate preferences, retrieve references, generate plan or fallback | Validation, body limit, rate limit, allergy behavior, cost/time bounds |
| `/api/chat` | POST | Coach and quest generation | Message validation, context opt-in, timeout, provider failure and abuse controls |

Backend observations:
- JSON responses set `Cache-Control: no-store`.
- Chat and nutrition generation use an in-memory IP-based rate-limit map (30 requests per 10 minutes per remote address).
- This limit is process-local and does not provide distributed or account-level enforcement.
- Request body parsing has explicit size limits.
- No authentication or per-user authorization was identified in the reviewed routes.
- The default AI provider is local Ollama; public production must be configured with an appropriate reachable provider or communicate unavailable status accurately.

## Existing tests

- `tests/mealPhotos.test.mjs`: matching Commons attribution, untrusted-host rejection and retry after temporary upstream failure.
- `tests/nutritionFallback.test.mjs`: seven-day structure, meal alternatives, week-to-week variation, diet/allergy exclusions and clear failure for excessive restrictions.
- `package.json` scripts: `npm test`, `npm run test:plans`, `npm run build`.

Current coverage is concentrated in meal photos and nutrition fallback. It does not yet establish regression protection for storage normalization, XP, streaks, quest completion, training plan generation, AI route validation, auth, data isolation or PWA behavior.

## Priority verification backlog

### P0 — Before changing core behavior
- [ ] Install dependencies from the lockfile and run `npm test`.
- [ ] Run `npm run build` (TypeScript project build plus Vite production build).
- [ ] Record baseline output and pre-existing failures.
- [ ] Verify actual Vercel rewrite target against the active Render service.
- [ ] Test fresh onboarding, returning profile, demo, reset, JSON export and CSV export.
- [ ] Test quest generation with AI unavailable and local fallback.
- [ ] Test workout generation, completion and log persistence.
- [ ] Test nutrition plan success, fallback, photo lookup failure and attribution.
- [ ] Test coach context opt-in and provider outage.

### P1 — Characterization tests
- [ ] Extract storage normalization into a pure tested module without changing schema.
- [ ] Add tests for XP and streak semantics.
- [ ] Add tests for quest completion idempotency and day rollover.
- [ ] Add tests for training plan determinism, progression and date boundaries.
- [ ] Add tests for CSV quoting and backup schema.
- [ ] Add route tests for request size, malformed JSON, validation and rate-limit response.

### P2 — Structural improvements
- [ ] Separate domain logic from UI incrementally.
- [ ] Establish shared API client/error handling.
- [ ] Add runtime validation for persisted local state.
- [ ] Add monitoring and production-safe abuse/cost controls.
- [ ] Introduce Supabase only with RLS and two-account isolation tests.

## Audit limitations

Source inspection does not establish:
- that the current deployment is healthy,
- that environment variables are configured correctly,
- that the active Render service matches either documented hostname,
- that the current tests/build pass,
- that every UI interaction behaves correctly in a real browser.

Those checks require an actual execution and preview environment.
