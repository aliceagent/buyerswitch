# Sprint 06 — Fictional demo profile

**Prerequisites:** 05. README defines execution order; IDs preserve the original package.
**Read first:** docs/00-overview.md, metrics-and-evidence.md, data-model.md and relevant seed/copy/design references.

## Build

Signup uses Jordan Lee / jordan.lee@example.com / Example Brands preset. Only fictional display label editable. No real email/password collection, strength meter or reversible hash. Auth store has profile ID, selected profile and onboarding state.

Create/select profile atomically, route to workspace setup with draft plan. Billing optional. Create another demo profile generates unique ID, not email collision. Persist with migration/hydration gate. Setup progress: Profile → Workspace → Explore; login is separate.

## Acceptance

Refresh retains profile; repeated create distinct; no credentials; seeded profile intact; state isolated.

Run build/lint/typecheck; seed:check from 03 onward. Numerical changes run contract tests; interaction changes run relevant browser smoke. Record results/deviations in docs/BUILD-LOG.md. Never mark an unrun check passed.

Frontend demo only. Implement assigned sprint, preserve earlier behavior, do not start next sprint automatically.

**Suggested commit:** sprint-06: fictional demo profile
