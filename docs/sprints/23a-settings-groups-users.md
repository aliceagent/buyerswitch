# Sprint 23a — Workspace settings, groups and roles

**Prerequisites:** 21,22b. README defines execution order; IDs preserve the original package.
**Read first:** docs/00-overview.md, metrics-and-evidence.md, data-model.md and relevant seed/copy/design references.

## Build

Settings name/supported market/sources/mode/default dates/landing/sentiment scale. Schedule is planned local preference. Boundary change revalidates selections/counts. Group CRUD product unions, workspace isolated.

Fictional teammate table, no invitations. Viewer read/export; Analyst views/groups; Admin settings/team/QA in demo. Disabled actions explained, direct routes guarded; presentation not actual security. SSO unavailable preview.

Typed-name workspace delete clears its overlays, selects next or onboarding; never another profile's state.

## Acceptance

Boundary/mode real recount; groups isolated; role/direct route behavior; last workspace recovers; no outbound claims.

Run build/lint/typecheck; seed:check from 03 onward. Numerical changes run contract tests; interaction changes run relevant browser smoke. Record results/deviations in docs/BUILD-LOG.md. Never mark an unrun check passed.

Frontend demo only. Implement assigned sprint, preserve earlier behavior, do not start next sprint automatically.

**Suggested commit:** sprint-23a: workspace settings, groups and roles
