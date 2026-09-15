# Sprint 15 — Dashboard charts

**Prerequisites:** 14. README defines execution order; IDs preserve the original package.
**Read first:** docs/00-overview.md, metrics-and-evidence.md, data-model.md and relevant seed/copy/design references.

## Build

Use supplied single-axis volume chart pattern, separate positive-share option, no ambiguous dual axes. Weekly/monthly/yearly from daily records; clip partial periods, null sentiment gaps, named mode/period tooltip.

Star chart five labeled levels/counts/shares and derived average. Sum raw shares to 100; explain rounding if needed. Star click filters band. Widgets register exact scoped export rows.

## Acceptance

Partial periods reconcile; no pre-history line; star counts equal KPI; chart/export table match.

Run build/lint/typecheck; seed:check from 03 onward. Numerical changes run contract tests; interaction changes run relevant browser smoke. Record results/deviations in docs/BUILD-LOG.md. Never mark an unrun check passed.

Frontend demo only. Implement assigned sprint, preserve earlier behavior, do not start next sprint automatically.

**Suggested commit:** sprint-15: dashboard charts
