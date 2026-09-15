# Sprint 16 — Topics overview

**Prerequisites:** 13b. README defines execution order; IDs preserve the original package.
**Read first:** docs/00-overview.md, metrics-and-evidence.md, data-model.md and relevant seed/copy/design references.

## Build

All active leaf rows, top-N default, bounded horizontal chart scroll/readable axis, search-to-highlight and mention count/share sort. Explicit sentiment basis, n and low-support state. Suppressed rows reconcile through Hidden topics subtotal.

Summary: most discussed, largest supported change, most positive/negative with support. Mega rows separate from leaf totals; authoring disabled until 23b. Bar click sets topic visibly and opens detail. No invented numbers for sparse topics.

## Acceptance

Readable at 400px; review-level denominator; no 100%-sum assumption; summary scope correct; sparse not strong finding.

Run build/lint/typecheck; seed:check from 03 onward. Numerical changes run contract tests; interaction changes run relevant browser smoke. Record results/deviations in docs/BUILD-LOG.md. Never mark an unrun check passed.

Frontend demo only. Implement assigned sprint, preserve earlier behavior, do not start next sprint automatically.

**Suggested commit:** sprint-16: topics overview
