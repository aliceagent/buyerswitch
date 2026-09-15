# Sprint 01 — Scaffold and deployment foundation

**Prerequisites:** none. README defines execution order; IDs preserve the original package.
**Read first:** docs/00-overview.md, metrics-and-evidence.md, data-model.md and relevant seed/copy/design references.

## Build

Scaffold Next 16 in an empty temporary directory to avoid overwriting these instructions; copy application files into the project. Use Node 24 LTS, record exact resolved dependency and scaffold CLI versions, commit package-lock.json. ESLint CLI, TypeScript strict, @/* alias, Tailwind 4, shadcn, Recharts, Zustand, nuqs, icons, tsx and test tools from overview.

Root layout: distinct font variables, NuqsAdapter, metadata and required Suspense. Temporary home proves fonts/tokens. Scripts dev/build/start/lint/typecheck/test/test:e2e; seed scripts arrive in 03. CI uses npm ci, lint, typecheck, tests, build. Ignore build output/secrets but commit public/data. Configure Vercel with the same Node major. Append runtime directions to README. If deployment access is unavailable, record blocked status; never invent a live URL.

## Acceptance

Fresh install/build/lint/typecheck pass; CI/deploy status recorded; instructions retained; no backend/secrets.

Run build/lint/typecheck; seed:check from 03 onward. Numerical changes run contract tests; interaction changes run relevant browser smoke. Record results/deviations in docs/BUILD-LOG.md. Never mark an unrun check passed.

Frontend demo only. Implement assigned sprint, preserve earlier behavior, do not start next sprint automatically.

**Suggested commit:** sprint-01: scaffold and deployment foundation
