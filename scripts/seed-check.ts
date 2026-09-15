import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { QueryEngine } from "../src/lib/query-engine";
import { VISIBLE_FROM, VISIBLE_TO, priorWindow } from "../src/lib/dates";
import type { Corpus, QueryContext, Workspace } from "../src/types";
import { DEFAULT_WORKSPACE } from "../src/lib/defaults";

const DIR = path.join(process.cwd(), "public/data");

function loadJson<T>(name: string): T {
  return JSON.parse(readFileSync(path.join(DIR, name), "utf8")) as T;
}

function sha(name: string): string {
  return createHash("sha256").update(readFileSync(path.join(DIR, name))).digest("hex");
}

function main() {
  const errors: string[] = [];
  const manifest = loadJson<Corpus["manifest"]>("manifest.json");
  const entities = loadJson<{
    sources: Corpus["sources"];
    hierarchy: Corpus["hierarchy"];
    brands: Corpus["brands"];
    listings: Corpus["products"];
    seedGroups: Corpus["seedGroups"];
  }>("entities.json");
  const topics = loadJson<{ leaves: Corpus["topics"]; mega: Corpus["topics"] }>("topics.json");
  const { reviews: rawReviews } = loadJson<{ reviews: Corpus["reviews"] }>("reviews.json");
  const reviews = rawReviews.map((r) => ({
    ...r,
    quotes: r.quotes.map((q) => ({ ...q, text: r.text.slice(q.charStart, q.charEnd) })),
  }));
  const { occurrences } = loadJson<{ occurrences: Corpus["occurrences"] }>("occurrences.json");
  const fixtures = loadJson<Corpus["fixtures"]>("fixtures.json");

  if (topics.leaves.length !== 66) errors.push(`expected 66 leaves, got ${topics.leaves.length}`);
  const vis = reviews.filter((r) => r.postDate >= VISIBLE_FROM && r.postDate <= VISIBLE_TO);
  const his = reviews.filter((r) => r.postDate < VISIBLE_FROM);
  if (vis.length !== 12000) errors.push(`visible ${vis.length}`);
  if (his.length !== 8000) errors.push(`history ${his.length}`);
  const visOcc = occurrences.filter((o) => vis.some((r) => r.id === o.canonicalReviewId));
  const hisOcc = occurrences.filter((o) => his.some((r) => r.id === o.canonicalReviewId));
  if (visOcc.length !== 12840) errors.push(`visible occ ${visOcc.length}`);
  if (hisOcc.length !== 8560) errors.push(`history occ ${hisOcc.length}`);

  for (const file of ["entities.json", "topics.json", "reviews.json", "occurrences.json", "fixtures.json"] as const) {
    if (manifest.hashes[file] !== sha(file)) errors.push(`hash mismatch ${file}`);
  }

  const reviewIds = new Set(reviews.map((r) => r.id));
  for (const o of occurrences) {
    if (!reviewIds.has(o.canonicalReviewId)) errors.push(`occ ${o.id} missing review`);
  }
  for (const r of reviews) {
    if (r.quotes.length < 1) errors.push(`${r.id} no quotes`);
    for (const q of r.quotes) {
      const slice = r.text.slice(q.charStart, q.charEnd);
      if (slice !== q.text) errors.push(`offset ${q.id}`);
      if (!Number.isFinite(q.confidence)) errors.push(`confidence ${q.id}`);
    }
  }

  const mixedA = reviews.find((r) => r.id === (fixtures.mixedA as { id: string }).id);
  if (!mixedA || mixedA.stars !== 2) errors.push("mixed A");
  const qa = fixtures.qaError as { quoteId: string; seededSentiment: string };
  const qaReview = reviews.find((r) => r.quotes.some((q) => q.id === qa.quoteId));
  const qaQuote = qaReview?.quotes.find((q) => q.id === qa.quoteId);
  if (qaQuote?.sentiment !== "positive" || qaQuote.topicId !== "connectivity") errors.push("qa fixture");

  const corpus: Corpus = {
    manifest,
    sources: entities.sources,
    hierarchy: entities.hierarchy,
    brands: entities.brands,
    products: entities.listings,
    seedGroups: entities.seedGroups,
    topics: [...topics.leaves, ...topics.mega],
    reviews,
    occurrences,
    fixtures,
  };
  const ws: Workspace = { ...DEFAULT_WORKSPACE };
  const ctx: QueryContext = {
    userId: "user-alex",
    workspace: ws,
    datasetVersion: manifest.datasetVersion,
    overlayRevision: 0,
    groups: entities.seedGroups,
    megaTopics: topics.mega,
    taxonomy: { renames: {}, mergedInto: {}, suppressed: [] },
    qaOverrides: {},
  };
  const engine = new QueryEngine(corpus);
  const filter = {
    hierarchyIds: ["wireless-earphones"],
    brandIds: [],
    productIds: [],
    groupIds: [],
    topicIds: [],
    sources: [] as Workspace["sources"],
    stars: [] as (1 | 2 | 3 | 4 | 5)[],
    promotion: "all" as const,
    dateFrom: VISIBLE_FROM,
    dateTo: VISIBLE_TO,
  };
  const uniqueTotals = engine.getKpis(ctx, filter);
  if (uniqueTotals.meta.reviewUnits !== 12000 && filter.hierarchyIds.length) {
    // scoped to WE, not all 12000
  }
  const allMode = engine.getKpis(
    { ...ctx, workspace: { ...ws, reviewMode: "all", sources: ws.sources } },
    { ...filter, hierarchyIds: [] },
  );
  const uniqueAll = engine.getKpis({ ...ctx, workspace: { ...ws, reviewMode: "unique" } }, { ...filter, hierarchyIds: [] });
  if (uniqueAll.meta.reviewUnits !== 12000) errors.push(`unique all-source ${uniqueAll.meta.reviewUnits}`);
  if (allMode.meta.reviewUnits !== 12840) errors.push(`all mode ${allMode.meta.reviewUnits}`);

  const prior = priorWindow(VISIBLE_FROM, VISIBLE_TO);
  if (prior.from !== "2016-03-02") errors.push(`prior ${prior.from}`);

  const radar = engine.getSwitchRadar(ctx, filter, {
    entityIds: ["b:tozo", "b:apple", "b:sony", "b:jlab", "b:jabra"],
  });
  const exposure = radar.data.findings.find((f) => f.panel === "exposure" && f.topicId === "ergonomics");
  if (!exposure) errors.push("missing ergonomics exposure");
  const cmp = engine.getComparison(ctx, filter, { entityIds: ["b:tozo", "b:apple", "b:sony", "b:jlab", "b:jabra"] });
  const tozoErg = cmp.data.columns.find((c) => c.entityId === "b:tozo")?.topicRows.find((t) => t.topicId === "ergonomics");
  const appleErg = cmp.data.columns.find((c) => c.entityId === "b:apple")?.topicRows.find((t) => t.topicId === "ergonomics");
  const catErg = cmp.data.columns.find((c) => c.isBenchmark)?.topicRows.find((t) => t.topicId === "ergonomics");
  if (tozoErg?.sentiment != null && catErg?.sentiment != null && !(tozoErg.sentiment <= catErg.sentiment - 8)) {
    errors.push(`TOZO ergonomics ${tozoErg.sentiment} vs cat ${catErg.sentiment}`);
  }
  if (appleErg?.sentiment != null && catErg?.sentiment != null && !(appleErg.sentiment >= catErg.sentiment + 6)) {
    errors.push(`Apple ergonomics ${appleErg.sentiment} vs cat ${catErg.sentiment}`);
  }

  const usCtx: QueryContext = {
    ...ctx,
    workspace: { ...ws, market: "US", sources: ["amazon", "bestbuy", "walmart", "target"] },
  };
  const us = engine.getKpis(usCtx, { ...filter, hierarchyIds: [] });
  const ca = engine.getKpis(ctx, { ...filter, hierarchyIds: [], sources: ["amazon_ca"] });
  if (us.meta.reviewUnits >= uniqueAll.meta.reviewUnits) errors.push("US boundary did not reduce");
  void ca;

  if (errors.length) {
    console.error(errors.join("\n"));
    process.exit(1);
  }
  console.log("seed:check ok", {
    unique: uniqueAll.meta.reviewUnits,
    all: allMode.meta.reviewUnits,
    prior: prior.from,
    radarFindings: radar.data.findings.length,
  });
}

main();
