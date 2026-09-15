# Sprint 13b — Shared data table

**Prerequisites:** 13a. README defines execution order; IDs preserve the original package.
**Read first:** docs/00-overview.md, metrics-and-evidence.md, data-model.md and relevant seed/copy/design references.

## Build

Typed reusable table: sort/search/select/page size/pagination/column visibility/keyboard. Actual total, stable IDs and secondary ID sort. Scope/search/size reset page; shrinking results clamps.

Select page means visible rows only. Explain clear/preserve selection on scope changes. Bulk Add to comparison writes cmp; Filter to selection writes entity filter. Accessible sort indicators and expanded-row focus.

## Acceptance

Actual last page; no recycling; count/search match; keyboard and empty recovery; compare/filter distinct.

Run build/lint/typecheck; seed:check from 03 onward. Numerical changes run contract tests; interaction changes run relevant browser smoke. Record results/deviations in docs/BUILD-LOG.md. Never mark an unrun check passed.

Frontend demo only. Implement assigned sprint, preserve earlier behavior, do not start next sprint automatically.

**Suggested commit:** sprint-13b: shared data table
