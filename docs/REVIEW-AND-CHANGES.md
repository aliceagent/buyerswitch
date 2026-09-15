# BuyerSwitch plan review — revision 2

Reviewed 15 September 2026. This is a revised build-instruction package, not a built or tested application. All 28 sprint IDs and filenames are retained; their execution order is now dependency-based.

## Recommendation

Build the smallest convincing loop first: competitive signal → comparison → supporting sentences → action hypothesis → saved view → export. The original plan invested heavily in account, card and administration screens before demonstrating its differentiator. Those screens remain in the full-demo roadmap, but are no longer prerequisites to testing product value.

The central product question remains unresolved: review analytics can reveal competitive strengths and complaints, but cannot by itself establish why non-buyers chose a rival. Add a production discovery track for actual decision evidence rather than implying a differently titled review dashboard closes the gap.

## Material changes

| Priority | Finding in supplied plan | Revision and implication |
|---|---|---|
| P0 | Three marginal aggregate tables cannot reconstruct arbitrary topic × date × stars × source intersections, multi-topic review unions, or exact QA corrections. | One bounded record-level synthetic corpus is authoritative. All summaries derive from it. No proportional reconstruction. |
| P0 | ~4,000 review records are cycled across pages whose counts imply millions of available reviews. | Paginate actual matching records once. Counts reflect generated records; the original 2.1M figure is a reference-scale aspiration, not demo evidence or a benchmark result. |
| P0 | Negative language is seeded as positive, and vice versa, to demonstrate mixed sentiment. | Semantically correct mixed-review examples; separate intentionally wrong QA fixture with before/after correction. |
| P0 | Market and retailer selections are recorded but ignored. | Workspace source boundary constrains every query, chart, evidence drawer, search and export. US excludes Canadian sources. |
| P0 | Switch language is stronger than the underlying evidence. | Panels describe observed strengths, complaints and gaps. Show denominators, support thresholds and evidence status. |
| P1 | One-page brief requires up to 36 verbatims plus 12 findings. | Four findings and two short excerpts on the summary; detailed evidence in a separate appendix. |
| P1 | Billing invites actual cards and signup stores reversible passwords. | Fictional identities and read-only test payment details; no editable password/PAN/CVC fields. Billing is optional and late. |
| P1 | User-level stores allow overlays to leak between workspaces. | Workspace overlays use userId + workspaceId; queries capture immutable context and reject stale responses. |
| P1 | Sample approval fraction is called model accuracy. | Label reviewed-item acceptance. Production model evaluation needs a separate adjudicated holdout. |
| P1 | Historical data carries a recent-refresh claim; requests and invitations imply delivery. | Synthetic/historical disclosure; local actions explicitly say nothing was sent. |
| P1 | Next ^15.5 is described as pinned and Node 20 is prescribed. | Exact dependencies and lockfile, Node 24 LTS, Next 16 active-LTS baseline; setup validates current patches. |
| P1 | Missing demo script and underspecified ranking, denominator and state behavior. | Script supplied now, formulas, fixtures, release gates and recoverable states. |
| P2 | Pricing, universal coverage, uniqueness and provisioning promises lack validation. | Pricing and feasibility are hypotheses; discovery and operating-cost gates precede commercial promises. |

## What is preserved

Front-end-only architecture, Next/React, Tailwind/shadcn, Recharts, Zustand/nuqs, Stagwell palette and typography, the 66-topic audio taxonomy, product/brand/group comparisons, long-tail charts, quote expansion, Excel/PowerPoint exports, deterministic seeds, historical dates and one sprint at a time.

## Deliberate scope decisions

The revised demo has 12,000 canonical reviews in its visible window, plus 8,000 historical reviews for comparisons. This makes every drill-down exact and keeps the demo bounded; it is not real customer coverage. Seeded scenarios are fictional even where brands are recognizable. The full-demo backlog remains after the core release gate.

No application implementation, deployment, data contract, pricing approval, Stagwell portfolio gap or real model accuracy was verified by this review. Review basis is the supplied archive. Its referenced walkthrough was not provided and was not independently verified. Runtime support status was checked; links are in technical-sources.md.
