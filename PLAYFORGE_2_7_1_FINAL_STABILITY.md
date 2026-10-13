# PLAYFORGE 2.7.1 — Final stable release

## Fixes

- Fixed the nutrition-plan timeout path. The backend checks local Ollama availability before model generation, bounds the nutrition model request, and falls back to a curated local seven-day menu when the model is unavailable, slow, or returns unusable output. The fallback validates common allergies, excluded foods, dietary patterns, preparation time and previous chosen meal names; it is labelled in the plan and does not claim AI generation.
- Added a Node-only regression suite for fallback plan shape, meal variety, previous-week avoidance, dietary/allergy filtering, and clear failure when restrictions leave too few safe options.
- Restored the previous Training Arena and Nutrition Station Unsplash hero photographs, restored the pre-existing world artwork backdrop in Habit Lab, and removed the three custom generated realm WebPs from the project.
- Added a top-bar “How to use” guide with direct navigation to the main experiences, quest-debrief explanation, local-storage/export note, and privacy context explanation.
- Changed app/package version to 2.7.0.

## Local checks

- `node --check server.mjs` passed.
- `node --check nutritionFallback.mjs` passed.
- `node --test tests/nutritionFallback.test.mjs` passed 5/5 tests.
- TypeScript/TSX source validation and a full Vite production build still need to be run on a machine with the project's npm dependencies installed.

## Nutrition timeout behavior

- Research-source fetches remain bounded and each failed source is recorded as not retrieved.
- AI nutrition generation is bounded at 18 seconds for Ollama and 22 seconds for hosted OpenAI-compatible providers.
- If the AI stage fails or times out, PLAYFORGE returns a clearly labelled local fallback if at least seven suitable distinct chosen meals per slot can be produced. If the provided restrictions are too broad to assemble a diverse fallback safely, it returns a specific error and does not silently override them.
- The local fallback is a general meal-planning aid, not a medical diet or a clinician-reviewed nutrition plan.

## Before deployment

1. Extract into a separate folder.
2. Run `npm install`.
3. Run `npm run test:plans`.
4. Run `npm run build` and test the nutrition submit flow, fallback label, original image references, and help dialog at desktop/mobile sizes.
5. Keep existing production deployment unchanged until all checks pass.
