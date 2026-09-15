# Sprint 11 — App shell and early demo entry

**Prerequisites:** 04. README defines execution order; IDs preserve the original package.
**Read first:** docs/00-overview.md, metrics-and-evidence.md, data-model.md and relevant seed/copy/design references.

## Build

Build rail/top bar/PageFrame and /demo/ready now. Seed Alex Rivera, default workspace/groups/scenario views and empty QA. This is the necessary subset of 24a moved early. Ready is idempotent and selects profile without wiping edits; Restore scenario separate.

Nav links only completed routes; unbuilt features disabled with Planned in demo label. Top bar workspace switcher, synthetic/date/mode badge, profile. Search disabled until 21. Groups/views/QA store foundations now, so immutable query context is complete. Export rail shows supported formats only. Add print layout and recovery boundary. Ready lands on dashboard until Radar exists.

## Acceptance

Ready without signup/billing; hydration/context isolation; no dead nav; synthetic/history disclosure throughout.

Run build/lint/typecheck; seed:check from 03 onward. Numerical changes run contract tests; interaction changes run relevant browser smoke. Record results/deviations in docs/BUILD-LOG.md. Never mark an unrun check passed.

Frontend demo only. Implement assigned sprint, preserve earlier behavior, do not start next sprint automatically.

**Suggested commit:** sprint-11: app shell and early demo entry
