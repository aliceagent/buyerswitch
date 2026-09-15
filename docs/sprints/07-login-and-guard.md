# Sprint 07 — Profile selection and route guard

**Prerequisites:** 06. README defines execution order; IDs preserve the original package.
**Read first:** docs/00-overview.md, metrics-and-evidence.md, data-model.md and relevant seed/copy/design references.

## Build

/login picks saved fictional profiles. Guard after hydration: no profile→login; no workspace→onboarding step; complete→requested route. Billing never gates. /demo/ready reachable; reset deliberate with confirmation for local changes.

returnTo only validated relative allowlisted app paths; reject external/protocol-relative redirects. New workspace ?new=1 accessible to completed profiles. Print views share guard without nav. Signout clears active query/ephemeral context while retaining isolated profiles. Late responses cannot render previous-profile results.

## Acceptance

Refresh/deep links correct; no loops; print guard; open redirects rejected; profile isolation.

Run build/lint/typecheck; seed:check from 03 onward. Numerical changes run contract tests; interaction changes run relevant browser smoke. Record results/deviations in docs/BUILD-LOG.md. Never mark an unrun check passed.

Frontend demo only. Implement assigned sprint, preserve earlier behavior, do not start next sprint automatically.

**Suggested commit:** sprint-07: profile selection and route guard
