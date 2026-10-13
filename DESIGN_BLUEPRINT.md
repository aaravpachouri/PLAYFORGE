# PLAYFORGE 2.0 — page-by-page design blueprint

The current React homepage is the visual anchor: preserve its dark sci-fi look, floating realm art, mint/cyan/violet glow, level and XP affordances. The other pages should not reuse the same generic card grid. Each should have a distinct job and layout.

## 1. Overview — keep the current home
- Preserve the existing game-world hero and realm-selector experience.
- Keep the next action prominent: launch today's quest, quick log, or ask the fitness coach.
- Keep only a small number of at-a-glance stats. Show demo vs real data clearly.

## 2. Quest Board — campaign / mission selection
- A wide campaign header with seasonal world art, daily mission progress and clear primary CTA.
- Missions shown as illustrated cards grouped by endurance, strength, recovery, nutrition and habits.
- Every mission has duration, difficulty, XP, objective checklist, and a clear status.
- Mission completion can be self-reported, manually documented, or optionally supported by an attachment. Never display "verified" unless a genuinely verified device/source exists.
- Completion triggers subtle particles/confetti and updates logged state; missed missions never remove earned XP.

## 3. Training Arena — guided workout mode
- A cinematic workout hero plus a compact session overview.
- Exercises become a step-by-step session flow with sets/reps/time, instructions, checkboxes and a rest timer.
- Buttons: start/pause, mark set, substitute/skip, reset, finish & save.
- Finishing shows an explicit session summary: date, duration, exercises completed, subjective effort and optional notes.
- Safety: avoid prescribing through pain, scale to experience, and do not pretend a timer proves that a physical exercise happened.

## 4. Nutrition Station — balanced food, no guilt
- Use free food photography in a meal inspiration gallery; keep each image's source/credit link discoverable.
- Use a flexible meal timeline and log-meal actions, balanced-plate illustration and simple food-group explanations.
- Account for familiar Indian foods, vegetarian/non-vegetarian preferences, allergies, budget and preparation time in the full product.
- Nutrition logging should be optional; do not default to weight-loss targets, strict calories, or food morality labels, especially for users under 18.

## 5. Habit Lab — action-first check-in
- Large touch-friendly checkboxes, daily progress ring, simple activity form and reflection note.
- Activities should record type, minutes and perceived intensity; sleep/energy fields should remain null when not entered.
- Checking/unchecking is immediate and visually clear. XP must not be repeatedly farmable by toggling a checkbox.

## 6. Progress Observatory — data, not decoration
- Interactive 7/14/30-day ranges, activity-minutes chart, consistency trend and habit completion chart.
- Include hover values and labels; distinguish real logs, estimated values, sample/demo data and missing values.
- Do not show fabricated health stats or imply causation from correlation. Analytics should derive from real timestamped records in the production app.

## 7. AI Fitness Coach — one speciality, genuinely conversational
- Full page or rich drawer with chat history, suggested prompts, clear typing/loading and actionable answers.
- Scope: exercise, fitness planning, nutrition, meal ideas, recovery and habit-building. Redirect unrelated topics politely.
- Reuse the configured server-side AI endpoint from the current React project; keep API keys server side.
- Include personal app logs only when the user explicitly opts in. Clearly identify the model/provider and connection state.
- The standalone HTML preview's coach replies are scripted to demo the layout; they are not a real AI connection.

## 8. Motion and interaction system
- Page transitions: 220–450ms, fade/translate/blur-in with light stagger.
- Card interactions: slight lift, subtle border glow, no aggressive parallax on every panel.
- Quest completion: one restrained celebration and updated counters.
- Training: timer progress ring, completed-set animation, session summary.
- Analytics: chart draw/animate when range changes.
- All motion respects `prefers-reduced-motion` and remains keyboard/touch accessible.

## Assets and sourcing
- `assets/playforge-world.png` is the bundled world illustration used for the overview background.
- Training/meal cards use Unsplash image CDN URLs. The README links to free-to-use photo pages/collections; check each image's specific source/licence before commercial deployment. If external images do not load, the prototype uses a designed gradient fallback.

## Implementation status in PLAYFORGE 2.1

This archive ports the main realm layouts into the Vite/React app instead of shipping only the standalone HTML concept. Training Arena logs a self-reported Strength activity; Nutrition Station stores meals and hydration in the browser-local daily log; Progress Observatory derives charts from existing saved logs; Coach Nexus uses the existing `/api/chat` endpoint and keeps personal context opt-in. Game-world art has been applied to all primary realms.

The UI still represents a prototype: the nutrition catalog is illustrative (not a personalised dietitian plan), activity is not independently verified, and logs are local to the current browser. The full build should be checked in the target environment after `npm install`; see `INTEGRATION_NOTES.md` for the checks performed and the remaining verification limitation.
