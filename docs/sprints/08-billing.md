# Sprint 08 — Optional commercial-flow preview

**Prerequisites:** 07. README defines execution order; IDs preserve the original package.
**Read first:** docs/00-overview.md, metrics-and-evidence.md, data-model.md and relevant seed/copy/design references.

## Build

/billing shows illustrative plan/monthly/annual selection. Read-only fictional “Test payment method · Visa ending 4242”. No PAN/CVC/expiry/name-on-card input, validation or storage, and no payment API.

Save demo selection writes user-owned plan/interval/previewStatus, continues to workspace or returnTo. Skip equally visible. Enterprise records local interest and says nothing sent. No charge/trial countdown/renewal email. All analysis remains accessible regardless of tier; this is packaging preview.

## Acceptance

No credential/card input; plan persists; totals correct; Skip/Enterprise recover; no network mutation.

Run build/lint/typecheck; seed:check from 03 onward. Numerical changes run contract tests; interaction changes run relevant browser smoke. Record results/deviations in docs/BUILD-LOG.md. Never mark an unrun check passed.

Frontend demo only. Implement assigned sprint, preserve earlier behavior, do not start next sprint automatically.

**Suggested commit:** sprint-08: optional commercial-flow preview
