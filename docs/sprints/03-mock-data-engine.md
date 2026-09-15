# Sprint 03 — Exact synthetic corpus

**Prerequisites:** 02. README defines execution order; IDs preserve the original package.
**Read first:** docs/00-overview.md, metrics-and-evidence.md, data-model.md and relevant seed/copy/design references.

## Build

Implement seed-data.md with canonical records and explicit occurrences. Taxonomy uses all 66 IDs. Generate exact visible/history totals, bounded text, valid offsets, six-source coverage, narrative scenarios and separate QA-error fixture. Original million-review and precise brand metrics are no longer targets.

Generate six files; manifest hashes other five. Seed AirPods family and Budget audio examples groups (a scenario label, not a price claim). Add seed/seed:check; validate fixture support, integers, dates, offsets, references, duplicate semantics, hashes and determinism. Authored teaching fixtures must be semantically correct. Generator repair attempts are bounded and fail diagnostically.

Report byte/compressed size, time and fixture IDs/scopes. Commit generated files. No runtime ingestion, marginal aggregate approximation, fabricated review URLs or unavailable-category data.

## Acceptance

12,000 visible Unique/12,840 All; 8,000 canonical history; fixture inequalities pass; two generations identical; budgets measured.

Run build/lint/typecheck; seed:check from 03 onward. Numerical changes run contract tests; interaction changes run relevant browser smoke. Record results/deviations in docs/BUILD-LOG.md. Never mark an unrun check passed.

Frontend demo only. Implement assigned sprint, preserve earlier behavior, do not start next sprint automatically.

**Suggested commit:** sprint-03: exact synthetic corpus
