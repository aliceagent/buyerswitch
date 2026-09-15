# Sprint 04 — Query layer and numerical contracts

**Prerequisites:** 03. README defines execution order; IDs preserve the original package.
**Read first:** docs/00-overview.md, metrics-and-evidence.md, data-model.md and relevant seed/copy/design references.

## Build

Implement overview API as QueryResult<T> over immutable QueryContext. query.ts fetches once; pure query-engine owns exact scoping, dedup, aggregation, topic cohorts, support, baseline, Radar ranking, daily windows, pagination, terms and evidence.

Cache keys include complete context/filter/options; normalize sets, preserve cmp order. Bound cache and clear on context changes. Failed load resets for Retry; hooks reject stale responses and distinguish invalid data, no data and errors. Artificial latency optional, fixed, default off.

Implement URL parse/serialize/describe/chips. /dev/consistency runs pure contract checks. Explicit fixtures cover combined filters, repeated-topic union, overlap, mode weighting, partial months, null, prior dates and side-specific evidence. QA recalculates exact contributions, never hand-patches invented aggregate tables.

## Acceptance

Same scope across functions; last page never cycles; workspace boundary holds; stale responses ignored; full prior starts 2016-03-02.

Run build/lint/typecheck; seed:check from 03 onward. Numerical changes run contract tests; interaction changes run relevant browser smoke. Record results/deviations in docs/BUILD-LOG.md. Never mark an unrun check passed.

Frontend demo only. Implement assigned sprint, preserve earlier behavior, do not start next sprint automatically.

**Suggested commit:** sprint-04: query layer and numerical contracts
