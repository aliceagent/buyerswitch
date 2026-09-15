# Sprint 19 — Comparison matrix

**Prerequisites:** 17. README defines execution order; IDs preserve the original package.
**Read first:** docs/00-overview.md, metrics-and-evidence.md, data-model.md and relevant seed/copy/design references.

## Build

Inclusive Category benchmark plus 1–5 same-kind entities; explicit focal header, one-vs-category supported. Sticky row/header, bounded horizontal scroll. Sources collapsed; topics mention share/positive share/n. Missing values show reason.

Biggest gaps considers supported spreads; differences-only tolerance. Cells drill side/topic evidence. Show global entity-filter replacement notice; topic filters select cohorts, not one-row matrices.

Aligned multi-entity periods with null and connectNulls=false; colors by entity ID, category navy dashed. Removing competitor cannot recolor survivors. Same scope/math as Radar.

## Acceptance

1–5 plus benchmark; sixth refused; no false missing parity; focal stable; scoped/mobile behavior correct.

Run build/lint/typecheck; seed:check from 03 onward. Numerical changes run contract tests; interaction changes run relevant browser smoke. Record results/deviations in docs/BUILD-LOG.md. Never mark an unrun check passed.

Frontend demo only. Implement assigned sprint, preserve earlier behavior, do not start next sprint automatically.

**Suggested commit:** sprint-19: comparison matrix
