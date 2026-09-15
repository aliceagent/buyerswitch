# Sprint 09 — Workspace boundaries

**Prerequisites:** 08. README defines execution order; IDs preserve the original package.
**Read first:** docs/00-overview.md, metrics-and-evidence.md, data-model.md and relevant seed/copy/design references.

## Build

Category/market/retailer/name controls. Audio seeded; other seven original categories remain unavailable previews. US four sources; US+Canada six. UK/DE unavailable with local-interest and Explore audio actions.

Summary queries actual draft boundary. Removing Target removes its records; require one source. Name distinguishes US/US+Canada and stops auto-filling after edit. Persist draft by profile. New workspace does not replace active context until complete; cancel restores it. No fake operational workspace or delivery promises.

## Acceptance

Selected counts change; US no CA; draft refresh; unsupported selection recovers; cancel preserves old workspace.

Run build/lint/typecheck; seed:check from 03 onward. Numerical changes run contract tests; interaction changes run relevant browser smoke. Record results/deviations in docs/BUILD-LOG.md. Never mark an unrun check passed.

Frontend demo only. Implement assigned sprint, preserve earlier behavior, do not start next sprint automatically.

**Suggested commit:** sprint-09: workspace boundaries
