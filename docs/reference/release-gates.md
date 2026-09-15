# Release gates and acceptance matrix

These are checks for the future implementation. This archive does not contain passing app-test results.

## Core release gate

| Case | Expected result |
|---|---|
| Default visible all-source scope | Unique reviews 12,000; All 12,840; counts derive from actual records |
| US versus US+CA workspace | US excludes both Canadian sources across KPIs, evidence, search and export |
| Brand + source + partial-month + stars + topic | KPI/review population reconciles using exact records, not multiplied margins |
| Repeated topic and overlapping groups | Distinct review counts and union quote counts never double count accidentally |
| Neutral-only topic | 0% positive with nonzero support; empty topic is null, not 0% |
| TOZO T10 historical chart | No opinion line before 2021-03-24; no invented prior sentiment delta |
| Full visible prior window | Starts 2016-03-02; coverage evaluated explicitly |
| Rapid filter A → B and workspace switch | Late A response cannot replace B |
| Two profiles, two workspaces | Groups, saved views and QA edits do not leak |
| Cross-page filters and browser back | State and cmp restore; applied history entries are coherent |
| Unknown group in shared URL | Local configuration warning; baseline offered, not silently substituted |
| Supported exposure fixture | TOZO trails/Apple leads on Ergonomics; exact operands agree with Comparison |
| Low-support scope | No ranked finding; n and recovery action visible |
| QA correction | Exact record contributions change, cache invalidates; original corpus remains intact |
| Evidence links | Correct entity/topic/scope; full text contains exact highlighted span |
| Last pagination page | No repeated/cycled records; total is actual matching review/quote units |
| Export during filter change | Frozen snapshot everywhere; synthetic label and methodology included |
| Corrupt or unavailable storage | Recoverable reset or temporary-session state, no infinite guard |
| Corpus fetch fails once | Retry clears rejected load and succeeds; stale partial data is not displayed |
| 400/768/1280/1920 viewport | No page overflow; tables scroll in bounded regions; readable brief |

Build minimum tests: pure metric fixtures for union/dedup/null/delta/scoping; query contract tests for combined filters and evidence; browser smoke for ready→Radar→evidence→export and setup→refresh. Do not multiply tests that restate the same implementation.

Performance targets: cold ready ≤3s on recorded 10Mbps/100ms latency desktop profile; warm filter ≤500ms; exact dataset payload budgets in seed-data.md. Record browser, hardware, cache and throttle settings. If missed, diagnose payload/parse/query costs before adding infrastructure.

Accessibility: keyboard-only core flow, labeled controls, focus restoration, chart data alternatives, no color-only information, reduced-motion option; verify contrast rather than inheriting unverified claims. Export: print A4 and Letter at 100% one-page summary, no clipped text. XLSX opens in Excel; PPTX in PowerPoint/LibreOffice when the relevant sprint is complete.

## Core buyer-learning gate

Proposed target, to validate with Jonathan: five target-buyer sessions; at least four can find evidence without facilitator rescue within two minutes; at least three identify a concrete recurring decision and request a brief or pilot discussion. Capture exact objections and price reactions. Failure triggers focused iteration on the core loop, not more admin features.

## Full-demo release gate

All core checks plus profile/setup/billing simulation, multiworkspace isolation, settings/role presentation, corrected QA workflow, saved-view restoration and actual PPTX/XLSX opening checks. Every exposed control has real local behavior or an explicit preview/unsupported state. No false delivery confirmations.

Production is a separate gate in production-path.md; passing a demo gate does not validate live ingestion, AI quality, business impact, security or commercial readiness.

## Small golden fixture

[golden-metrics-fixture.json](golden-metrics-fixture.json) provides four abstract reviews and exact expected outputs for mode weighting, repeated-topic unions and QA correction. It is a test specification, not the full application corpus. Expand it into the domain schema during sprint 04. Its tiny population must never pass Radar support thresholds.
