# PLAYFORGE Product Foundation

**Status:** Working product direction  
**Branch:** `rebuild/product-foundation`  
**Product approach:** Evolve the existing application; do not replace it.

## Product vision

PLAYFORGE combines real-world movement, healthy routines and game-like progression in one approachable experience. The product should make everyday progress feel engaging without turning fitness into pressure, punishment or a competition that excludes beginners.

**Core loop:** Explore → Choose → Move / Log → Earn progress → Reflect → Improve.

## Experience direction

- **Primary experience:** Hybrid — gaming and fitness are equally important.
- **Visual direction:** Dark-premium, retaining the existing sci-fi / floating-world identity, with mint, cyan and violet accents used consistently.
- **Audience:** Everyone, from beginners and returning users to regular fitness enthusiasts.
- **Release model:** Staged releases with validation and approval at each gate.
- **Existing application:** React 18 + TypeScript + Vite frontend; Node HTTP server in `server.mjs`; browser-local state under `playforge.v1`; current AI routes remain part of the product.

## Existing experiences to preserve

| Existing area | Product responsibility | Preservation rule |
|---|---|---|
| Game World / Overview | Orientation, player identity, realm discovery and next action | Preserve the floating-world identity and make the next useful action clear |
| Quest Board | Optional daily missions and game progression | Keep goal-aware quests, local fallback, clear objectives and transparent self-reporting |
| Training Arena | Guided movement sessions | Keep session options, exercise guidance, set/rest controls and saved activity logs |
| Nutrition Station | Flexible meal planning and meal logging | Keep preferences, alternatives, meal photos/attribution, hydration and honest fallback labels |
| Habit Lab | Daily habit and wellbeing check-ins | Keep habits, water, sleep/energy, notes and activity logging |
| Progress Observatory | Personal history and trends | Keep charts derived from recorded logs; show missing data honestly |
| Coach Nexus | Fitness, nutrition, recovery and habit assistant | Keep server-side AI calls and explicit personal-context opt-in |
| Settings / Profile | Preferences, player setup and data controls | Preserve current settings and export capability |

No area is to be removed or substantially redesigned until its current behavior, dependencies and user value have been documented.

## Product quality principles

1. **Preserve before replacing.** Improve the current React application and Node API incrementally.
2. **One coherent product.** Realms should have distinct purposes but share navigation, terminology, controls and visual tokens.
3. **Beginner-safe by default.** Offer adaptable options, clear instructions and low-pressure progress.
4. **Honest progress.** Self-reported activity is not device-verified activity. XP is a game mechanic, not a health score.
5. **Data ownership.** Explain where data is stored and provide user-controlled export. Never silently migrate legacy browser data into a new account.
6. **Privacy by design.** Personal context for AI remains opt-in. Do not sell personal activity or health data.
7. **Accessible premium design.** Keyboard/touch support, readable contrast, reduced motion and responsive layouts are baseline requirements.
8. **No feature regressions.** Every existing feature gets characterization tests before risky refactors.
9. **No fake capability.** Do not claim background step counting, device verification, medical validation, live research or AI generation unless actually supported.
10. **Incremental architecture.** Extract modules from the existing monolith only when a clear boundary and regression coverage exist.

## Scope boundaries

### Improve in the current product
- Information hierarchy, navigation and onboarding.
- Visual consistency and responsive behavior.
- Reliability of existing quests, workouts, nutrition, habits, analytics and coach flows.
- Data backup/export, storage resilience and clear error/loading/empty states.
- Performance, accessibility, security and test coverage.

### Add progressively
- Supabase account and cloud-sync foundation after a project is created and configured.
- PWA installability and offline shell.
- Foreground step tracking with explicit browser capability/permission messaging and manual fallback.
- Later platform integrations only after feasibility, privacy and device support are validated.
- Monetisation only after core reliability, privacy, legal and eligibility checks.

### Explicitly not in the first foundation pass
- A full rewrite or framework migration.
- Removing existing realms to force a simplified navigation model.
- Background step tracking claims in a browser PWA.
- Payments, subscriptions or partner marketplace before account/data foundations and user value are validated.
- Any automatic production deployment.

## Success criteria

A staged release is ready only when:
- Existing key user journeys still work.
- New changes have tests and documented acceptance criteria.
- Build and test results are recorded from an actual execution environment.
- No secrets are exposed in client bundles or repository history.
- Data handling, consent, export and error states are clear.
- Mobile and desktop journeys are checked.
- A preview is reviewed before any production promotion.
