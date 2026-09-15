# BuyerSwitch — product requirements, revision 2

Owner: Jonathan Caras, CPO. Date: 15 September 2026.
Status: revised concept and demo scope; production assumptions require validation.
This supersedes the original PRD. It retains the product's core review/quote/topic model while correcting claims and moving competitive insight into the first release.

## 1. Product thesis

BuyerSwitch helps brand and insights teams identify competitively important product attributes, inspect evidence and decide what to investigate. Its first demonstrable capability is comparative review intelligence. Its longer-term ambition is explaining buyer choice, supported by explicit decision evidence rather than inferred from sentiment alone.

Positioning: “See where competitors win on the things buyers talk about.”

A review gap is not a verified reason for a lost purchase. The demo must distinguish the analytical observation, the action hypothesis and what further evidence would validate it.

## 2. Initial buyer and job

Primary buyer: brand/category insights manager at an e-commerce brand, or an agency analyst supporting one. Initial job: “When competitors appear stronger, help me identify a supported attribute difference, read both sides and give my team a next step.”

Secondary users: product/CX investigating recurring complaints; marketing testing positioning; e-commerce teams diagnosing listing/experience issues; sales presenting the workflow. The UI prioritizes the primary job rather than equally weighting every persona.

Initial category is synthetic Audio Devices only. Live launch category is selected with a pilot customer based on recurring need and feasible coverage.

## 3. Value proposition and limits

Individual quotes preserve attribute-specific sentiment that an overall star rating can hide. Review-level stars, quote-level positive share and topic mention share are distinct metrics.

Review data is self-selected and can include incentives, duplicates, spam and missing coverage. It is not unbiased or a representative sample of all purchasers. Reviews do not capture all non-buyers, and public availability alone does not establish rights to collect or reuse data. Display limitations and source coverage with results.

No claims of “every retailer”, “every SKU”, “nobody else does this”, measured switching, causal sales loss or guaranteed insight quality.

## 4. Stagwell fit

Treat portfolio fit, public naming and commercial integration as validation items. Preserve supplied visual branding for the concept. The archive does not establish exclusivity within Stagwell or verify availability of another portfolio product.

Proposed production flow: routed lead → eligible category trial or scoped demo request → activation → supported finding → evidence → export → recurring review. HubSpot attribution and portfolio handoff are future integration requirements, not live demo features.

Potential interview validation via New Voices belongs in discovery. Do not claim a working integration before it exists.

## 5. Product principles

1. Inspectable evidence beside every finding.
2. Explicit population, denominator, comparison window and support.
3. Stable global filters, with visible exceptions for comparison and rating-band analysis.
4. Strong claims require stronger evidence; insufficient support is a useful result.
5. Save/export the exact view so another person can evaluate it.
6. Show an actionable hypothesis without pretending to know its impact.
7. Make limitations clear where the user evaluates the finding.

## 6. Demo scope and exclusions

Core release: demo-ready entry, category boundary, global filters, KPI/table/chart primitives, topics, quote detail, comparison, Switch Radar, action drafts, saved views, one-page brief and Excel.

Full demo: marketing/pricing preview, fictional profiles, optional plan preview, setup flow, rating associations, catalogue/search, PowerPoint, workspace/groups/roles, QA and tour.

Excluded: database, real identity/auth, private records, card input, payments, LLM classification/generation at runtime, scraping, live CRM, emails/invitations, background monitoring and actual switching measurement. Local UI role gates are presentation behavior, not tenant security.

## 7. Release strategy

Switch Radar is core, not V1.5. Ship the signal→comparison→evidence→action→export loop before optional commercial/admin screens. Preserve the 28 sprint files but use README's dependency order.

Validate buyer usefulness before production collection/integrations. Full demo is not a prerequisite to the first buyer learning session. Production gates are separate and not passed by a synthetic demo.

## 8. Domain and metrics

Workspace = category + allowed markets/sources + dataset version + local preferences. Listing = specific product/source entry. Brand and hierarchy organize listings. Group = a union of listings that may overlap other groups. Review = canonical text/stars/date/source, with one or more observation occurrences. Quote = an opinion span, leaf topic and sentiment. Topic can be universal/category; Mega Topic is a derived union.

Sentiment = positive quotes / all quotes, including neutral in denominator. Mean stars = sum stars / review units. Topic mention share = review units mentioning topic / all review units. Evidence-support n counts distinct canonical reviews, independent of duplicate mode.

Exact types: docs/reference/data-model.md. Authoritative calculation and scope contract: docs/reference/metrics-and-evidence.md. Zero, null and insufficient support remain distinct. Dates are UTC daily records, binned for display; prior periods have equal calendar-day length.

## 9. Data and provenance

Demo generates exactly bounded authored records from seed-data.md. All counts and text are synthetic, not validated real-brand findings. No aggregate marginals reconstructed as exact intersections; no paginated recycling or fake review links. Historical visible window is 2019-01-01–2021-10-31; actual historical records support prior comparisons.

Production must validate collection/display rights, source coverage, stable IDs, canonical listing matching, deduplication, taxonomy versioning, extraction offsets, classifications and personal-data redaction from free text. Record ingestion status and last successful coverage update, not merely job start time. Version processing outputs so corrections and model changes are auditable.

Daily refresh is a proposed operating target, not an existing capability or unconditional promise. Commissioning a new category has no guaranteed lead time until feasibility is measured.

## 10. Information architecture

Core entry: /demo/ready → /switch-radar.
Exploration: /dashboard, /topics, /topics/[topicId], /comparison.
Outputs: /switch-radar/brief and in-app exports.
Full-demo routes: /, /product, /pricing, /signup, /login, /billing, /onboarding/workspace, /onboarding/brands, /onboarding/ingest, /star-rating, /products, /reviews, /settings/workspace, /settings/groups, /settings/users, /settings/qa.
Utilities: /demo/reset, /dev/gallery, /dev/consistency.

Do not expose unbuilt routes as working navigation. Product Analysis remains a future concept; no empty operational page is required.

## 11. Global UI

Top bar shows active workspace, date window, synthetic status, mode and profile. Filters use draft modal with Apply/Cancel, removable chips, URL state and saved-view matching. Source boundary is enforced even when a URL requests broader coverage.

Shared widgets have loading, empty, error, table alternative and export capabilities. Shared table sorts, searches and paginates actual results; bulk comparison is separate from filtering. Floating export controls show only implemented formats.

Dense desktop interface degrades to mobile through bounded chart/table scrolling. Null/support labels and keyboard alternatives are mandatory.

## 12. Exploration screens

Dashboard: brand/listing/group/hierarchy tabs with exact metrics and group-overlap explanation; time and stars.
Topics: top-N/readable 66-topic chart, mention share, positive share, n, supported summaries; Mega Topics separate.
Topic detail: effective route topic, trend, terms, evidence list and full-text span highlighting.
Rating associations: explicit low/high-band denominators, support and topic+band drill-through; association rather than causal impact.
Comparison: inclusive category column, up to five same-kind entities, explicit focal identity, sticky headers, support-aware biggest-gap sort and stable-color time series.
Catalogue/reviews/search: actual record population, mode-labeled occurrences, scoped results and keyboard search.
QA/settings: exact local corrections, auditable edits and per-workspace state isolation.

## 13. Switch Radar

Four panels: Our relative strengths; Complaints linked to low ratings; Competitor weaknesses to investigate; Our competitive exposure.

Each row shows topic, focal/competitor identity, practical gap, denominators/n, priority heuristic, scope and one-click evidence. Two-sided findings include both sides. Low-support findings cannot be ranked; empty panels explain why.

Formulas and support thresholds in metrics-and-evidence.md are normative. Thresholds are demo design choices, not statistical significance. No arbitrary “AI confidence” attached to business conclusions.

A suggested action records hypothesis, owner role, proposed test and success metric locally. Changes over time retain scope and support per period; compositional differences must not be represented as proof of an effect.

## 14. Reporting

One-page Switch Brief: four findings, two short excerpts, next step and methodology footer. Longer evidence appendix separate. Excel: frozen snapshot, long-format data, exact exported counts, formula-safe text, scope cover. PowerPoint: readable images and accessible underlying tables, no false editable-chart claim.

All exports disclose synthetic status, window, mode, baseline, sample size, dataset/overlay version and snapshot ID. Changing live filters cannot change an in-progress export. User edits are local and do not magically transfer through shared IDs.

## 15. Identity and roles

Demo uses fictional local profiles and read-only test payment example, with optional plan selection. No password or card entry. Viewer/Analyst/Admin are visible UI roles; local data is inspectable.

Production requires real authentication, server-side authorization, tenant isolation, role-specific rights and auditable administrative actions. Internal operator privileges and customer-admin privileges need separate design. These are new services, not a one-file adapter replacement.

## 16. Nonfunctional targets

Demo: bounded payload, measured cold-ready ≤3 seconds under recorded network profile, warm filtering ≤500ms without artificial delay, no stale async overwrites, recoverable fetch/storage failure, reproducible seeds.

Responsive targets 400/768/1280/1920. Keyboard, focus, labels, contrast, reduced motion and chart data alternatives. Actual exports open and print cleanly. Exact acceptance in release-gates.md.

Production performance at millions of reviews, uptime, data residency and support SLAs require a separate measured design. No such scalability result is implied by this demo.

## 17. Measurement

Demo uses facilitator notes, no runtime telemetry. Observe time to first evidence, independent navigation, action usefulness, brief requests, unresolved objections and willingness to pilot.

Production event proposal: workspace_opened, radar_viewed, finding_opened, evidence_opened, hypothesis_saved, view_saved, export_started, export_completed, export_failed, recurring_view_revisited. Choose analytics/CRM implementation later; exclude raw review text and personal data from event payloads.

## 18. Success criteria

Proposed discovery gate: five target-buyer sessions; four navigate to useful evidence without rescue within two minutes; three name a recurring decision and ask for a brief/pilot discussion. Targets require product-owner agreement and are not claims of achieved performance.

Production activation candidate: first supported finding inspected and saved/exported in first session. Recurring value candidate: account returns to the same competitive question and records a follow-up decision. Measure retention rather than assuming downloads imply value. Pricing and operating-cost validation accompany engagement.

## 19. Open decisions and risks

| Decision/risk | Proposed next evidence | Role owner |
|---|---|---|
| Is this a differentiated portfolio gap? | Current product/competitor diligence | Portfolio/product |
| First live category and buyer | Named pilot, recurring decisions | Jonathan/product |
| Data availability and rights | One-category supplier/collection proof | Commercial/data |
| Can explicit switch evidence be reliable? | Labeled decision-evidence pilot | Insights |
| Economic subscription viability | Measured cost/account and price interviews | Product/commercial |
| Classification quality | Adjudicated holdout by source/topic/class | Insights/engineering |
| Need for true multi-market support | Pilot coverage and language requirements | Product |
| Brand/portfolio naming | Approved assets and positioning | Portfolio owner |

None blocks building the synthetic demo with these defaults. Each can block an unsupported production claim or launch commitment.

## 20. Visual design

Retain supplied Stagwell palette, Montserrat/Spectral and light analytical layout. design-tokens.md contains detailed colors, sizing and chart guidance. Warm/cool diverging sentiment with explicit reference basis, text values and accessible alternatives. Distinct stable entity series, neutral volume deltas and low-support states. Confirm brand assets before public commercial use.

## 21. Delivery

Execute README's core then optional full-demo sequence. Each sprint has prerequisites, build scope and acceptance; commit and report actual tests. BUILD-LOG.md records implementation results, not guesses. Build agent does not automatically start the next sprint or add production services.

## 22. Evidence limitations and production path

See production-path.md for explicit comparative statements, self-reported switching, consented interviews and verified outcomes. Capture unknowns, entity resolution and verification status. Do not count snippets as a representative switching rate.

The original plan's exact numeric references, product-observation claims and pricing anchors came from a described walkthrough. That recording is not part of this package. Retained taxonomy/palette are supplied design inputs, not independently verified current product or brand facts.
