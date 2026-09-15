# Sprint 14 — Dashboard entity exploration

**Prerequisites:** 13b. README defines execution order; IDs preserve the original package.
**Read first:** docs/00-overview.md, metrics-and-evidence.md, data-model.md and relevant seed/copy/design references.

## Build

Brand/Product/Group/Hierarchy tabs with reviews/positive share/stars and relevant metadata. Default reviews descending; local thumbnails/initial tiles. Groups labeled overlapping, do not sum. Focal row marked with Radar/compare links.

Compare versus filter separate bulk actions. Hierarchies include descendant leaves. Tabs preserve scope. Empty/unknown groups have action. All metrics queried; no old reference constants.

## Acceptance

Disjoint rollups reconcile; group overlap explained; action preserves scope; boundary applies everywhere.

Run build/lint/typecheck; seed:check from 03 onward. Numerical changes run contract tests; interaction changes run relevant browser smoke. Record results/deviations in docs/BUILD-LOG.md. Never mark an unrun check passed.

Frontend demo only. Implement assigned sprint, preserve earlier behavior, do not start next sprint automatically.

**Suggested commit:** sprint-14: dashboard entity exploration
