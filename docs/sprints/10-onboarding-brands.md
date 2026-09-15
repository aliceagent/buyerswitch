# Sprint 10 — Brands and sample preparation

**Prerequisites:** 09. README defines execution order; IDs preserve the original package.
**Read first:** docs/00-overview.md, metrics-and-evidence.md, data-model.md and relevant seed/copy/design references.

## Build

Focal brand and up to four competitors, no duplicates/self. Suggest eligible brands by review-volume proximity, explicitly not market share. Allow fewer for sparse scope.

Preparation animation labeled simulated; counters query selected workspace and actual duplicate occurrences. Fast path removes delay. Retry/Back on error; completion idempotent across refresh/double click. Create workspace once and initialize scoped groups/views/team/QA. First entry seeds cmp from onboarding; default landing Radar when available.

## Acceptance

No self-comparison; source counts reconcile; retry/refresh no duplicate workspace; focal choice retained.

Run build/lint/typecheck; seed:check from 03 onward. Numerical changes run contract tests; interaction changes run relevant browser smoke. Record results/deviations in docs/BUILD-LOG.md. Never mark an unrun check passed.

Frontend demo only. Implement assigned sprint, preserve earlier behavior, do not start next sprint automatically.

**Suggested commit:** sprint-10: brands and sample preparation
