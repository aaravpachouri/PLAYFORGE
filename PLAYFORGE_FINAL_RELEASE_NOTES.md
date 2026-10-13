# PLAYFORGE 2.7.1 — Final Stabilisation

## Nutrition timeout

The `/api/nutrition-plan` route now bounds model generation to 18 seconds for local Ollama and 22 seconds for a hosted OpenAI-compatible provider. If the model is unreachable, slow, or returns a plan that fails validation, the route attempts a clearly labelled local seven-day fallback. The fallback respects common dietary patterns, declared allergies/exclusions, preparation-time preferences, meal-slot structure and recent chosen meal names; it refuses to generate a fallback if too few distinct candidates remain.

Official ICMR–NIN and WHO source pages are attempted on the backend with bounded fetches. The UI records which pages were actually retrieved. If the model is timed out and local fallback is used, the research area explicitly says the menu was assembled locally and does not claim the model generated it or that all source pages were retrieved.

## Original visuals restored

- Training Arena: original Unsplash hero photo from the earlier React version.
- Nutrition Station: original Unsplash food photo from the earlier React version.
- Habit Lab: restored its earlier non-photo hero treatment and original world ambience; removed the later generated realm artwork.
- Removed the custom generated realm WebP assets from `public/`.

## Usability

- Added a top-bar **How to use** guide with direct links to settings, quests, training, nutrition, habits, and progress.
- The guide explains that quest completions and activity entries are self-reported, local browser data must be exported before switching devices/clearing browser data, and nutrition/coach output is general guidance rather than medical care.

## Validation run in the packaging environment

- `node --check server.mjs`
- `node --check nutritionFallback.mjs`
- `node --test tests/nutritionFallback.test.mjs` — 5 tests passed
- TypeScript/TSX syntax transpilation checks passed for `src/App.tsx`, `src/main.tsx`, and `src/planEngine.ts`
- CSS parse checks passed for `src/nextgen.css` and `src/styles.css`
- Full Vite production build was not confirmed because `npm install` could not reach the npm registry in this environment. Run `npm install`, `npm run test:plans`, and `npm run build` locally before deploying.

## Important limits

The local fallback is a practical general meal-planning aid, not a dietitian-reviewed plan. No automated allergy filter can guarantee ingredient-label or cross-contact safety. Images are illustrative and the restored Unsplash image URLs need internet access.
