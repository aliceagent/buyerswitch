import type {
  ComparisonSpec,
  Corpus,
  FilterState,
  Grain,
  QueryContext,
  QueryResult,
} from "@/types";
import { QueryEngine, normalizeFilter } from "@/lib/query-engine";
import { DATASET_VERSION } from "@/lib/dates";

let loadPromise: Promise<Corpus> | null = null;
let engine: QueryEngine | null = null;
const cache = new Map<string, QueryResult<unknown>>();
const CACHE_CAP = 80;

export function resetQueryLoad(): void {
  loadPromise = null;
  engine = null;
  cache.clear();
}

export function clearQueryCache(): void {
  cache.clear();
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  return (await res.json()) as T;
}

function inflateReviews(reviews: Corpus["reviews"]): Corpus["reviews"] {
  return reviews.map((r) => ({
    ...r,
    quotes: r.quotes.map((q) => ({
      ...q,
      text: r.text.slice(q.charStart, q.charEnd),
    })),
  }));
}

export function loadCorpus(): Promise<Corpus> {
  if (!loadPromise) {
    loadPromise = (async () => {
      const [manifest, entities, topics, reviews, occurrences, fixtures] = await Promise.all([
        fetchJson<Corpus["manifest"]>("/data/manifest.json"),
        fetchJson<{
          sources: Corpus["sources"];
          hierarchy: Corpus["hierarchy"];
          brands: Corpus["brands"];
          listings: Corpus["products"];
          seedGroups: Corpus["seedGroups"];
        }>("/data/entities.json"),
        fetchJson<{ leaves: Corpus["topics"]; mega: Corpus["topics"] }>("/data/topics.json"),
        fetchJson<{ reviews: Corpus["reviews"] }>("/data/reviews.json"),
        fetchJson<{ occurrences: Corpus["occurrences"] }>("/data/occurrences.json"),
        fetchJson<Corpus["fixtures"]>("/data/fixtures.json"),
      ]);
      if (manifest.schemaVersion !== 2) throw new Error("Unsupported schema version");
      if (manifest.datasetVersion !== DATASET_VERSION) {
        throw new Error("Dataset version mismatch");
      }
      const corpus: Corpus = {
        manifest,
        sources: entities.sources,
        hierarchy: entities.hierarchy,
        brands: entities.brands,
        products: entities.listings,
        seedGroups: entities.seedGroups,
        topics: [...topics.leaves, ...topics.mega],
        reviews: inflateReviews(reviews.reviews),
        occurrences: occurrences.occurrences,
        fixtures,
      };
      engine = new QueryEngine(corpus);
      return corpus;
    })().catch((err: unknown) => {
      loadPromise = null;
      engine = null;
      throw err;
    });
  }
  return loadPromise;
}

function cacheGet<T>(key: string): QueryResult<T> | undefined {
  return cache.get(key) as QueryResult<T> | undefined;
}

function cacheSet<T>(key: string, value: QueryResult<T>): void {
  if (cache.size >= CACHE_CAP) {
    const first = cache.keys().next().value;
    if (first) cache.delete(first);
  }
  cache.set(key, value);
}

function keyOf(ctx: QueryContext, name: string, filter: FilterState, extra = ""): string {
  const f = normalizeFilter(filter);
  return JSON.stringify({
    name,
    userId: ctx.userId,
    workspaceId: ctx.workspace.id,
    datasetVersion: ctx.datasetVersion,
    overlayRevision: ctx.overlayRevision,
    reviewMode: ctx.workspace.reviewMode,
    sources: ctx.workspace.sources,
    filter: f,
    extra,
  });
}

function requireEngine(): QueryEngine {
  if (!engine) throw new Error("Corpus not loaded");
  return engine;
}

export const query = {
  async ensure(): Promise<Corpus> {
    return loadCorpus();
  },
  getWorkspaceTotals(ctx: QueryContext) {
    const k = keyOf(ctx, "totals", emptyFilter(ctx));
    const hit = cacheGet<ReturnType<QueryEngine["getWorkspaceTotals"]>["data"]>(k);
    if (hit) return hit;
    const res = requireEngine().getWorkspaceTotals(ctx);
    cacheSet(k, res);
    return res;
  },
  getKpis(ctx: QueryContext, f: FilterState) {
    const k = keyOf(ctx, "kpis", f);
    const hit = cacheGet<ReturnType<QueryEngine["getKpis"]>["data"]>(k);
    if (hit) return hit;
    const res = requireEngine().getKpis(ctx, f);
    cacheSet(k, res);
    return res;
  },
  getEntities(ctx: QueryContext, f: FilterState, kind: "brand" | "product" | "group" | "hierarchy") {
    const k = keyOf(ctx, "entities", f, kind);
    const hit = cacheGet<ReturnType<QueryEngine["getEntities"]>["data"]>(k);
    if (hit) return hit;
    const res = requireEngine().getEntities(ctx, f, kind);
    cacheSet(k, res);
    return res;
  },
  getSeries(ctx: QueryContext, f: FilterState, grain: Grain) {
    const k = keyOf(ctx, "series", f, grain);
    const hit = cacheGet<ReturnType<QueryEngine["getSeries"]>["data"]>(k);
    if (hit) return hit;
    const res = requireEngine().getSeries(ctx, f, grain);
    cacheSet(k, res);
    return res;
  },
  getStarBreakdown(ctx: QueryContext, f: FilterState) {
    const k = keyOf(ctx, "stars", f);
    const hit = cacheGet<ReturnType<QueryEngine["getStarBreakdown"]>["data"]>(k);
    if (hit) return hit;
    const res = requireEngine().getStarBreakdown(ctx, f);
    cacheSet(k, res);
    return res;
  },
  getTopics(ctx: QueryContext, f: FilterState) {
    const k = keyOf(ctx, "topics", f);
    const hit = cacheGet<ReturnType<QueryEngine["getTopics"]>["data"]>(k);
    if (hit) return hit;
    const res = requireEngine().getTopics(ctx, f);
    cacheSet(k, res);
    return res;
  },
  getTopicDetail(ctx: QueryContext, f: FilterState, id: string) {
    const k = keyOf(ctx, "topicDetail", f, id);
    const hit = cacheGet<ReturnType<QueryEngine["getTopicDetail"]>["data"]>(k);
    if (hit) return hit;
    const res = requireEngine().getTopicDetail(ctx, f, id);
    cacheSet(k, res);
    return res;
  },
  getTopicSummaries(ctx: QueryContext, f: FilterState) {
    const k = keyOf(ctx, "topicSum", f);
    const hit = cacheGet<ReturnType<QueryEngine["getTopicSummaries"]>["data"]>(k);
    if (hit) return hit;
    const res = requireEngine().getTopicSummaries(ctx, f);
    cacheSet(k, res);
    return res;
  },
  getQuotes(
    ctx: QueryContext,
    f: FilterState,
    opts: Parameters<QueryEngine["getQuotes"]>[2],
  ) {
    const k = keyOf(ctx, "quotes", f, JSON.stringify(opts));
    const hit = cacheGet<ReturnType<QueryEngine["getQuotes"]>["data"]>(k);
    if (hit) return hit;
    const res = requireEngine().getQuotes(ctx, f, opts);
    cacheSet(k, res);
    return res;
  },
  getReviews(
    ctx: QueryContext,
    f: FilterState,
    opts: Parameters<QueryEngine["getReviews"]>[2],
  ) {
    const k = keyOf(ctx, "reviews", f, JSON.stringify(opts));
    const hit = cacheGet<ReturnType<QueryEngine["getReviews"]>["data"]>(k);
    if (hit) return hit;
    const res = requireEngine().getReviews(ctx, f, opts);
    cacheSet(k, res);
    return res;
  },
  getStarDrivers(ctx: QueryContext, f: FilterState) {
    const k = keyOf(ctx, "drivers", f);
    const hit = cacheGet<ReturnType<QueryEngine["getStarDrivers"]>["data"]>(k);
    if (hit) return hit;
    const res = requireEngine().getStarDrivers(ctx, f);
    cacheSet(k, res);
    return res;
  },
  getComparison(ctx: QueryContext, f: FilterState, cmp: ComparisonSpec) {
    const k = keyOf(ctx, "cmp", f, JSON.stringify(cmp.entityIds));
    const hit = cacheGet<ReturnType<QueryEngine["getComparison"]>["data"]>(k);
    if (hit) return hit;
    const res = requireEngine().getComparison(ctx, f, cmp);
    cacheSet(k, res);
    return res;
  },
  getComparisonSeries(ctx: QueryContext, f: FilterState, cmp: ComparisonSpec, grain: Grain) {
    const k = keyOf(ctx, "cmpSeries", f, JSON.stringify(cmp.entityIds) + grain);
    const hit = cacheGet<ReturnType<QueryEngine["getComparisonSeries"]>["data"]>(k);
    if (hit) return hit;
    const res = requireEngine().getComparisonSeries(ctx, f, cmp, grain);
    cacheSet(k, res);
    return res;
  },
  getSwitchRadar(ctx: QueryContext, f: FilterState, cmp: ComparisonSpec) {
    const k = keyOf(ctx, "radar", f, JSON.stringify(cmp.entityIds));
    const hit = cacheGet<ReturnType<QueryEngine["getSwitchRadar"]>["data"]>(k);
    if (hit) return hit;
    const res = requireEngine().getSwitchRadar(ctx, f, cmp);
    cacheSet(k, res);
    return res;
  },
  getEvidencePack(finding: Parameters<QueryEngine["getEvidencePack"]>[0]) {
    return requireEngine().getEvidencePack(finding);
  },
  getTopicEntityBars(ctx: QueryContext, f: FilterState, topicId: string, entityIds: string[]) {
    const k = keyOf(ctx, "topicBars", f, topicId + JSON.stringify(entityIds));
    const hit = cacheGet<ReturnType<QueryEngine["getTopicEntityBars"]>["data"]>(k);
    if (hit) return hit;
    const res = requireEngine().getTopicEntityBars(ctx, f, topicId, entityIds);
    cacheSet(k, res);
    return res;
  },
  search(ctx: QueryContext, f: FilterState, term: string) {
    const k = keyOf(ctx, "search", f, term);
    const hit = cacheGet<ReturnType<QueryEngine["search"]>["data"]>(k);
    if (hit) return hit;
    const res = requireEngine().search(ctx, f, term);
    cacheSet(k, res);
    return res;
  },
};

export function emptyFilter(ctx: QueryContext): FilterState {
  return {
    hierarchyIds: [],
    brandIds: [],
    productIds: [],
    groupIds: [],
    topicIds: [],
    sources: [],
    stars: [],
    promotion: "all",
    dateFrom: ctx.workspace.dateRange.from,
    dateTo: ctx.workspace.dateRange.to,
  };
}
