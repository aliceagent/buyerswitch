# Sprint 18 — Rating associations

**Prerequisites:** 15,17. README defines execution order; IDs preserve the original package.
**Read first:** docs/00-overview.md, metrics-and-evidence.md, data-model.md and relevant seed/copy/design references.

## Build

Star strip filters. Driver chart center topic labels, low-rating bars left and five-star right with explicit band denominator/n. Association, not estimated causal rating impact. Two-band query removes active star filter with visible notice.

Drill left/right carries topic+band. Composition donut must use partitioning quote shares, not overlapping review mention shares. Six plus Other, full table. Missing/sparse band shows insufficient evidence.

## Acceptance

Band denominators/drill correct; sparse suppressed; donut partitions units; no causal claim.

Run build/lint/typecheck; seed:check from 03 onward. Numerical changes run contract tests; interaction changes run relevant browser smoke. Record results/deviations in docs/BUILD-LOG.md. Never mark an unrun check passed.

Frontend demo only. Implement assigned sprint, preserve earlier behavior, do not start next sprint automatically.

**Suggested commit:** sprint-18: rating associations
