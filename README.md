# BuyerSwitch demo — improved build plan

**Revision 2 · 15 September 2026**

Start with [Review and changes](docs/REVIEW-AND-CHANGES.md). This ZIP contains a revised PRD, architecture and reference contracts, all 28 rewritten sprint instructions, a ready-to-use demo script and acceptance gates. It contains instructions, not a built application.

## Main decision

Build the competitive insight → evidence → next step → export loop first. Keep all advanced setup/admin/presentation features in the full-demo track. The synthetic dataset is intentionally bounded so every filter and evidence count is exact. The demo cannot prove real switching or production scale.

## Hand to a build agent

1. Copy the contents of this bsdemo folder into a new project repository.
2. Read this README, docs/REVIEW-AND-CHANGES.md, docs/00-overview.md, and docs/reference/demo-script.md.
3. Follow the table below. IDs retain original filenames, **not execution order**.
4. One sprint per session. Implement only the selected sprint, run its checks, record actual results, review and commit.
5. Stop at the core gate for buyer feedback before implementing the full-demo track.

Suggested prompt:

~~~text
Read README.md, .cursorrules, docs/00-overview.md and the assigned sprint.
Read its referenced contracts, especially metrics-and-evidence.md.
Implement only that sprint using the dependency order in README.
Keep synthetic-data claims, real pagination and workspace boundaries correct.
Run its acceptance checks. Report changed files, commands actually run,
results, limitations and any remaining blocker. Do not start the next sprint.
~~~

## Execution order

| Order | Sprint ID | Deliverable |
|---|---|---|
| 1 | 01 | [Core: Scaffold and deployment foundation](docs/sprints/01-scaffold-and-deploy.md) |
| 2 | 02 | [Core: Design system, types and hydration](docs/sprints/02-design-system.md) |
| 3 | 03 | [Core: Exact synthetic corpus](docs/sprints/03-mock-data-engine.md) |
| 4 | 04 | [Core: Query layer and numerical contracts](docs/sprints/04-query-layer.md) |
| 5 | 11 | [Core: App shell and early demo entry](docs/sprints/11-app-shell.md) |
| 6 | 12 | [Core: Filters and URL state](docs/sprints/12-filter-framework.md) |
| 7 | 13a | [Core: KPI and widget primitives](docs/sprints/13a-kpi-strip-and-widgets.md) |
| 8 | 13b | [Core: Shared data table](docs/sprints/13b-data-table.md) |
| 9 | 14 | [Core: Dashboard entity exploration](docs/sprints/14-dashboard-table.md) |
| 10 | 15 | [Core: Dashboard charts](docs/sprints/15-dashboard-charts.md) |
| 11 | 16 | [Core: Topics overview](docs/sprints/16-topics-page.md) |
| 12 | 17 | [Core: Topic detail and full evidence](docs/sprints/17-topic-detail-and-quotes.md) |
| 13 | 19 | [Core: Comparison matrix](docs/sprints/19-comparison.md) |
| 14 | 20 | [Core: Switch Radar and action brief](docs/sprints/20-switch-radar.md) |
| 15 | 22a | [Core: Saved views, local alerts and Excel](docs/sprints/22a-saved-views-and-excel.md) |
| 16 | 05 | [Full: Marketing and pricing preview](docs/sprints/05-marketing-site.md) |
| 17 | 06 | [Full: Fictional demo profile](docs/sprints/06-signup.md) |
| 18 | 07 | [Full: Profile selection and route guard](docs/sprints/07-login-and-guard.md) |
| 19 | 08 | [Full: Optional commercial-flow preview](docs/sprints/08-billing.md) |
| 20 | 09 | [Full: Workspace boundaries](docs/sprints/09-onboarding-workspace.md) |
| 21 | 10 | [Full: Brands and sample preparation](docs/sprints/10-onboarding-brands.md) |
| 22 | 18 | [Full: Rating associations](docs/sprints/18-star-rating.md) |
| 23 | 21 | [Full: Catalogue, reviews and search](docs/sprints/21-catalogue-reviews-search.md) |
| 24 | 22b | [Full: PowerPoint and chart images](docs/sprints/22b-powerpoint-export.md) |
| 25 | 23a | [Full: Workspace settings, groups and roles](docs/sprints/23a-settings-groups-users.md) |
| 26 | 23b | [Full: QA and taxonomy](docs/sprints/23b-data-qa.md) |
| 27 | 24a | [Full: Demo scenarios, tour and reset](docs/sprints/24a-demo-mode.md) |
| 28 | 24b | [Full: Release polish and acceptance](docs/sprints/24b-polish.md) |

Core: 15 work packages. Full-demo extension: 13. These are reviewable work units, not estimates of days. Data/query work and export verification may require more effort than a UI sprint.

Sprint 11 explicitly implements the demo-ready/store subset formerly deferred to 24a. Sprint 12 implements basic saved views before 22a extends them. Early nav exposes only completed routes. Billing is optional and never gates the analytical demo. Core release includes print brief and Excel; PowerPoint arrives in the full track.

## Reference map

- [Architecture](docs/00-overview.md): stack, isolation, APIs, URLs, recovery.
- [Metrics and evidence](docs/reference/metrics-and-evidence.md): authoritative formulas, support, filter scope and snapshots.
- [Data model](docs/reference/data-model.md) and [seed data](docs/reference/seed-data.md): exact bounded corpus.
- [Taxonomy](docs/reference/topic-taxonomy.md), [design](docs/reference/design-tokens.md), [copy](docs/reference/copy-deck.md).
- [Demo script](docs/reference/demo-script.md): 90 seconds and eight minutes.
- [Release gates](docs/reference/release-gates.md): numerical, browser and buyer-learning checks.
- [Production path](docs/reference/production-path.md): evidence ladder and feasibility gates.
- [Runtime sources](docs/reference/technical-sources.md): externally checked support status.
- [PRD](BuyerSwitch-PRD.md): product direction and unresolved assumptions.

## Definition of done

Sprint acceptance is demonstrably true; build/lint/typecheck pass; seed:check from 03 onward; changed calculations and state paths have meaningful checks; no false live-service claims. Record actual test/deploy evidence in docs/BUILD-LOG.md. This archive revision does not imply that any application check has already passed.

This package supersedes the supplied instruction files. Do not mix old sprint bodies with revision 2 contracts.

## Runtime setup

Resolved during scaffold (15 September 2026):

- Node.js **24.21.0** (npm 11.19.0)
- `create-next-app` **16.3.5**
- Next.js **16.3.5**, React **19.2.8**, Tailwind **4**, Vitest **5**

```bash
npm ci
npm run seed        # regenerates public/data from the deterministic generator
npm run seed:check
npm run dev         # http://localhost:3000
```

Primary demo entry: `/demo/ready` → Switch Radar with the TOZO competitive exposure view.

No application backend, credentials, or payment processing. Vercel should use Node 24 (`package.json` `engines.node` is `24.x`). If a live deployment URL is not available in this environment, that status is recorded in `docs/BUILD-LOG.md`.

Scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:e2e`, `seed`, `seed:check`.
