# Sprint 21 — Catalogue, reviews and search

**Prerequisites:** 18. README defines execution order; IDs preserve the original package.
**Read first:** docs/00-overview.md, metrics-and-evidence.md, data-model.md and relevant seed/copy/design references.

## Build

Catalogue rich brand/listing data with supported top topics and local art. Actions compare/group/view reviews/set focal, with scope/type/count validation.

Actual matching canonical records or occurrences by mode. All-mode duplicate observations labeled. Full review expands all quote spans; derived review sentiment labeled summary. No recycling.

Cmd/Ctrl+K grouped brands/products/topics/quotes/pages, highlighted literal query, keyboard, 200ms debounce/stale guard. Recent searches per profile; all results respect source boundary and correct evidence links.

## Acceptance

Mode labels and real last page; keyboard palette; scoped search; bulk guards; text rendered safely.

Run build/lint/typecheck; seed:check from 03 onward. Numerical changes run contract tests; interaction changes run relevant browser smoke. Record results/deviations in docs/BUILD-LOG.md. Never mark an unrun check passed.

Frontend demo only. Implement assigned sprint, preserve earlier behavior, do not start next sprint automatically.

**Suggested commit:** sprint-21: catalogue, reviews and search
