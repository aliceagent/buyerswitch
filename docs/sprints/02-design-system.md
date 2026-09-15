# Sprint 02 — Design system, types and hydration

**Prerequisites:** 01. README defines execution order; IDs preserve the original package.
**Read first:** docs/00-overview.md, metrics-and-evidence.md, data-model.md and relevant seed/copy/design references.

## Build

Apply supplied design tokens through CSS-first Tailwind theme. Montserrat UI, Spectral accent, tabular numerals. Build Wordmark, SentimentPill, Delta, StarRating, SourceTag, EmptyState, ErrorState, LoadingState and HydrationGate. Nullable values, support counts and neutral volume deltas.

Create domain/metric/filter types from data-model.md. Gallery shows long labels, zero/null, low support and keyboard focus. UI store uses versioned persistence, skipHydration, user scoping and finite error path for corrupt/blocked storage. Register every later store centrally. Check actual contrast and reduced motion; inherited palette claims are not proof of implemented accessibility.

## Acceptance

Gallery works at 400/1280px; no hydration warnings; storage failure recovers; 0% and missing data distinct.

Run build/lint/typecheck; seed:check from 03 onward. Numerical changes run contract tests; interaction changes run relevant browser smoke. Record results/deviations in docs/BUILD-LOG.md. Never mark an unrun check passed.

Frontend demo only. Implement assigned sprint, preserve earlier behavior, do not start next sprint automatically.

**Suggested commit:** sprint-02: design system, types and hydration
