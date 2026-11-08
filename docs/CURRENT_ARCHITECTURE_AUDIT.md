# PLAYFORGE Current Architecture Audit

**Audit type:** Source-level review of repository files  
**Branch:** `rebuild/product-foundation`  
**Important:** This is not a claim that the current project has been installed, executed, or fully tested in this environment.

## Verified repository structure

- Frontend: React 18, TypeScript, Vite.
- Entry point: `src/main.tsx`.
- Main application: `src/App.tsx` (large single-file application).
- Training plan logic: `src/planEngine.ts`.
- Styling: `src/styles.css` and `src/nextgen.css`.
- Backend: `server.mjs`, a Node HTTP server that also hosts Vite middleware in development and built static files in production.
- Nutrition helpers: `nutritionFallback.mjs`, `mealPhotos.mjs`.
- Tests: Node's built-in test runner under `tests/`.
- Deployment configuration: `vercel.json`.
- Existing state key: `playforge.v1` in browser localStorage.

## Existing frontend behavior observed

The main application currently models:
- Player profile and onboarding.
- Goals, experience level, preferred session duration and environment.
- Daily logs: sleep, energy, mood, hydration, habits, activities, completed quests, notes and meal entries.
- Experiments, custom habits, training program, nutrition preferences/plan and cached AI quest plans.
- Overview, quests, training, nutrition, habits, insights, coach and settings tabs.
- Daily XP and streak calculations based on saved logs.
- AI quest generation with a local fallback path.
- Training week generation in `src/planEngine.ts`.
- Coach chat through same-origin `/api/chat`; personal context is explicitly opt-in in the documented flow.

The main application source contains many UI, state, persistence and business-logic concerns together. This is a maintainability risk, but it is not a reason to rewrite it wholesale. First add tests around existing behavior, then extract stable domains in small steps.

## Existing backend behavior observed

The Node server currently exposes:
- `GET /api/health`
- `GET /api/meal-photo`
- `POST /api/nutrition-plan`
- `POST /api/chat`

The server reads AI provider configuration from environment variables. Ollama is the default local provider; an OpenAI-compatible hosted provider is optional. The backend contains request parsing, rate limiting, model calls, nutrition research retrieval, fallback plan creation and static serving.

The current rate limit uses an in-memory map keyed by remote address. This is not a distributed production rate limiter and should not be treated as sufficient protection for a public multi-instance service.

## Existing data and account limitations

- The current README documents browser-local profile and daily logs.
- The current source reads/writes `playforge.v1` in localStorage.
- The reviewed repository does not yet establish a Supabase Auth/Postgres integration.
- Existing local records are not a cloud account system and do not automatically sync across devices.
- XP is currently calculated from browser-saved records; a future multi-user reward ledger must be server-authoritative before rewards have financial or competitive value.
- Do not silently import browser-local records into newly created accounts. Provide an explicit export/import decision and clear consent.

## Deployment/configuration items requiring verification

- `vercel.json` currently rewrites `/api/*` to `https://playforge-ai-west.onrender.com/api/*`.
- The README currently documents a different Render API hostname: `https://playforge-je9z.onrender.com`.
- This mismatch must be resolved by inspecting the actual active Render service and Vercel deployment settings; do not guess which hostname is authoritative.
- The README describes a Vercel frontend and Render API deployment, but runtime health and deployment status have not been independently verified in this audit.
- `package.json` scripts include `npm run build`, `npm test`, and `npm run test:plans`. Dependencies must be installed before full validation.

## Security and reliability risks to investigate

1. Public API routes currently have no user authentication or per-user authorization.
2. In-memory IP rate limits are not durable or distributed.
3. Nutrition and chat endpoints may incur provider cost when configured with a hosted AI provider.
4. LocalStorage data can be lost when browser storage is cleared and is not an account backup.
5. The application is a large component with intertwined state and rendering; changes need characterization tests.
6. The external photo lookup depends on upstream availability and should continue to fail gracefully with accurate attribution/fallback labels.
7. Public production deployment should not rely on a developer's local Ollama endpoint.
8. Supabase keys, especially service-role credentials, must never be placed in client code or committed.

## PWA and activity tracking status

This source review did not identify an implemented PWA manifest/service worker or a real step-counter integration. Confirm the complete tree and current deployment before implementation. Browser foreground step tracking must be described as best-effort and capability-dependent; manual activity logging remains available. Do not promise background tracking in the PWA.

## Safe refactor order

1. Add tests for storage normalization, XP, streaks, quest state, training plans and nutrition flows.
2. Separate pure domain logic from React rendering without changing behavior.
3. Establish a stable API contract and consistent error response shape.
4. Add observability and production-safe rate/cost controls.
5. Introduce Supabase only after the project configuration and data ownership decisions are confirmed.
6. Keep local-first mode usable during the transition.
