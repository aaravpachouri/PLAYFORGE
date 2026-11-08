# PLAYFORGE Staged Product Roadmap

This roadmap evolves the current application. It is not a greenfield rebuild plan.

## Stage 0 — Baseline and product inventory
- Map each current tab, screen, dialog, interaction, API and local data field.
- Capture desktop/mobile screenshots and document existing journeys.
- Run the existing tests and build in a real local environment.
- Identify dead, duplicated, confusing or broken UI only after tracing its behavior.
- Record the Render/Vercel API hostname mismatch and verify actual deployment configuration.
- Establish characterization tests for core local state, XP, streaks, quests and training.

**Exit gate:** agreed inventory, reproducible baseline, prioritised issues and no unreviewed production changes.

## Stage 1 — Experience refinement
- Preserve the hybrid Game World + fitness identity.
- Improve navigation labels and hierarchy without deleting existing destinations.
- Make the overview surface today's progress and one clear next action.
- Improve onboarding, empty states, help and recovery from errors.
- Apply a consistent dark-premium design token system to existing screens.
- Validate touch targets, contrast, reduced motion, keyboard navigation and mobile layouts.

**Exit gate:** core journeys are understandable to a first-time user and regression checks pass.

## Stage 2 — Existing feature reliability
- Quests: completion state, duplicate reward prevention, local fallback and understandable objectives.
- Training: session state, timer behavior, completion summary and saved activity.
- Nutrition: preference validation, fallback transparency, photo attribution and failure handling.
- Habits: reliable check-ins and no repeatable XP farming by toggling.
- Progress: correct date windows, missing-data treatment and clear source labels.
- Coach: request timeouts, error handling, context opt-in and provider status.
- Settings: export, reset and privacy explanations.

**Exit gate:** each feature has acceptance tests and manual verification notes.

## Stage 3 — Data and account foundation
- Create a new Supabase project and configure development separately from production.
- Define Auth, profiles, data ownership and RLS policies before wiring UI.
- Keep local-first mode and export available.
- Design explicit, consent-based import from a user-provided local export; no silent migration.
- Use server-side authority for XP/reward ledger and sensitive operations.
- Add data deletion/export and account lifecycle handling.

**Exit gate:** two test accounts cannot access each other's data; RLS tests and backup/export checks pass.

## Stage 4 — PWA and activity
- Add manifest, icons, install guidance and a safe offline application shell.
- Never cache private authenticated API responses or tokens in a public service-worker cache.
- Add foreground step tracking only where browser sensors and permissions support it.
- Clearly show tracking state, limitations, pause/stop and manual entry.
- Save recoverable checkpoints and handle permission denial or device incompatibility.
- Keep manual activity entry as a first-class alternative.

**Exit gate:** offline, permission, resume, duplicate and unsupported-device cases are tested.

## Stage 5 — Coach and personalisation
- Use only consented, relevant activity summaries.
- Distinguish recorded facts from generated suggestions.
- Add bounded cost, rate and abuse controls.
- Provide transparent provider/fallback state and safe failure behavior.

**Exit gate:** privacy, prompt-safety, provider-failure and cost controls are reviewed.

## Stage 6 — Public readiness and business model
- Conduct security, accessibility, performance and cross-device testing.
- Add monitoring, incident response, backup/restore and support workflows.
- Evaluate free, subscription and partnership options only after validating user value and legal/provider eligibility.
- Do not sell personal activity or health data.
- Run a limited beta before broad launch.

**Exit gate:** launch checklist, privacy/terms, support, rollback and monitoring are ready.

## Release gates

Each stage produces a reviewable pull request or release candidate. A stage is not complete until:
1. acceptance criteria are written,
2. tests/build/manual checks are run and recorded,
3. QA and security findings are resolved or explicitly accepted,
4. preview is reviewed,
5. user gives explicit approval for merge/deployment.
