# Sprint 24b — Release polish and acceptance

**Prerequisites:** 24a. README defines execution order; IDs preserve the original package.
**Read first:** docs/00-overview.md, metrics-and-evidence.md, data-model.md and relevant seed/copy/design references.

## Build

Run release-gates.md. Branded 404/global/route/widget errors; no stack traces. Viewports 400/768/1280/1920; only bounded data regions horizontal scroll.

Keyboard, labels, focus restoration, chart tables, reduced motion, actual contrast/grayscale plus automated scan; no conformance claim from score alone. Replace marketing placeholders with actual screenshots. No TODO/sprint stubs/fake links/live promises.

Inspect XLSX/PPTX/print in viewers. Record measured performance/payload/test conditions/results/limitations/deployment in BUILD-LOG.md. These are application implementation checks, not checks already performed by this archive revision.

## Acceptance

Gates run or blockers recorded; no console/hydration errors; exports open; screenshots/deploy match build.

Run build/lint/typecheck; seed:check from 03 onward. Numerical changes run contract tests; interaction changes run relevant browser smoke. Record results/deviations in docs/BUILD-LOG.md. Never mark an unrun check passed.

Frontend demo only. Implement assigned sprint, preserve earlier behavior, do not start next sprint automatically.

**Suggested commit:** sprint-24b: release polish and acceptance
