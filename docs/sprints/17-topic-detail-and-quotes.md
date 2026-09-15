# Sprint 17 — Topic detail and full evidence

**Prerequisites:** 16. README defines execution order; IDs preserve the original package.
**Read first:** docs/00-overview.md, metrics-and-evidence.md, data-model.md and relevant seed/copy/design references.

## Build

Topic-specific count/sentiment/stars plus clearly labeled matching-review KPIs, time series, terms and quotes. Route topic replaces global topic visibly.

Terms derive from scoped text; click filters evidence only, with count/Clear. Quote rows source/stars/topic/sentiment/date/synthetic. Expand full text and exact UTF-16 span as text nodes. No fake original-review URL; any product link clearly says product, not evidence.

Correct mixed fixtures on T10 Audio Quality/Ergonomics. Resolve exact quote IDs with claim-side effective scope; no conflicting global brand filter on competitor excerpts.

## Acceptance

Offsets including emoji correct; semantic examples correct; terms only evidence; missing quote error; both sides link correctly.

Run build/lint/typecheck; seed:check from 03 onward. Numerical changes run contract tests; interaction changes run relevant browser smoke. Record results/deviations in docs/BUILD-LOG.md. Never mark an unrun check passed.

Frontend demo only. Implement assigned sprint, preserve earlier behavior, do not start next sprint automatically.

**Suggested commit:** sprint-17: topic detail and full evidence
