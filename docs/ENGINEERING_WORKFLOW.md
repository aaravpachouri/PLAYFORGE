# PLAYFORGE Engineering Workflow

**Working branch:** `rebuild/product-foundation`  
**Production branch:** `main`  
**Release policy:** staged; no direct pushes to main and no automatic production deployment.

## Repository rules

- Treat `main` as protected production source of truth.
- Work on a dedicated branch for each coherent change, branched from the approved foundation branch.
- Never force-push, rewrite history, or directly commit to `main`.
- Keep changes small enough to review and revert.
- Do not overwrite application source from an external archive or unreviewed import.
- Never commit `.env`, API keys, service-role keys, OAuth credentials, tokens, or user data.
- Do not merge or deploy without explicit user approval.
- Preserve existing behavior unless a change is intentionally specified and tested.

## Change lifecycle

1. **Discover:** inspect relevant files, existing behavior, tests and deployment dependencies.
2. **Specify:** write the user problem, intended behavior, non-goals and acceptance criteria.
3. **Baseline:** identify current tests and known failures before edits.
4. **Design:** choose the smallest compatible implementation; document migration and rollback risks.
5. **Implement:** change one coherent concern at a time; prefer complete, maintainable modules over scattered patches.
6. **Verify:** run focused tests, full test suite, TypeScript/build, and manual journeys where possible.
7. **Review:** QA and security review the diff; check accessibility, mobile behavior, privacy and error states.
8. **Preview:** deploy only to a non-production preview after explicit approval and configured safeguards.
9. **Release gate:** obtain explicit approval before merge to `main` or production promotion.
10. **Observe:** verify health, logs and critical user journeys after an approved release; retain rollback instructions.

## Agent roles

Agents are coordinated reviewers/workers with non-overlapping responsibilities. They do not independently change shared files or make release decisions.

| Role | Responsibility | Cannot do alone |
|---|---|---|
| Product Architect | Map current behavior, domain boundaries, dependencies and migration strategy | Rewrite application architecture without an approved design |
| Product/UX Designer | Navigation, onboarding, information hierarchy, accessibility and visual consistency | Remove a feature without product approval |
| Frontend Engineer | React UI and client-side domain integration | Change API/data contracts unilaterally |
| Backend Engineer | Node API, validation, persistence, provider integration and observability | Expose secrets or bypass authorization |
| Gamification Engineer | Quests, XP, streaks and progression rules | Make client-side XP authoritative for valuable rewards |
| AI Engineer | Coach/quest/nutrition model integration, fallback and privacy controls | Invent data, imply medical validation or silently send personal context |
| QA Engineer | Characterization tests, regression tests and release evidence | Mark unrun tests as passed |
| Security Reviewer | Threat model, auth/RLS, secrets, abuse and data handling | Approve unresolved critical findings |
| Release Manager | Branch hygiene, PR, preview, release checklist and rollback | Merge or deploy without explicit user approval |

## Definition of done

A change is done only when:
- Its acceptance criteria are met.
- Existing related behavior is covered by regression tests.
- Focused and full tests have actually run, with results recorded.
- TypeScript and production build pass where relevant.
- Errors, loading, empty and offline states are handled.
- Responsive and keyboard/accessibility checks are complete for touched UI.
- Data/privacy/security implications are documented.
- Diff contains no unrelated formatting or generated-file churn.
- No secrets or personal data are included.
- Release notes and rollback notes exist for risky changes.

If the execution environment cannot run a check, label it **not run**; never infer a pass from source inspection.

## Pull request checklist

- [ ] Scope and acceptance criteria are clear.
- [ ] Existing user journeys remain intact.
- [ ] No direct changes to `main`.
- [ ] No secrets or user data.
- [ ] Tests added/updated and results attached.
- [ ] Build/typecheck results attached or marked not run.
- [ ] Accessibility/mobile/privacy/security review completed.
- [ ] Database migrations are additive, reversible where practical, and documented.
- [ ] Preview is isolated from production data and credentials.
- [ ] User approval received before merge/deploy.
