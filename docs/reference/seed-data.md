# Seed specification — one exact synthetic dataset

## Contract

All records are fictional scenario data, including text attached to recognizable brands. Display “Synthetic demo data · Jan 2019–Oct 2021” throughout. Quote drawers say “Illustrative review”; no fabricated external review links. Never present seeded allegations as verified company facts.

Generate 12,000 canonical reviews dated 2019-01-01 through 2021-10-31 inclusive and 8,000 dated 2016-01-01 through 2018-12-31. NOW is 2021-10-31 UTC. Historical records are only for prior-window queries. Add 840 duplicate occurrences in the visible window and 560 in history. Default all-source visible Unique mode counts 12,000; All mode 12,840. Filtering changes these totals. Duplicates retain original product/source/date/stars/text: repeated-collection fixtures, not evidence of real cross-retailer syndication.

Each review has 2–4 opinion quotes. Quotes are unweighted. Totals, positive share and mean stars derive from records, never assigned independently. Approximate aesthetic targets: 65–75% positive quote share and 3.9–4.3 stars. Exact narrative fixtures and correctness take priority.

Keep about 40 brands and 100 listings across Wireless Earphones, Wireless Headphones, Wired Headphones, Wired Earphones. Sources: amazon, bestbuy, walmart, target (US); amazon_ca, bestbuy_ca (CA). Default workspace: “Audio Devices US + Canada”. Include Apple, Sony, TOZO, JLab and Jabra. Initial tiles and local SVG illustrations; no hotlinked assets.

| Anchor ID | Brand | Label | First review date |
|---|---|---|---|
| airpods-charging-case | apple | AirPods with Charging Case | 2019-03-28 |
| airpods-pro | apple | AirPods Pro | 2019-10-30 |
| jlab-jbuds-air | jlab | JBuds Air | 2019-01-02 |
| jabra-elite-65t | jabra | Elite 65t | 2019-01-01 |
| tozo-t10 | tozo | T10 Wireless Earbuds | 2021-03-24 |

Dates are scenario boundaries retained from the supplied plan, not commercial launch-date assertions. Non-anchor listings supply older history. firstReviewDate equals the earliest generated review for each listing.

## Algorithm

1. Seed PRNG with buyerswitch-v2. Stable IDs, UTC dates, key/record ordering. No wall-clock timestamps in deterministic output.
2. Create sources/products/topics, then authored fixtures. Reserve their counts and dates before allocating remaining records to exact totals.
3. Draw 2–4 topics per review using taxonomy weights. Allow repeated topics in a review to exercise union logic. Sentence templates depend on topic and sentiment. Stars are correlated with, but do not dictate, quote sentiment.
4. Record offsets while composing text. JavaScript UTF-16 slice coordinates are authoritative; include an emoji fixture.
5. Generate one occurrence per canonical review plus duplicate occurrences.
6. Validate narrative inequalities from records. Use bounded deterministic allocation/repair and fail with named diagnostics if unsatisfied. Never change a displayed metric independently.
7. Derive topic frequencies and terms. Taxonomy weights are not exact acceptance targets; rare topics can lack support.
8. Write manifest and expected fixture results. No separately authored aggregate truth.

## Required fixtures

Narrative scope: Wireless Earphones, six sources, Unique, full visible window, TOZO focal; Apple, Sony, JLab, Jabra competitors. Core ranked findings require ≥30 distinct canonical reviews per entity/topic and ≥100 category-topic reviews.

- TOZO Ergonomics trails category sentiment by ≥8 percentage points; Apple leads by ≥6. Negative TOZO and positive Apple excerpts support both sides.
- TOZO Price/Value leads category by ≥6 points; at least one selected competitor trails by ≥4. Excerpts support both.
- TOZO Life span appears ≥8 points more often in 1–2-star than 5-star reviews. Each band has ≥30 reviews and ≥10 mentioning the topic.
- October TOZO Ergonomics sentiment is ≥4 points below September, with ≥30 topic-mentioning reviews each month. Notification uses that monthly scope.
- A recovery scenario and an insufficient-evidence scenario are saved configurations over the same corpus, never hardcoded result cards.
- Correct mixed review A, TOZO T10, 2 stars: “The sound is clear and detailed. The battery dies after an hour.” Audio Quality positive; Battery negative.
- Correct mixed review B, TOZO T10, 5 stars: “I love the sound and would buy these again. The earbuds become uncomfortable after an hour.” Audio Quality positive; Ergonomics negative.
- Separate QA fixture: “The connection drops every few minutes.” Connectivity, deliberately positive, expected negative; confidence 0.35. Mark its purpose in fixtures.json; exclude it from selected Radar excerpts until corrected.
- Zero-result scope, rare topic, neutral-only entity/topic scope, overlapping groups and repeated-topic review.

## Files and budgets

Six files under public/data/: manifest.json; entities.json (sources, hierarchy, brands, listings and seed groups); topics.json; reviews.json (canonical reviews and nested quotes); occurrences.json; fixtures.json. Manifest hashes the other five files; no circular self-hash.

Manifest: schemaVersion, datasetVersion, seed, coverage, visible window, actual totals, content hashes. Target ≤20 MiB uncompressed and ≤4 MiB compressed. Measure, do not assert success before generation. If over budget, reduce prose repetition or lazy-load review text while retaining exact IDs/counts. Document a revised budget if still necessary.

seed:check validates references, hashes, offsets, exact counts, nonnegative integers, dates, fixture support, multiplicity, teaching cases and reproducibility. Do not require unique star ratios for every topic or topic mention sums above 200% in every filter; neither is a valid universal invariant.
