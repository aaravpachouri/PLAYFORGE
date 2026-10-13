# PLAYFORGE 2.8 — Real meal photos and reward loop

## What changed

- Added a server-side `GET /api/meal-photo?q=<meal name>` endpoint that searches Wikimedia Commons for food images, uses a 12-hour server cache, filters out common non-photo assets, validates the thumbnail host, and returns image source/licence metadata. No separate image API key is required.
- Added a `MealPhoto` UI for every selected meal and every alternative. If no matching photo is returned or the image fails to load, an appropriately labelled Unsplash food-inspiration photo is displayed; the UI does not claim a fallback is the exact dish. Attribution/source links are clickable.
- Added meal XP: +12 XP the first time the user logs each of Breakfast, Lunch, Snack, or Dinner during the day. Added visible daily XP progress, a next-milestone progress bar, and confetti for newly earned meal-slot XP, respecting reduced-motion settings.
- Added an XP reward deck to Habit Lab with clear habit, meal-slot, movement and quest totals. XP is a game engagement indicator based on user logs, not a health score or proof of activity.
- Kept the nutrition timeout fallback, allergy/diet preference checks, fixed saved meal-plan behavior and the earlier Training Arena/Nutrition Station artwork.
- Bumped the package version to 2.8.0.

## Validation

- `node --check server.mjs` passed.
- `node --check nutritionFallback.mjs` passed.
- `npm run test:plans` passed all 5 tests.
- CSS/TSX source structure and ZIP integrity are checked during packaging.
- A complete Vite production build still requires local validation because npm dependencies were not installed in this environment.

## Run

```powershell
npm install
npm run test:plans
npm run build
npm run dev
```

For each generated meal, a best-effort real photo lookup runs. If upstream image search is unavailable, the app still shows a clearly labelled food-inspiration fallback.
