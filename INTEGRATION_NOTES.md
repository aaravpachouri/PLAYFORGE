# PLAYFORGE 2.1 integration notes

This archive expands the actual Vite/React project rather than the standalone HTML concept preview.

## Major routes/views added

- `training`: Training Arena (interactive guided session, set state, rest countdown, pause/resume and save to activity log).
- `nutrition`: Nutrition Station (meal idea library, dietary filters, meal slots, add/remove meal entries and hydration tracker).
- `insights`: relabelled Progress Observatory, with chart hero driven from local saved logs.
- `coach`: Coach Nexus as a full page, sharing the existing chat endpoint/state patterns; the quick Coach drawer remains available.

Game World realm portals now route to dedicated realms. Quest Board and Habit Lab retain their existing log/XP/check-in foundations while using the cyber-fantasy world art treatment. The project bundles the supplied `playforge-world.png`; photography still loads from Unsplash and needs internet access.

## Data handling

A backward-compatible log migration fills missing `meals` properties with an empty list. Meals and hydration are stored inside the existing `playforge.v1` localStorage daily log. Workout completion appends a self-reported activity entry; it is not verified by a device or an external source. Charts derive from the logs in that browser.

The `/api/chat` endpoint remains the same. Its system prompt is now focused on fitness, nutrition, recovery, hydration, sleep routines and habits with age-appropriate safety boundaries. The personal-context opt-in path is preserved.

## Verification status

- TypeScript/TSX syntax transpile checks: passed (syntax only).
- CSS block/bracket balance check: passed.
- ZIP integrity check: run during packaging.
- Full `npm run build`: not verified in this environment because the npm package registry could not be reached during dependency installation. Please run `npm install` and `npm run build` locally before deployment.

## Run

Open the extracted folder containing `package.json` and `server.mjs`, then run `npm install`, `npm run build`, and `npm run dev` (for development). Configure the server-side AI provider as described in `AI_SETUP.md` / `.env.example`.
