# Sprint 22a — Saved views, local alerts and Excel

**Prerequisites:** 20. README defines execution order; IDs preserve the original package.
**Read first:** docs/00-overview.md, metrics-and-evidence.md, data-model.md and relevant seed/copy/design references.

## Build

Extend views with rename/delete/copy link. Notifications derive from stored monthly fixture scope. Watch view saves local preference, no background/email promise.

Dynamic browser ExcelJS, frozen snapshot. Cover: synthetic/mode/filter/benchmark/dataset/overlay/snapshot/denominators. Long-format widget sheets, no merged data cells. Evidence sheet actual excerpts; exported row count is actual, not entire corpus.

Sanitize/uniquify worksheet names ≤31 chars. User strings are text, never formula objects, including =,+,-,@ prefixes. Progress/retry/complete; disclose any partial export. Unknown local group link warns.

## Acceptance

XLSX opens; snapshot matches UI; mid-export filter can't mix; text not formulas; alerts claim no sending.

Run build/lint/typecheck; seed:check from 03 onward. Numerical changes run contract tests; interaction changes run relevant browser smoke. Record results/deviations in docs/BUILD-LOG.md. Never mark an unrun check passed.

Frontend demo only. Implement assigned sprint, preserve earlier behavior, do not start next sprint automatically.

**Suggested commit:** sprint-22a: saved views, local alerts and excel
