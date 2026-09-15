# Sprint 13a — KPI and widget primitives

**Prerequisites:** 12. README defines execution order; IDs preserve the original package.
**Read first:** docs/00-overview.md, metrics-and-evidence.md, data-model.md and relevant seed/copy/design references.

## Build

KPI strip/WidgetCard with loading/error/empty. Nullable metrics, units/support/prior reason; footers show workspace totals, not unrestricted corpus. Topic KPI explains opinions in matching reviews.

Export registry: stable widget id/title/getExportRows/chart handle. Snapshots resolve once. Chart wrappers use token-derived literal colors, null gaps, stable entity colors. Menus offer table alternative and supported export formats; no unavailable export pretending to work.

## Acceptance

KPI/table agree; zero/null distinct; workspace denominator; accessible colors/legend; registry current data.

Run build/lint/typecheck; seed:check from 03 onward. Numerical changes run contract tests; interaction changes run relevant browser smoke. Record results/deviations in docs/BUILD-LOG.md. Never mark an unrun check passed.

Frontend demo only. Implement assigned sprint, preserve earlier behavior, do not start next sprint automatically.

**Suggested commit:** sprint-13a: kpi and widget primitives
