# Production discovery and decision evidence

This track is a recommendation beyond the frontend demo, not authorization to build or promise integrations.

## Product wedge

Primary initial buyer: brand/insights manager at an e-commerce brand with meaningful review coverage and a recurring competitor question. Initial job: identify a supported attribute gap, inspect both sides, and decide what to investigate. Avoid promising all categories or all purchasing decisions.

Potential differentiation to test: recurring competitive questions, explicit evidence strength, observed change over time, action hypotheses and follow-up measurement. The supplied archive is heavily based on review analytics; that alone does not establish a unique position or a gap in Stagwell's portfolio. Portfolio/competitor diligence remains open.

## Evidence ladder

| Evidence | Can support | Cannot establish alone |
|---|---|---|
| Review opinion | Post-purchase attribute experience | Why a non-buyer chose a rival |
| Explicit comparative statement | Reviewer says they compared named alternatives | Verified switching or category-wide frequency |
| Explicit self-reported switch | Author says they moved from A to B and gives a reason | Independently verified outcome or causality |
| Consented buyer interview/survey | Stated consideration and decision reasons | Actual behavior without corroboration |
| Matched outcome with permitted first-party data | Recorded purchase/churn outcome tied to a defined population | Causal effect of an attribute without a sound design |

Future decision record: evidenceType, previousBrand, chosenBrand, direction, decisionDate, reasonCodes, verbatim, source/provenance, entity-resolution status, consent/usage status where applicable, verification status, classifier version, reviewer adjudication and coverage population. Unknown fields remain unknown. Multiple reviews from one person are not automatically distinct buyers. Never infer a switching rate from unmatched snippets.

Potential New Voices interview workflow is an integration hypothesis, not a verified available capability. Test voluntary research recruitment, neutral questioning, a clear sampling frame and attribution to records before promising automated validation.

## Staged gates

1. Discovery: five target buyers, two categories; obtain real recurring questions and a paid-pilot hypothesis.
2. Data feasibility: select one category/market; validate permitted access, retention/display rights, stable source URLs, coverage, freshness, licensing cost and missingness.
3. Evaluation: adjudicated held-out dataset by source/topic/language, class balance, precision/recall and error review. Evaluate extraction spans, entity resolution, deduplication and sentiment separately. QA approvals are not accuracy.
4. Private pilot: real tenant auth/access enforcement, isolation, managed storage, jobs/retries, versioned taxonomy, auditable edits, deletion and free-text personal-data controls. Replace fixture adapter, but also build these services; changing query.ts alone is insufficient.
5. Commercial launch: measured reliability, operating cost, packaging, agreed coverage/SLA, CRM and billing with actual authorization, and tested retention value.
6. Decision evidence: add one clearly labeled evidence class at a time. Establish precision of switch-direction/reason extraction before any switching claim.

## Economics worksheet to complete

Monthly variable cost/account = allocated data license + new-review ingestion + classification + storage/serving + support/analyst hours + export/job overhead. Gross contribution = subscription revenue − variable cost. Measure new records/month and quote tokens/review on a pilot; do not infer feasibility from cheap demo hosting.

Starter $1,200 and Growth $3,500 remain research anchors. Test willingness to pay, minimum useful coverage, seat/workspace limits and repeat usage. Core Radar should not be hidden behind an upgrade: it is the reason to try BuyerSwitch.

## Decision owners

Jonathan/product: ICP, category and product claims. Engineering: data adapter, isolation, deployment and reliability. Insights lead: definitions, evidence and evaluation. Commercial/data owner: supplier terms, coverage, cost and packaging. Stagwell portfolio owner: naming, fit and routing. Owners are proposed role assignments; no commitment has been obtained.
