# PLAYFORGE 2.8.0 — Meal Photos & Reward Loop

PLAYFORGE is a local-first fitness-gaming and habit-tracking prototype. It pairs a cinematic floating-world aesthetic with practical fitness and wellness flows. This version restores the original realm photography, fixes nutrition planning timeouts with a transparent local fallback, adds an in-app player guide, fetches matching food photographs for suggested meals where available, and rewards daily logging with transparent XP. Core realms are Game World, Quest Board, Training Arena, Nutrition Station, Habit Lab, Progress Observatory, Coach Nexus, and Settings.

> PLAYFORGE is a wellness prototype, not a medical device or clinically validated exercise planner. Records are self-reported. It does not diagnose, independently verify activity, or replace qualified professional guidance.


## Live deployment

- **Web app:** https://playforge-aaravpachouri.vercel.app
- **Render API:** https://playforge-je9z.onrender.com
- **API health check:** https://playforge-je9z.onrender.com/api/health

The Vercel frontend forwards same-origin `/api/*` requests to the Render service. The default model setting is local Ollama; a cloud host cannot reach a developer's `127.0.0.1:11434` Ollama instance. Nutrition planning can use the labelled local fallback, while live Coach Nexus AI responses require a reachable hosted model/API provider configured with server-side environment variables.

## What changed in this version

- **Game World:** floating realm art and portal-style navigation, with destinations for each of the main experiences.
- **Quest Board:** campaign map, image-backed missions, chapter/XP presentation, progress and mission completion using the existing daily log.
- **Training Arena:** three distinct session options per day across a full Monday–Sunday rotation. The generator advances options between calendar weeks and on user refreshes; exercises can remain familiar while sets, reps, rest and intensity progress across a four-week block. The user selects a session, tracks sets/rest, and records completion as a self-reported activity.
- **Meal photographs and attribution:** every visible selected meal and swap alternative requests a food-photo match from Wikimedia Commons; the file page, creator and reported licence are shown when a match is found. Requests are lazy-loaded near the viewport. If no suitable photo is available, a labelled real-food inspiration image from Unsplash is displayed instead, without claiming it is the exact dish. Upstream failures do not block planning. The photo-search request sends only the meal name, not the user's profile, diet preferences or activity logs.
- **Reward loop:** logging the first meal in each meal slot each day grants +12 Meal XP, a small celebration and a clear state in Nutrition Station. Habit Lab shows the daily XP total, next milestone, habits, meal slots, movement and quests. XP is a game mechanic based on saved user logs, not a health score.
- **Nutrition Station:** the preference form covers diet pattern, allergies, foods to avoid, cuisine, budget, cooking time, meals per day and goal. The server attempts bounded retrieval of official ICMR–NIN and WHO guidance, then requests a seven-day plan from the configured AI model. If the model is offline, its response times out, or it returns an invalid plan, the app builds a clearly labelled local fallback menu, filtered against the selected diet pattern and common allergen/exclusion terms. It still reports which guidance pages were actually retrieved; a fallback does not claim AI generation or live research that did not occur. Plans and meal swaps remain saved locally until the user explicitly rebuilds them.
- **Habit Lab:** daily check-in ring, movement, habits, hydration, sleep/energy, reflection notes and activity logging, using the earlier world background rather than the newly generated realm illustration.
- **Progress Observatory:** animated chart presentation and summaries derived from the user's saved activity, habit, sleep and energy entries. Missing data is shown as missing/zero rather than invented progress.
- **Coach Nexus:** a dedicated full-page fitness and nutrition chat experience plus a quick chat drawer. It reuses the same-origin `/api/chat` endpoint. Personal context is sent only when the user explicitly opts in.
- **Training progression:** week 1 builds familiarity, week 2 adds comfortable reps, week 3 may add sets when appropriate, and week 4 consolidates at a lower volume. This is a general template, not a clinical prescription or a guarantee of results.
- **Nutrition validation:** generated plans are checked for meal-slot completeness, variety, common allergy/exclusion terms, diet pattern, prior-week selected meal names and cooking-time preferences. This cannot guarantee allergy safety; always check labels and cross-contact.
- **How to use PLAYFORGE:** a new help button in the top bar opens a six-step field guide with direct links to profile setup, quests, training, nutrition, habits and progress.
- **Motion/accessibility:** page and card transitions, progress animation and responsive layouts, with reduced-motion support.

## Run locally

Requirements: Node.js 20+ and npm. For the default local AI mode, install Ollama and a model such as `llama3.2:latest`; see `AI_SETUP.md`.

1. Extract the ZIP.
2. In VS Code, open the **project root folder that directly contains `package.json` and `server.mjs`**.
3. Install dependencies:

   ```powershell
   npm install
   ```

4. Start the app and API together:

   ```powershell
   npm run dev
   ```

5. Open <http://localhost:5173>.

6. Run the complete unit test set (the tests mock the image API and do not require live web access):

   ```powershell
   npm test
   ```

7. To run just the nutrition fallback checks:

   ```powershell
   npm run test:plans
   ```

To make a production build and run it:

```powershell
npm run build
npm start
```

The server uses port 3000 by default in production (or the `PORT` environment variable). The development server uses port 5173 by default. AI keys are configured server-side through `.env`; see `.env.example` and `AI_SETUP.md`.

## AI Coach boundaries

Coach Nexus specialises in exercise, fitness, balanced nutrition, recovery, hydration, sleep routines, motivation and habits. It should redirect unrelated requests toward those areas. It offers general educational guidance and does not diagnose conditions or prescribe treatment. The prompt discourages unsafe exercise, extreme dieting and unsupported claims; it prioritises adequate nourishment and does not recommend weight-loss calorie deficits for teenagers. Model outputs can still be inaccurate, so treat advice cautiously and consult an appropriately qualified professional for individual medical needs.

The app does not train a new language model. Chat uses the model provider configured on the server. The nutrition endpoint uses a bounded AI request and, if it cannot complete, builds a visibly labelled local fallback from curated meal ideas that match common preference and allergen rules. If a user has so many restrictions that a safe varied fallback cannot be assembled, the app returns an actionable error instead of silently ignoring those restrictions. The fallback is a general meal-planning aid, not a clinician-reviewed diet.

## Privacy, storage and data honesty

- Profile and daily logs are saved in this browser's `localStorage`; they are not a shared cloud account or multi-device database. Export a backup to move your records.
- Workout records, meal entries, hydration and habit check-ins are user-entered/self-reported. A timer or tick box is not independent proof that an activity occurred.
- General chat sends messages and chat history to the configured model server. PLAYFORGE data is included only when the user enables **Include my PLAYFORGE data**; the summary excludes free-text reflection notes.
- Hosted AI calls may send prompts to the selected provider and can incur costs. Keep provider keys server-side; never use `VITE_` prefixes for secrets and never commit `.env`.
- A publicly hosted `/api/chat` endpoint needs authentication, rate limiting, cost controls, monitoring and security review before being offered to many users.
- XP is a game mechanic, not a health score. Missed quests do not remove XP.

## Images and art direction

Training Arena and Nutrition Station have been restored to the original Unsplash photo URLs used before the custom realm-art change. Habit Lab uses the pre-existing `playforge-world.png` backdrop again. Some exercise thumbnails and all photo fallbacks use Unsplash URLs and therefore require internet access. Matching meal photos are searched server-side on Wikimedia Commons when available; every chosen meal and alternative has a photo area, but a fallback food-inspiration image may not depict the exact dish. Images are illustrative only, not evidence of correct technique or exact ingredients. See `ASSET_SOURCES.md` and recheck individual asset licensing before commercial use.

## Project structure

```text
playforge/
├── server.mjs
├── mealPhotos.mjs
├── nutritionFallback.mjs
├── .env.example
├── AI_SETUP.md
├── ASSET_SOURCES.md
├── package.json
├── vite.config.ts
├── index.html
├── public/
│   ├── playforge.svg
│   ├── playforge-world.svg
│   └── playforge-world.png
├── tests/
│   ├── mealPhotos.test.mjs
│   └── nutritionFallback.test.mjs
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── planEngine.ts
    ├── styles.css
    ├── nextgen.css
    └── vite-env.d.ts
```

## Public-health references

- World Health Organization, [Physical activity](https://www.who.int/news-room/fact-sheets/detail/physical-activity)
- World Health Organization, [Guidelines on physical activity and sedentary behaviour](https://www.who.int/publications-detail-redirect/9789240015128)
- WHO Europe, [Age-specific physical-activity guidance](https://www.who.int/europe/news-room/fact-sheets/item/physical-activity)
- U.S. CDC, [Physical-activity guidelines](https://www.cdc.gov/physical-activity-basics/guidelines/index.html)

## Prototype limits and next steps

Nutrition research runs from the backend on each generation and fetches only the official pages listed in `server.mjs`; it is not a general-purpose web search. If pages cannot be retrieved, the plan reports `reference_only`. Meal ideas are AI-generated, not individually reviewed by a registered dietitian. The backend checks common allergy words but cannot guarantee safety; never rely on an AI-generated plan for severe allergy or medical nutrition needs. User data is stored locally; saved plans do not sync across devices.

This version is a functioning UI prototype plus a configurable AI API, not a hardened multi-user service. Browser-local records do not sync between devices or accounts. Charts represent the saved entries available in that browser. Before claiming outcomes, test with users and a labelled dataset and report measured results rather than assumptions.
