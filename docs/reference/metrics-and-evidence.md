# Metrics, filters and evidence — authoritative contract

## Counts and sentiment

Canonical reviews R have occurrences O. Unique mode counts each canonicalReviewId once among eligible occurrences. All mode counts occurrences, repeating quote contributions. Distinct evidence-support n always uses canonical IDs so duplicates never satisfy a threshold.

For eligible review units U and their quote units Q:

- reviews = |U|; quotes = |Q|.
- positive share = positive quote units / |Q| ×100. Neutral stays in denominator. Empty Q → null.
- mean stars = sum(stars over U) / |U|. Empty U → null.
- topic mention share = review units containing ≥1 quote on topic / |U| ×100. Label “% of reviews mentioning topic”; it is not market share and topics overlap.
- topic sentiment = positive topic-quote units / all topic-quote units ×100. Show review n and quote n.
- Optional topic quote share = topic quote units / all quote units. Never substitute for mention share.
- Mega Topic uses union of member quote IDs and distinct parent review IDs, then mode weighting. Overlapping groups use product set union. Group rows overlap and cannot be summed.

## Filter order

Capture immutable context → validate IDs → workspace market/source boundary → review date/source/hierarchy/brand/product/group/star/promotion → deduplicate if Unique → QA/taxonomy overlay → select reviews mentioning ANY requested topic → aggregate. OR within dimensions; AND between them. Groups union member products; hierarchies include descendant leaves.

Evidence endpoints also restrict to requested topic/sentiment/side. A topic-filtered KPI counts all opinions in matching reviews; topic-specific evidence lists relevant quotes only. Label this distinction. Topic Detail uses its route topic as effective selection, visibly replacing conflicting global topics. Term search filters evidence and term counts, not page KPIs; label “Evidence search”.

Topic-keyed outputs retain all active leaf rows; unsupported rows have zero count and null sentiment. Their population respects selected topics. Suppressed quotes remain in overall totals, represented in a “Hidden topics” subtotal for reconciliation. Merges are acyclic and single-valued. Mega Topics cannot contain Mega Topics.

## Comparison and focal entity

URL cmp holds 1–5 entities of one kind. First is explicitly “Your brand/product/group”. Reordering competitors never changes the focal entity; changing it is explicit. Workspace defaults apply only on first entry; URL then wins.

Comparison/Radar entity columns AND baseline ignore global brand/product/group filters; show “Entity filters replaced by comparison selection”. Retain hierarchy, sources, date, stars, promotion and topic-review scope. Baseline includes all eligible entities, including selected ones. Label “Category benchmark — includes selected brands”; aggregate by review/quote counts, not mean brand percentages.

Radar shows a topic-scope banner and “Use full category topic scope” action. Never silently ignore topic filters. Evidence links carry effective scope plus explicit side entity so stale global entity filters cannot eliminate competitor evidence.

## Dates and change

ISO dates inclusive, UTC. Current [from,to] has D=calendar-day difference+1. Prior is [from−D days, from−1 day]. For 2019-01-01 through 2021-10-31, prior begins 2016-03-02. Daily records bin into weekly/monthly/yearly charts; never prorate monthly margins. Weeks start Monday and clip to range. Empty bins: volume 0, sentiment/stars null.

Null delta with reason if current metric undefined, prior denominator absent, or prior coverage incomplete. A complete prior with zero volume supports absolute volume change but not percentage growth or sentiment/star delta. Volume uses absolute units; percentage shares use percentage-point change; stars use star-point change. Increasing volume is neutral, not inherently good. Never clamp data to make it look better.

## Ranking heuristics

S_e,t = entity topic sentiment (0–100); S_c,t = category; M_c,t = category mention share /100. Support: entity-topic ≥30 distinct reviews, category-topic ≥100; two-sided claims need ≥30 on both entities. Low support is excluded and labeled “Insufficient evidence”. These demo design thresholds do not guarantee statistical significance. No p-values or confidence intervals for synthetic data.

| Panel | Eligibility | Score |
|---|---|---|
| Our relative strengths | S_me,t − S_c,t ≥3 | (S_me,t − S_c,t) × M_c,t |
| Complaints linked to low ratings | m_low − m_high ≥5 | (m_low − m_high) × low-review share |
| Competitor weaknesses to investigate | S_me,t − S_c,t ≥3 and S_c,t − S_comp,t ≥3 | (S_me,t − S_comp,t) × M_c,t |
| Our competitive exposure | S_c,t − S_me,t ≥3 and S_comp,t − S_c,t ≥3 | (S_comp,t − S_me,t) × M_c,t |

m_low/high are topic mention percentages in focal 1–2-star/5-star reviews. Both bands need ≥30 distinct reviews and ≥10 topic mentions. This panel explicitly removes active star filters to evaluate both bands; label “Compares 1–2★ with 5★; star filter does not apply here”. All other scope remains. Missing band → no claim.

Sort unrounded score descending, then entity-topic review n descending, then topicId and competitorId. One strongest supported competitor per topic; other competitors available in details. Label scores “Priority heuristic”, never revenue loss or switch probability. Comparison standing uses >1 point for better/worse, otherwise descriptive parity; low-support cells say insufficient evidence. Ranking is intentionally stricter than cell shading.

## Evidence and action

A claim retains operands, denominators, formulaVersion, scope, datasetVersion, overlayRevision and evidence IDs. Select distinct canonical reviews matching side/topic/sentiment, deterministically. Two-sided claims show ≥1 excerpt per side, up to three in expansion; more in drawer. Label “Selected illustrative examples”, not representative samples. Missing support prevents a claim; missing quote IDs never fall back to unrelated text.

Demo evidence status is always synthetic. Production distinguishes observed opinion, self-reported consideration/switching, and verified outcome evidence; none alone establishes causation. Review gaps generate positioning hypotheses. “Suggested next step” contains hypothesis, owner role, test, success metric and evidence links, without predicted sales lift.

Example: investigate fit complaints with product/CX; test fit guidance in a controlled experiment; measure fit-related returns and conversion against a comparison group. The demo saves a local draft, sends no task and estimates no revenue.

## Export snapshot

At click freeze route, workspace boundary, filters, cmp order, reviewMode, datasetVersion, overlayRevision and results. Every sheet/slide uses this snapshot even if UI filters change. Footer: synthetic status, window, actual n, benchmark scope, snapshot ID. URLs cannot carry another browser's local groups or QA edits.
