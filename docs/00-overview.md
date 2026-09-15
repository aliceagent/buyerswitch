# Architecture and build conventions — v2

Read README.md and REVIEW-AND-CHANGES.md first. This package specifies a frontend sales demo. It does not build a production service.

## Authority

README.md defines sequence/scope. metrics-and-evidence.md governs calculations and evidence. data-model.md governs shapes. seed-data.md governs fixtures. design-tokens.md governs visuals; copy-deck.md governs customer language. Sprint files implement those contracts. BuyerSwitch-PRD.md governs future product direction and cannot silently add production work to a demo sprint. Update the relevant contract when a decision changes; do not accumulate contradictory overrides.

## Stack

Next 16 App Router, compatible React 19 release, TypeScript strict, Tailwind 4, shadcn/ui, Recharts 3, Zustand 5, nuqs 2, lucide-react, clsx, tailwind-merge, date-fns. Node 24 LTS. Resolve stable compatible patches and pin exact versions, including CLI scaffold versions used. Commit lockfile; npm ci in CI. See technical-sources.md.

Dev tools: tsx for seeds; Vitest for numerical contracts; Playwright for essential browser paths. ExcelJS and PptxGenJS are added only in their export sprints, with browser entry validation and dynamic imports. Avoid new dependencies without a concrete need and recorded decision.

No database, API endpoints, server-side persistence, real authentication, LLM calls, CRM calls, payment SDKs, outbound invitations or analytics collection. Next provides rendering; “no backend” means no application service or private data plane. Public seeded assets are publicly downloadable.

## Structure

- src/app/(marketing): home, product, pricing.
- src/app/(auth): simulated signup/login/billing/onboarding.
- src/app/(app): dashboard, topics, topic detail, star-rating, comparison, switch-radar, products, reviews, settings.
- src/app/(print): /switch-radar/brief without nav, but inside the demo context/hydration guard.
- src/app/demo: ready and reset.
- src/app/dev: gallery and consistency diagnostics.
- src/lib: query.ts public entry; query-engine.ts pure calculations; metrics.ts; filters.ts; format.ts; demo.ts; snapshot.ts.
- src/components: ui, brand, layout, filters, charts, widgets, evidence.
- src/stores: auth, workspace, views, groups, qa, billing, team, ui.
- src/types, scripts and public/data.

Server page modules export metadata and render client components where needed. App Router layouts wrap NuqsAdapter and Suspense where search hooks require it. Layouts must hydrate before route decisions. Never replace the root instructions README with a scaffold README; append runtime setup.

## Query boundary

query.ts is the sole entry to corpus access; it lazily fetches same-origin JSON. A shared in-flight load promise avoids duplicate downloads. On error clear the rejected promise and offer Retry. Verify schema/dataset version; do not quietly mix stale files.

Create a client bound to immutable QueryContext. Every request captures that context plus filter/options. Cache key includes userId, workspaceId, datasetVersion, overlayRevision, review mode, normalized filters, comparison order and all paging/search options. Canonicalize set-like arrays; preserve comparison order. Cap cache entries and clear on reset/signout/context change.

Hook result state includes loading/error/data, request ID and cancel/stale guard. A late request cannot overwrite a newer filter/workspace. Abort can detach one subscriber without canceling a shared fetch needed by others. Artificial latency is fixed and optional; default fast. Error, invalid-data and insufficient-data states are distinct.

API: getWorkspaceTotals(), getKpis(f), getEntities(f,kind), getSeries(f,grain), getStarBreakdown(f), getTopics(f), getTopicDetail(f,id), getTopicSummaries(f), getQuotes(f,opts), getReviews(f,opts), getStarDrivers(f), getComparison(f,cmp), getComparisonSeries(f,cmp,grain), getSwitchRadar(f,cmp), search(f,term). Each returns QueryResult<T>; paged methods wrap Page<T>. Evidence resolution takes claim scope and exact IDs. No cycling results.

## State and isolation

bs.auth stores fictional profile IDs and selected profile only. Other stores use byUser; workspace-owned groups, views, QA, team and preferences also use byWorkspace[workspaceId]. Billing is user-owned; UI has both user-level preferences and workspace settings. Group IDs are local to workspace.

All stores use versioned persistence, skipHydration and explicit rehydrate. Gate has a finite completion/error path; corrupt JSON or denied/quota-full storage offers reset or a clearly labeled temporary session. Never leave an infinite hydration skeleton. No component writes directly to storage.

Route state machine: no profile → login; profile without workspace → onboarding; completed workspace → requested app route. Billing never gates app access. Public marketing and /demo/ready always reachable. A new-workspace flow with ?new=1 must not be bounced. Deep links preserve a validated returnTo restricted to app-relative allowlisted routes; no open redirects.

## URLs and sharing

Filter keys h,b,p,g,t,s,r,pr,from,to; comparison cmp; local workspace reference w; schema v=2. No user details in URLs. Atomic Apply writes history once; debounced typing replaces history. Browser back restores prior applied state. Validate malformed dates, out-of-range dates, unknown IDs and mixed entity kinds; show what was reset rather than silently widening.

useFilterHref preserves relevant global scope. On workspace change intersect IDs with the new boundary, clear incompatible groups/cmp, and explain changes. Saved views store filters, cmp, mode, datasetVersion and workspace identity.

Copy link reconstructs seeded contexts in another browser. Custom local groups/QA cannot be shared through an ID-only URL. Show “Local configuration unavailable” with baseline or reset choices; do not silently claim identical results. Export carries a frozen snapshot for that situation.

## Baseline quality

Every sprint: build, lint, typecheck, relevant acceptance cases; seed:check from 03 onward. Numerical changes run contract tests; route/state changes run the relevant browser flow. CI uses npm ci and pinned runtime. Avoid redundant test suites for typography-only edits.

Core targets: /demo/ready interactive ≤3 seconds cold on a recorded 10 Mbps/100 ms latency desktop profile; filter response ≤500 ms warm without artificial delay; 400px view has no page-level horizontal overflow. Measure and record, never claim these plan targets were already achieved.

App uses local fonts if remote font downloading prevents reproducible builds. All charts have accessible table alternatives, token-derived literal export colors, null gaps, stable entity colors and explicit denominators.
