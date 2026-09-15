import type {
  ComparisonColumn,
  ComparisonSpec,
  Corpus,
  EntityRow,
  FilterState,
  Grain,
  Kpis,
  Page,
  Product,
  QueryContext,
  QueryResult,
  Quote,
  QuoteRow,
  RadarFinding,
  Review,
  ReviewOccurrence,
  ReviewRow,
  Sentiment,
  SourceSlug,
  StarBreakdown,
  TimePoint,
  Topic,
  TopicRow,
} from "@/types";
import {
  addDays,
  dateInRange,
  mondayOf,
  monthStart,
  parseUtc,
  priorWindow,
  yearStart,
} from "@/lib/dates";
import { DATASET_VERSION, FORMULA_VERSION } from "@/lib/dates";
import {
  entityTopicSupport,
  makeMetric,
  meanStars,
  mentionShare,
  positiveShare,
  reviewSentiment,
  supportLevel,
  twoSidedSupport,
} from "@/lib/metrics";
import { SOURCE_LABELS } from "@/lib/format";

export interface BoundUnit {
  occurrence: ReviewOccurrence;
  review: Review;
  product: Product;
  quotes: Quote[];
}

function cloneFilter(f: FilterState): FilterState {
  return {
    hierarchyIds: [...f.hierarchyIds],
    brandIds: [...f.brandIds],
    productIds: [...f.productIds],
    groupIds: [...f.groupIds],
    topicIds: [...f.topicIds],
    sources: [...f.sources],
    stars: [...f.stars],
    promotion: f.promotion,
    dateFrom: f.dateFrom,
    dateTo: f.dateTo,
  };
}

function canonicalizeSet<T extends string | number>(values: T[]): T[] {
  return [...new Set(values)].sort() as T[];
}

export function normalizeFilter(f: FilterState): FilterState {
  return {
    hierarchyIds: canonicalizeSet(f.hierarchyIds),
    brandIds: canonicalizeSet(f.brandIds),
    productIds: canonicalizeSet(f.productIds),
    groupIds: canonicalizeSet(f.groupIds),
    topicIds: canonicalizeSet(f.topicIds),
    sources: canonicalizeSet(f.sources),
    stars: canonicalizeSet(f.stars),
    promotion: f.promotion,
    dateFrom: f.dateFrom,
    dateTo: f.dateTo,
  };
}

function resolveMerged(id: string, mergedInto: Record<string, string>, seen = new Set<string>()): string {
  if (seen.has(id)) throw new Error(`cyclic merge involving ${id}`);
  const next = mergedInto[id];
  if (!next) return id;
  seen.add(id);
  return resolveMerged(next, mergedInto, seen);
}

function overlayQuote(q: Quote, ctx: QueryContext): Quote | null {
  const ov = ctx.qaOverrides[q.id];
  const topicId = resolveMerged(ov?.topicId ?? q.topicId, ctx.taxonomy.mergedInto);
  if (ctx.taxonomy.suppressed.includes(topicId)) {
    return { ...q, topicId, sentiment: ov?.sentiment ?? q.sentiment };
  }
  return {
    ...q,
    topicId,
    sentiment: ov?.sentiment ?? q.sentiment,
  };
}

function descendants(corpus: Corpus, hierarchyIds: string[]): Set<string> {
  if (hierarchyIds.length === 0) return new Set();
  const ids = new Set(hierarchyIds);
  let added = true;
  while (added) {
    added = false;
    for (const h of corpus.hierarchy) {
      if (h.parentId && ids.has(h.parentId) && !ids.has(h.id)) {
        ids.add(h.id);
        added = true;
      }
    }
  }
  return ids;
}

function productIdsForGroups(ctx: QueryContext, groupIds: string[]): Set<string> {
  const out = new Set<string>();
  for (const id of groupIds) {
    const g = ctx.groups.find((x) => x.id === id);
    if (g) g.productIds.forEach((p) => out.add(p));
  }
  return out;
}

function allowedSources(ctx: QueryContext, filter: FilterState): Set<SourceSlug> {
  const boundary = new Set(ctx.workspace.sources);
  if (filter.sources.length === 0) return boundary;
  return new Set(filter.sources.filter((s) => boundary.has(s)));
}

function applyEntityFilters(
  product: Product,
  filter: FilterState,
  ctx: QueryContext,
  hier: Set<string>,
  ignoreEntity = false,
): boolean {
  if (hier.size && !hier.has(product.hierarchyId)) return false;
  if (ignoreEntity) return true;
  if (filter.brandIds.length && !filter.brandIds.includes(product.brandId)) return false;
  if (filter.productIds.length && !filter.productIds.includes(product.id)) return false;
  if (filter.groupIds.length) {
    const gp = productIdsForGroups(ctx, filter.groupIds);
    if (!gp.has(product.id)) return false;
  }
  return true;
}

function effectiveQuotes(review: Review, ctx: QueryContext): Quote[] {
  return review.quotes
    .map((q) => overlayQuote(q, ctx))
    .filter((q): q is Quote => q !== null);
}

function leafMembers(topicId: string, topics: Topic[]): string[] {
  const t = topics.find((x) => x.id === topicId);
  if (t?.isMega) return t.memberTopicIds ?? [];
  return [topicId];
}

export function scopedUnits(
  corpus: Corpus,
  ctx: QueryContext,
  filter: FilterState,
  opts?: {
    ignoreEntityFilters?: boolean;
    ignoreStarFilters?: boolean;
    dateFrom?: string;
    dateTo?: string;
    extraProductIds?: Set<string>;
    requireEntityId?: { kind: "brand" | "product" | "group"; id: string };
  },
  indexes?: { productById: Map<string, Product>; reviewById: Map<string, Review> },
): BoundUnit[] {
  const hier = descendants(corpus, filter.hierarchyIds);
  const sources = allowedSources(ctx, filter);
  const from = opts?.dateFrom ?? filter.dateFrom;
  const to = opts?.dateTo ?? filter.dateTo;
  const productById = indexes?.productById ?? new Map(corpus.products.map((p) => [p.id, p]));
  const reviewById = indexes?.reviewById ?? new Map(corpus.reviews.map((r) => [r.id, r]));
  const topicLeaves = filter.topicIds.flatMap((id) => leafMembers(id, [...corpus.topics, ...ctx.megaTopics]));
  const topicSet = new Set(topicLeaves);

  const units: BoundUnit[] = [];
  for (const occ of corpus.occurrences) {
    const review = reviewById.get(occ.canonicalReviewId);
    if (!review) continue;
    if (ctx.workspace.reviewMode === "unique" && occ.isDuplicate) continue;
    if (!dateInRange(review.postDate, from, to)) continue;
    if (!sources.has(review.source)) continue;
    if (!opts?.ignoreStarFilters && filter.stars.length && !filter.stars.includes(review.stars)) continue;
    if (filter.promotion === "exclude" && review.isPromoted) continue;
    if (filter.promotion === "only" && !review.isPromoted) continue;
    const product = productById.get(review.productId);
    if (!product) continue;
    if (opts?.extraProductIds && !opts.extraProductIds.has(product.id)) continue;
    if (opts?.requireEntityId) {
      if (opts.requireEntityId.kind === "brand" && product.brandId !== opts.requireEntityId.id) continue;
      if (opts.requireEntityId.kind === "product" && product.id !== opts.requireEntityId.id) continue;
      if (opts.requireEntityId.kind === "group") {
        const g = ctx.groups.find((x) => x.id === opts.requireEntityId!.id);
        if (!g?.productIds.includes(product.id)) continue;
      }
    }
    if (!applyEntityFilters(product, filter, ctx, hier, opts?.ignoreEntityFilters)) continue;
    const quotes = effectiveQuotes(review, ctx);
    if (topicSet.size) {
      const mention = quotes.some((q) => topicSet.has(q.topicId) && !ctx.taxonomy.suppressed.includes(q.topicId));
      if (!mention) continue;
    }
    units.push({ occurrence: occ, review, product, quotes });
  }
  return units;
}

function topicQuotes(unit: BoundUnit, topicId: string, ctx: QueryContext): Quote[] {
  const members = new Set(leafMembers(topicId, ctx.megaTopics));
  if (!ctx.megaTopics.some((m) => m.id === topicId)) members.add(topicId);
  return unit.quotes.filter((q) => members.has(q.topicId));
}

function kpisFromUnits(
  current: BoundUnit[],
  prior: BoundUnit[],
  priorComplete: boolean,
): Omit<Kpis, "workspaceTotals"> {
  const curQuotes = current.flatMap((u) => u.quotes);
  const priorQuotes = prior.flatMap((u) => u.quotes);
  const reviewsM = makeMetric({
    value: current.length,
    prior: prior.length,
    priorVolume: prior.length,
    priorComplete,
    unit: "count",
    goodDirection: "neutral",
  });
  const quotesM = makeMetric({
    value: curQuotes.length,
    prior: priorQuotes.length,
    priorVolume: priorQuotes.length,
    priorComplete,
    unit: "count",
    goodDirection: "neutral",
  });
  const sent = positiveShare(curQuotes.map((q) => q.sentiment));
  const sentPrior = positiveShare(priorQuotes.map((q) => q.sentiment));
  const stars = meanStars(current.map((u) => u.review.stars));
  const starsPrior = meanStars(prior.map((u) => u.review.stars));
  return {
    reviews: reviewsM,
    quotes: quotesM,
    sentiment: makeMetric({
      value: sent,
      prior: sentPrior,
      priorVolume: priorQuotes.length,
      priorComplete,
      unit: "percent",
      goodDirection: "up",
    }),
    avgStars: makeMetric({
      value: stars,
      prior: starsPrior,
      priorVolume: prior.length,
      priorComplete,
      unit: "stars",
      goodDirection: "up",
    }),
  };
}

function priorCompleteFor(corpus: Corpus, from: string, to: string, unitsPrior: BoundUnit[], productScope: Product[]): boolean {
  void to;
  void unitsPrior;
  const prior = priorWindow(from, to);
  const earliest = productScope.reduce((min, p) => (p.firstReviewDate < min ? p.firstReviewDate : min), "9999-99-99");
  if (earliest > prior.from) return false;
  return corpus.reviews.some((r) => dateInRange(r.postDate, prior.from, prior.to));
}

function wrap<T>(
  ctx: QueryContext,
  filter: FilterState,
  current: BoundUnit[],
  data: T,
  warnings: string[] = [],
): QueryResult<T> {
  const distinct = new Set(current.map((u) => u.review.id)).size;
  const quotes = current.reduce((n, u) => n + u.quotes.length, 0);
  const sources = allowedSources(ctx, filter);
  return {
    data,
    meta: {
      datasetVersion: ctx.datasetVersion,
      overlayRevision: ctx.overlayRevision,
      scopeDescription: `${filter.dateFrom}–${filter.dateTo} · ${[...sources].map((s) => SOURCE_LABELS[s]).join(", ")} · ${ctx.workspace.reviewMode}`,
      distinctReviewN: distinct,
      reviewUnits: current.length,
      quoteUnits: quotes,
      warnings,
      provenance: "synthetic",
    },
  };
}

function parseEntityId(id: string): { kind: "brand" | "product" | "group"; id: string } | null {
  if (id.startsWith("b:")) return { kind: "brand", id: id.slice(2) };
  if (id.startsWith("p:")) return { kind: "product", id: id.slice(2) };
  if (id.startsWith("g:")) return { kind: "group", id: id.slice(2) };
  return null;
}

export class QueryEngine {
  private productById: Map<string, Product>;
  private reviewById: Map<string, Review>;

  constructor(private corpus: Corpus) {
    this.productById = new Map(corpus.products.map((p) => [p.id, p]));
    this.reviewById = new Map(corpus.reviews.map((r) => [r.id, r]));
  }

  private units(
    ctx: QueryContext,
    filter: FilterState,
    opts?: Parameters<typeof scopedUnits>[3],
  ): BoundUnit[] {
    return scopedUnits(this.corpus, ctx, filter, opts, {
      productById: this.productById,
      reviewById: this.reviewById,
    });
  }

  getWorkspaceTotals(ctx: QueryContext): QueryResult<{ reviews: number; quotes: number }> {
    const filter: FilterState = {
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
    const units = this.units( ctx, filter);
    return wrap(ctx, filter, units, {
      reviews: units.length,
      quotes: units.reduce((n, u) => n + u.quotes.length, 0),
    });
  }

  getKpis(ctx: QueryContext, filter: FilterState): QueryResult<Kpis> {
    const current = this.units( ctx, filter);
    const prior = priorWindow(filter.dateFrom, filter.dateTo);
    const priorUnits = this.units( ctx, filter, {
      dateFrom: prior.from,
      dateTo: prior.to,
    });
    const complete = priorCompleteFor(this.corpus, filter.dateFrom, filter.dateTo, priorUnits, this.corpus.products);
    const base = kpisFromUnits(current, priorUnits, complete);
    const totals = this.getWorkspaceTotals(ctx).data;
    return wrap(ctx, filter, current, { ...base, workspaceTotals: totals });
  }

  getEntities(ctx: QueryContext, filter: FilterState, kind: EntityRow["kind"]): QueryResult<EntityRow[]> {
    const current = this.units(ctx, filter);
    const priorW = priorWindow(filter.dateFrom, filter.dateTo);
    const priorAll = this.units(ctx, filter, { dateFrom: priorW.from, dateTo: priorW.to });
    const rows = new Map<string, BoundUnit[]>();
    const priorRows = new Map<string, BoundUnit[]>();
    const push = (map: Map<string, BoundUnit[]>, id: string, u: BoundUnit) => {
      const list = map.get(id) ?? [];
      list.push(u);
      map.set(id, list);
    };
    const bucket = (map: Map<string, BoundUnit[]>, units: BoundUnit[]) => {
      if (kind === "brand") units.forEach((u) => push(map, u.product.brandId, u));
      if (kind === "product") units.forEach((u) => push(map, u.product.id, u));
      if (kind === "hierarchy") units.forEach((u) => push(map, u.product.hierarchyId, u));
      if (kind === "group") {
        for (const g of ctx.groups) {
          map.set(
            g.id,
            units.filter((u) => g.productIds.includes(u.product.id)),
          );
        }
      }
    };
    bucket(rows, current);
    bucket(priorRows, priorAll);
    const entityRows: EntityRow[] = [];
    for (const [id, units] of rows) {
      const priorUnits = priorRows.get(id) ?? [];
      const complete = priorCompleteFor(this.corpus, filter.dateFrom, filter.dateTo, priorUnits, this.corpus.products);
      const k = kpisFromUnits(units, priorUnits, complete);
      const name =
        kind === "brand"
          ? this.corpus.brands.find((b) => b.id === id)?.name ?? id
          : kind === "product"
            ? this.corpus.products.find((p) => p.id === id)?.title ?? id
            : kind === "hierarchy"
              ? this.corpus.hierarchy.find((h) => h.id === id)?.name ?? id
              : ctx.groups.find((g) => g.id === id)?.name ?? id;
      const product = kind === "product" ? this.corpus.products.find((p) => p.id === id) : undefined;
      entityRows.push({
        kind,
        id,
        name,
        metrics: { reviews: k.reviews, quotes: k.quotes, sentiment: k.sentiment, avgStars: k.avgStars },
        memberCount: kind === "group" ? ctx.groups.find((g) => g.id === id)?.productIds.length : undefined,
        overlapping: kind === "group",
        imageUrl: kind === "brand" ? this.corpus.brands.find((b) => b.id === id)?.logoUrl : product?.imageUrl,
        brandId: product?.brandId,
        source: product?.source,
        firstReviewDate: product?.firstReviewDate,
      });
    }
    entityRows.sort((a, b) => (b.metrics.reviews.value ?? 0) - (a.metrics.reviews.value ?? 0) || a.id.localeCompare(b.id));
    return wrap(ctx, filter, current, entityRows);
  }

  getSeries(ctx: QueryContext, filter: FilterState, grain: Grain): QueryResult<TimePoint[]> {
    const current = this.units( ctx, filter);
    const points = binSeries(current, filter.dateFrom, filter.dateTo, grain);
    return wrap(ctx, filter, current, points);
  }

  getStarBreakdown(ctx: QueryContext, filter: FilterState): QueryResult<StarBreakdown> {
    const current = this.units( ctx, filter);
    const priorW = priorWindow(filter.dateFrom, filter.dateTo);
    const prior = this.units( ctx, filter, { dateFrom: priorW.from, dateTo: priorW.to });
    const counts: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    current.forEach((u) => {
      counts[u.review.stars] += 1;
    });
    const total = current.length || 1;
    const levels = ([1, 2, 3, 4, 5] as const).map((stars) => ({
      stars,
      count: counts[stars],
      share: current.length ? (counts[stars] / total) * 100 : 0,
    }));
    const complete = priorCompleteFor(this.corpus, filter.dateFrom, filter.dateTo, prior, this.corpus.products);
    return wrap(ctx, filter, current, {
      levels,
      average: makeMetric({
        value: meanStars(current.map((u) => u.review.stars)),
        prior: meanStars(prior.map((u) => u.review.stars)),
        priorVolume: prior.length,
        priorComplete: complete,
        unit: "stars",
        goodDirection: "up",
      }),
    });
  }

  getTopics(ctx: QueryContext, filter: FilterState): QueryResult<TopicRow[]> {
    const current = this.units( ctx, filter);
    const rows = this.topicRows(ctx, current, false);
    return wrap(ctx, filter, current, rows);
  }

  getTopicSummaries(ctx: QueryContext, filter: FilterState): QueryResult<{
    mostDiscussed: TopicRow | null;
    mostPositive: TopicRow | null;
    mostNegative: TopicRow | null;
  }> {
    const rows = this.getTopics(ctx, filter).data.filter((r) => !r.isMega);
    const discussed = [...rows].sort((a, b) => b.reviewCount - a.reviewCount || a.topicId.localeCompare(b.topicId))[0] ?? null;
    const supported = rows.filter((r) => r.support === "sufficient" && r.sentiment !== null);
    const mostPositive =
      [...supported].sort((a, b) => (b.sentiment ?? 0) - (a.sentiment ?? 0) || a.topicId.localeCompare(b.topicId))[0] ?? null;
    const mostNegative =
      [...supported].sort((a, b) => (a.sentiment ?? 0) - (b.sentiment ?? 0) || a.topicId.localeCompare(b.topicId))[0] ?? null;
    return wrap(ctx, filter, this.units( ctx, filter), {
      mostDiscussed: discussed,
      mostPositive,
      mostNegative,
    });
  }

  getTopicDetail(ctx: QueryContext, filter: FilterState, topicId: string): QueryResult<{
    topic: TopicRow;
    matchingKpis: Kpis;
    series: TimePoint[];
  }> {
    const effective = { ...cloneFilter(filter), topicIds: [topicId] };
    const matching = this.units( ctx, effective);
    const allInScope = this.units( ctx, { ...cloneFilter(filter), topicIds: [] });
    const row = this.topicRows(ctx, allInScope, false).find((r) => r.topicId === topicId);
    const kpis = this.getKpis(ctx, effective);
    const series = this.getSeries(ctx, effective, "month").data;
    const fallback: TopicRow = {
      topicId,
      name: this.corpus.topics.find((t) => t.id === topicId)?.name ?? topicId,
      reviewCount: 0,
      quoteCount: 0,
      mentionShare: null,
      sentiment: null,
      distinctReviewN: 0,
      support: "none",
      isMega: this.corpus.topics.find((t) => t.id === topicId)?.isMega ?? false,
    };
    return wrap(ctx, effective, matching, {
      topic: row ?? fallback,
      matchingKpis: kpis.data,
      series,
    });
  }

  getQuotes(
    ctx: QueryContext,
    filter: FilterState,
    opts: { page: number; pageSize: number; topicId?: string; sentiment?: Sentiment; term?: string; entityId?: string },
  ): QueryResult<Page<QuoteRow>> {
    let units = this.units( ctx, filter);
    if (opts.entityId) {
      const parsed = parseEntityId(opts.entityId);
      if (parsed) {
        units = this.units( ctx, filter, { requireEntityId: parsed, ignoreEntityFilters: true });
      }
    }
    const rows: QuoteRow[] = [];
    for (const u of units) {
      let quotes = opts.topicId ? topicQuotes(u, opts.topicId, ctx) : u.quotes;
      if (opts.sentiment) quotes = quotes.filter((q) => q.sentiment === opts.sentiment);
      if (opts.term) {
        const t = opts.term.toLowerCase();
        quotes = quotes.filter((q) => q.text.toLowerCase().includes(t) || u.review.text.toLowerCase().includes(t));
      }
      for (const quote of quotes) {
        rows.push({ quote, review: toReviewRow(u) });
      }
    }
    rows.sort((a, b) => b.review.postDate.localeCompare(a.review.postDate) || a.quote.id.localeCompare(b.quote.id));
    const page = Math.max(1, opts.page);
    const pageSize = opts.pageSize;
    const start = (page - 1) * pageSize;
    return wrap(ctx, filter, units, {
      rows: rows.slice(start, start + pageSize),
      total: rows.length,
      page,
      pageSize,
    });
  }

  getReviews(
    ctx: QueryContext,
    filter: FilterState,
    opts: { page: number; pageSize: number; term?: string },
  ): QueryResult<Page<ReviewRow>> {
    let units = this.units( ctx, filter);
    if (opts.term) {
      const t = opts.term.toLowerCase();
      units = units.filter((u) => u.review.text.toLowerCase().includes(t));
    }
    units.sort((a, b) => b.review.postDate.localeCompare(a.review.postDate) || a.occurrence.id.localeCompare(b.occurrence.id));
    const start = (Math.max(1, opts.page) - 1) * opts.pageSize;
    return wrap(ctx, filter, units, {
      rows: units.slice(start, start + opts.pageSize).map(toReviewRow),
      total: units.length,
      page: Math.max(1, opts.page),
      pageSize: opts.pageSize,
    });
  }

  getStarDrivers(ctx: QueryContext, filter: FilterState): QueryResult<{
    topicId: string;
    name: string;
    lowMention: number | null;
    highMention: number | null;
    lowN: number;
    highN: number;
    lowTopicN: number;
    highTopicN: number;
    support: boolean;
  }[]> {
    const base = { ...cloneFilter(filter), stars: [] as FilterState["stars"] };
    const all = this.units( ctx, base, { ignoreStarFilters: true });
    const low = all.filter((u) => u.review.stars <= 2);
    const high = all.filter((u) => u.review.stars === 5);
    const topics = this.corpus.topics.filter((t) => !t.isMega);
    const rows = topics.map((t) => {
      const lowM = low.filter((u) => topicQuotes(u, t.id, ctx).length > 0);
      const highM = high.filter((u) => topicQuotes(u, t.id, ctx).length > 0);
      const support = low.length >= 30 && high.length >= 30 && lowM.length >= 10 && highM.length >= 10;
      return {
        topicId: t.id,
        name: t.name,
        lowMention: mentionShare(lowM.length, low.length),
        highMention: mentionShare(highM.length, high.length),
        lowN: low.length,
        highN: high.length,
        lowTopicN: lowM.length,
        highTopicN: highM.length,
        support,
      };
    });
    return wrap(ctx, base, all, rows);
  }

  getComparison(ctx: QueryContext, filter: FilterState, cmp: ComparisonSpec): QueryResult<{
    columns: ComparisonColumn[];
    warnings: string[];
  }> {
    const warnings = [
      "Entity filters replaced by comparison selection",
      "Category benchmark — includes selected brands",
    ];
    const baseFilter = { ...cloneFilter(filter), brandIds: [], productIds: [], groupIds: [] };
    const baselineUnits = this.units( ctx, baseFilter, { ignoreEntityFilters: true });
    const columns: ComparisonColumn[] = [
      {
        entityId: "benchmark",
        name: "Category benchmark — includes selected brands",
        isBenchmark: true,
        headlines: headline(baselineUnits, ctx, filter),
        topicRows: this.topicRows(ctx, baselineUnits, true),
        sourceRows: sourceRows(baselineUnits),
      },
    ];
    for (const eid of cmp.entityIds) {
      const parsed = parseEntityId(eid);
      if (!parsed) continue;
      const units = this.units( ctx, baseFilter, {
        ignoreEntityFilters: true,
        requireEntityId: parsed,
      });
      columns.push({
        entityId: eid,
        name: entityName(this.corpus, ctx, parsed),
        isBenchmark: false,
        headlines: headline(units, ctx, filter),
        topicRows: this.topicRows(ctx, units, true),
        sourceRows: sourceRows(units),
      });
    }
    return wrap(ctx, filter, baselineUnits, { columns, warnings }, warnings);
  }

  getComparisonSeries(
    ctx: QueryContext,
    filter: FilterState,
    cmp: ComparisonSpec,
    grain: Grain,
  ): QueryResult<{ entityId: string; points: TimePoint[] }[]> {
    const baseFilter = { ...cloneFilter(filter), brandIds: [], productIds: [], groupIds: [] };
    const out: { entityId: string; points: TimePoint[] }[] = [
      {
        entityId: "benchmark",
        points: binSeries(
          this.units( ctx, baseFilter, { ignoreEntityFilters: true }),
          filter.dateFrom,
          filter.dateTo,
          grain,
        ),
      },
    ];
    for (const eid of cmp.entityIds) {
      const parsed = parseEntityId(eid);
      if (!parsed) continue;
      out.push({
        entityId: eid,
        points: binSeries(
          this.units( ctx, baseFilter, { ignoreEntityFilters: true, requireEntityId: parsed }),
          filter.dateFrom,
          filter.dateTo,
          grain,
        ),
      });
    }
    return wrap(ctx, filter, this.units( ctx, baseFilter, { ignoreEntityFilters: true }), out);
  }

  getSwitchRadar(ctx: QueryContext, filter: FilterState, cmp: ComparisonSpec): QueryResult<{
    findings: RadarFinding[];
    banners: string[];
  }> {
    const banners: string[] = [];
    if (filter.topicIds.length) {
      banners.push("Radar uses the current topic-review scope. Use full category topic scope to rank across all topics.");
    }
    banners.push("Illustrative review differences, not measured switching or purchase intent.");
    banners.push("Entity filters replaced by comparison selection");
    const focal = cmp.entityIds[0];
    const competitors = cmp.entityIds.slice(1);
    if (!focal) {
      return wrap(ctx, filter, [], { findings: [], banners: [...banners, "Select a focal entity to rank findings."] });
    }
    const baseFilter = { ...cloneFilter(filter), brandIds: [], productIds: [], groupIds: [] };
    const catUnits = this.units( ctx, baseFilter, { ignoreEntityFilters: true });
    const focalParsed = parseEntityId(focal)!;
    const meUnits = this.units( ctx, baseFilter, {
      ignoreEntityFilters: true,
      requireEntityId: focalParsed,
    });
    const catTopic = this.topicStats(ctx, catUnits);
    const meTopic = this.topicStats(ctx, meUnits);
    const findings: RadarFinding[] = [];
    const leafTopics = this.corpus.topics.filter((t) => !t.isMega);

    for (const topic of leafTopics) {
      const me = meTopic.get(topic.id);
      const cat = catTopic.get(topic.id);
      if (!me || !cat) continue;
      if (!entityTopicSupport(me.distinct, cat.distinct)) continue;
      const sMe = me.sentiment;
      const sC = cat.sentiment;
      if (sMe === null || sC === null) continue;
      const mC = (cat.mentionShare ?? 0) / 100;
      if (sMe - sC >= 3) {
        const score = (sMe - sC) * mC;
        findings.push(
          this.finding({
            panel: "strength",
            topic,
            focalId: focal,
            score,
            operands: { sMe, sC, mC },
            denominators: { entityN: me.distinct, categoryN: cat.distinct },
            statement: `${entityName(this.corpus, ctx, focalParsed)} leads the category on ${topic.name} by ${(sMe - sC).toFixed(1)} points (priority heuristic).`,
            ctx,
            filter: baseFilter,
            unitsMe: meUnits,
            unitsOther: catUnits,
          }),
        );
      }
      if (sC - sMe >= 3) {
        // exposure filled per competitor below
      }
    }

    const noStar = { ...cloneFilter(baseFilter), stars: [] as FilterState["stars"] };
    const meAllStars = this.units( ctx, noStar, {
      ignoreEntityFilters: true,
      requireEntityId: focalParsed,
      ignoreStarFilters: true,
    });
    const low = meAllStars.filter((u) => u.review.stars <= 2);
    const high = meAllStars.filter((u) => u.review.stars === 5);
    for (const topic of leafTopics) {
      const lowM = low.filter((u) => topicQuotes(u, topic.id, ctx).length);
      const highM = high.filter((u) => topicQuotes(u, topic.id, ctx).length);
      if (low.length < 30 || high.length < 30 || lowM.length < 10 || highM.length < 10) continue;
      const mLow = (lowM.length / low.length) * 100;
      const mHigh = (highM.length / high.length) * 100;
      if (mLow - mHigh >= 5) {
        const lowShare = low.length / Math.max(1, meAllStars.length);
        const score = (mLow - mHigh) * lowShare;
        findings.push(
          this.finding({
            panel: "complaint",
            topic,
            focalId: focal,
            score,
            operands: { mLow, mHigh, lowShare },
            denominators: { lowN: low.length, highN: high.length, lowTopic: lowM.length, highTopic: highM.length },
            statement: `${topic.name} appears ${(mLow - mHigh).toFixed(1)} points more often in 1–2★ than 5★ reviews. Compares 1–2★ with 5★; star filter does not apply here.`,
            ctx,
            filter: noStar,
            unitsMe: lowM,
            unitsOther: highM,
          }),
        );
      }
    }

    for (const compId of competitors) {
      const parsed = parseEntityId(compId);
      if (!parsed) continue;
      const compUnits = this.units( ctx, baseFilter, {
        ignoreEntityFilters: true,
        requireEntityId: parsed,
      });
      const compTopic = this.topicStats(ctx, compUnits);
      for (const topic of leafTopics) {
        const me = meTopic.get(topic.id);
        const cat = catTopic.get(topic.id);
        const co = compTopic.get(topic.id);
        if (!me || !cat || !co) continue;
        if (!entityTopicSupport(me.distinct, cat.distinct) || !twoSidedSupport(me.distinct, co.distinct)) continue;
        if (me.sentiment === null || cat.sentiment === null || co.sentiment === null) continue;
        const mC = (cat.mentionShare ?? 0) / 100;
        if (me.sentiment - cat.sentiment >= 3 && cat.sentiment - co.sentiment >= 3) {
          const score = (me.sentiment - co.sentiment) * mC;
          findings.push(
            this.finding({
              panel: "opportunity",
              topic,
              focalId: focal,
              competitorId: compId,
              score,
              operands: { sMe: me.sentiment, sC: cat.sentiment, sComp: co.sentiment, mC },
              denominators: { entityN: me.distinct, competitorN: co.distinct, categoryN: cat.distinct },
              statement: `${entityName(this.corpus, ctx, parsed)} trails on ${topic.name}; ${entityName(this.corpus, ctx, focalParsed)} leads the category in this scenario.`,
              ctx,
              filter: baseFilter,
              unitsMe: meUnits.filter((u) => topicQuotes(u, topic.id, ctx).length),
              unitsOther: compUnits.filter((u) => topicQuotes(u, topic.id, ctx).length),
              otherEntity: compId,
            }),
          );
        }
        if (cat.sentiment - me.sentiment >= 3 && co.sentiment - cat.sentiment >= 3) {
          const score = (co.sentiment - me.sentiment) * mC;
          findings.push(
            this.finding({
              panel: "exposure",
              topic,
              focalId: focal,
              competitorId: compId,
              score,
              operands: { sMe: me.sentiment, sC: cat.sentiment, sComp: co.sentiment, mC },
              denominators: { entityN: me.distinct, competitorN: co.distinct, categoryN: cat.distinct },
              statement: `${entityName(this.corpus, ctx, parsed)} leads the category on ${topic.name} while ${entityName(this.corpus, ctx, focalParsed)} trails in this synthetic scenario.`,
              ctx,
              filter: baseFilter,
              unitsMe: meUnits.filter((u) => topicQuotes(u, topic.id, ctx).length),
              unitsOther: compUnits.filter((u) => topicQuotes(u, topic.id, ctx).length),
              otherEntity: compId,
            }),
          );
        }
      }
    }

    const ranked = [...findings].sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
      const nA = a.denominators.entityN ?? 0;
      const nB = b.denominators.entityN ?? 0;
      if (nB !== nA) return nB - nA;
      const t = a.topicId.localeCompare(b.topicId);
      if (t) return t;
      return (a.competitorId ?? "").localeCompare(b.competitorId ?? "");
    });
    const bestByPanelTopic = new Map<string, RadarFinding>();
    for (const f of ranked) {
      const key = `${f.panel}:${f.topicId}`;
      const existing = bestByPanelTopic.get(key);
      if (!existing) bestByPanelTopic.set(key, f);
    }
    return wrap(ctx, filter, meUnits, { findings: [...bestByPanelTopic.values()], banners });
  }

  search(ctx: QueryContext, filter: FilterState, term: string): QueryResult<{
    brands: { id: string; name: string }[];
    products: { id: string; name: string }[];
    topics: { id: string; name: string }[];
    quotes: QuoteRow[];
  }> {
    const t = term.trim().toLowerCase();
    const brands = this.corpus.brands.filter((b) => b.name.toLowerCase().includes(t)).slice(0, 8);
    const products = this.corpus.products.filter((p) => p.title.toLowerCase().includes(t)).slice(0, 8);
    const topics = this.corpus.topics.filter((x) => x.name.toLowerCase().includes(t)).slice(0, 8);
    const quotes = t
      ? this.getQuotes(ctx, filter, { page: 1, pageSize: 8, term: t }).data.rows
      : [];
    return wrap(ctx, filter, this.units( ctx, filter), {
      brands: brands.map((b) => ({ id: b.id, name: b.name })),
      products: products.map((p) => ({ id: p.id, name: p.title })),
      topics: topics.map((x) => ({ id: x.id, name: x.name })),
      quotes,
    });
  }

  private topicRows(ctx: QueryContext, units: BoundUnit[], includeMega: boolean): TopicRow[] {
    const stats = this.topicStats(ctx, units);
    const topics = includeMega ? this.corpus.topics : this.corpus.topics.filter((t) => !t.isMega);
    const hidden = ctx.taxonomy.suppressed;
    const rows: TopicRow[] = [];
    for (const topic of topics) {
      if (topic.isMega && !includeMega) continue;
      const s = stats.get(topic.id) ?? {
        reviewCount: 0,
        quoteCount: 0,
        distinct: 0,
        mentionShare: units.length ? 0 : null,
        sentiment: null,
      };
      rows.push({
        topicId: topic.id,
        name: ctx.taxonomy.renames[topic.id] ?? topic.name,
        reviewCount: s.reviewCount,
        quoteCount: s.quoteCount,
        mentionShare: s.mentionShare,
        sentiment: s.sentiment,
        distinctReviewN: s.distinct,
        support: supportLevel(s.distinct, 30),
        isMega: topic.isMega,
      });
    }
    if (hidden.length) {
      const hiddenUnits = units.filter((u) => u.quotes.some((q) => hidden.includes(q.topicId)));
      const q = units.flatMap((u) => u.quotes.filter((x) => hidden.includes(x.topicId)));
      rows.push({
        topicId: "hidden-topics",
        name: "Hidden topics",
        reviewCount: hiddenUnits.length,
        quoteCount: q.length,
        mentionShare: mentionShare(hiddenUnits.length, units.length),
        sentiment: positiveShare(q.map((x) => x.sentiment)),
        distinctReviewN: new Set(hiddenUnits.map((u) => u.review.id)).size,
        support: "none",
        isMega: false,
      });
    }
    return rows;
  }

  private topicStats(ctx: QueryContext, units: BoundUnit[]) {
    const map = new Map<
      string,
      { reviewCount: number; quoteCount: number; distinct: number; mentionShare: number | null; sentiment: number | null }
    >();
    const allTopics = [...this.corpus.topics, ...ctx.megaTopics];
    for (const topic of allTopics) {
      const mentioning = units.filter((u) => topicQuotes(u, topic.id, ctx).length > 0);
      const quotes = units.flatMap((u) => topicQuotes(u, topic.id, ctx));
      map.set(topic.id, {
        reviewCount: mentioning.length,
        quoteCount: quotes.length,
        distinct: new Set(mentioning.map((u) => u.review.id)).size,
        mentionShare: mentionShare(mentioning.length, units.length),
        sentiment: positiveShare(quotes.map((q) => q.sentiment)),
      });
    }
    return map;
  }

  private finding(opts: {
    panel: RadarFinding["panel"];
    topic: Topic;
    focalId: string;
    competitorId?: string;
    score: number;
    operands: Record<string, number>;
    denominators: Record<string, number>;
    statement: string;
    ctx: QueryContext;
    filter: FilterState;
    unitsMe: BoundUnit[];
    unitsOther: BoundUnit[];
    otherEntity?: string;
  }): RadarFinding {
    const qaSkip = new Set(
      Object.entries(opts.ctx.qaOverrides).length
        ? []
        : ((this.corpus.fixtures.qaError as { quoteId?: string } | undefined)?.quoteId
            ? [(this.corpus.fixtures.qaError as { quoteId: string }).quoteId]
            : []),
    );
    const pickEvidence = (units: BoundUnit[], entityId: string, want: Sentiment, limit: number) => {
      const refs: RadarFinding["evidence"] = [];
      const used = new Set<string>();
      for (const u of units) {
        for (const q of topicQuotes(u, opts.topic.id, opts.ctx)) {
          if (q.sentiment !== want) continue;
          if (qaSkip.has(q.id) && !opts.ctx.qaOverrides[q.id]) continue;
          if (used.has(u.review.id)) continue;
          used.add(u.review.id);
          refs.push({ quoteId: q.id, reviewId: u.review.id, occurrenceId: u.occurrence.id, entityId });
          if (refs.length >= limit) return refs;
        }
      }
      return refs;
    };
    const evidence = [
      ...pickEvidence(opts.unitsMe, opts.focalId, opts.panel === "complaint" ? "negative" : "positive", 2),
      ...pickEvidence(opts.unitsOther, opts.otherEntity ?? opts.focalId, opts.panel === "opportunity" ? "negative" : "positive", 2),
    ].slice(0, 3);
    if (opts.competitorId) {
      const meNeg = pickEvidence(opts.unitsMe, opts.focalId, "negative", 1);
      const coPos = pickEvidence(opts.unitsOther, opts.competitorId, "positive", 1);
      if (opts.panel === "exposure") {
        evidence.length = 0;
        evidence.push(...meNeg, ...coPos);
      }
      if (opts.panel === "opportunity") {
        evidence.length = 0;
        evidence.push(...pickEvidence(opts.unitsMe, opts.focalId, "positive", 1), ...pickEvidence(opts.unitsOther, opts.competitorId, "negative", 1));
      }
    }
    return {
      id: `${opts.panel}:${opts.topic.id}:${opts.focalId}:${opts.competitorId ?? ""}`,
      panel: opts.panel,
      topicId: opts.topic.id,
      focalId: opts.focalId,
      competitorId: opts.competitorId,
      priorityScore: opts.score,
      operands: opts.operands,
      denominators: opts.denominators,
      statement: opts.statement,
      evidence,
      evidenceStatus: "synthetic",
      effectiveFilter: cloneFilter(opts.filter),
      formulaVersion: FORMULA_VERSION,
      datasetVersion: opts.ctx.datasetVersion || DATASET_VERSION,
      overlayRevision: opts.ctx.overlayRevision,
      nextStep: {
        hypothesis: `Investigate ${opts.topic.name} differences observed in synthetic reviews.`,
        ownerRole: "Product / CX",
        test: "Run a controlled test of guidance, fit, or messaging related to this topic.",
        successMetric: "Compare topic-related complaints and conversion against a control group. This demo estimates no sales lift.",
      },
    };
  }
}

function toReviewRow(u: BoundUnit): ReviewRow {
  return {
    occurrenceId: u.occurrence.id,
    canonicalReviewId: u.review.id,
    isDuplicate: u.occurrence.isDuplicate,
    productId: u.review.productId,
    source: u.review.source,
    postDate: u.review.postDate,
    stars: u.review.stars,
    text: u.review.text,
    isPromoted: u.review.isPromoted,
    reviewSentiment: reviewSentiment(u.quotes.map((q) => q.sentiment)),
    quotes: u.quotes,
  };
}

function headline(units: BoundUnit[], ctx: QueryContext, filter: FilterState) {
  void ctx;
  const prior = priorWindow(filter.dateFrom, filter.dateTo);
  void prior;
  const quotes = units.flatMap((u) => u.quotes);
  return {
    reviews: makeMetric({
      value: units.length,
      prior: null,
      priorVolume: 0,
      priorComplete: false,
      unit: "count",
      goodDirection: "neutral",
    }),
    sentiment: makeMetric({
      value: positiveShare(quotes.map((q) => q.sentiment)),
      prior: null,
      priorVolume: 0,
      priorComplete: false,
      unit: "percent",
      goodDirection: "up",
    }),
    avgStars: makeMetric({
      value: meanStars(units.map((u) => u.review.stars)),
      prior: null,
      priorVolume: 0,
      priorComplete: false,
      unit: "stars",
      goodDirection: "up",
    }),
  };
}

function sourceRows(units: BoundUnit[]) {
  const map = new Map<SourceSlug, BoundUnit[]>();
  for (const u of units) {
    const list = map.get(u.review.source) ?? [];
    list.push(u);
    map.set(u.review.source, list);
  }
  return [...map.entries()].map(([source, list]) => ({
    source,
    reviewCount: list.length,
    sentiment: positiveShare(list.flatMap((u) => u.quotes.map((q) => q.sentiment))),
  }));
}

function entityName(
  corpus: Corpus,
  ctx: QueryContext,
  parsed: { kind: "brand" | "product" | "group"; id: string },
): string {
  if (parsed.kind === "brand") return corpus.brands.find((b) => b.id === parsed.id)?.name ?? parsed.id;
  if (parsed.kind === "product") return corpus.products.find((p) => p.id === parsed.id)?.title ?? parsed.id;
  return ctx.groups.find((g) => g.id === parsed.id)?.name ?? parsed.id;
}

function binSeries(units: BoundUnit[], from: string, to: string, grain: Grain): TimePoint[] {
  const buckets = new Map<string, { start: string; end: string; units: BoundUnit[] }>();
  const addBucket = (start: string, end: string) => {
    const key = start;
    if (!buckets.has(key)) buckets.set(key, { start, end, units: [] });
  };
  if (grain === "week") {
    let s = mondayOf(from);
    while (parseUtc(s) <= parseUtc(to)) {
      const rawEnd = addDays(s, 6);
      const end = parseUtc(rawEnd) < parseUtc(from) ? from : parseUtc(rawEnd) > parseUtc(to) ? to : rawEnd;
      const start = parseUtc(s) < parseUtc(from) ? from : s;
      addBucket(start, end);
      s = addDays(s, 7);
    }
  } else if (grain === "month") {
    let s = monthStart(from);
    while (parseUtc(s) <= parseUtc(to)) {
      const y = Number(s.slice(0, 4));
      const m = Number(s.slice(5, 7));
      const next = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
      const rawEnd = addDays(next, -1);
      const start = parseUtc(s) < parseUtc(from) ? from : s;
      const end = parseUtc(rawEnd) > parseUtc(to) ? to : rawEnd;
      addBucket(start, end);
      s = next;
    }
  } else {
    let s = yearStart(from);
    while (parseUtc(s) <= parseUtc(to)) {
      const y = Number(s.slice(0, 4));
      const next = `${y + 1}-01-01`;
      const rawEnd = addDays(next, -1);
      const start = parseUtc(s) < parseUtc(from) ? from : s;
      const end = parseUtc(rawEnd) > parseUtc(to) ? to : rawEnd;
      addBucket(start, end);
      s = next;
    }
  }
  for (const u of units) {
    for (const b of buckets.values()) {
      if (dateInRange(u.review.postDate, b.start, b.end)) {
        b.units.push(u);
        break;
      }
    }
  }
  return [...buckets.values()]
    .sort((a, b) => a.start.localeCompare(b.start))
    .map((b) => ({
      period: b.start,
      start: b.start,
      end: b.end,
      volume: b.units.length,
      sentiment: positiveShare(b.units.flatMap((u) => u.quotes.map((q) => q.sentiment))),
      avgStars: meanStars(b.units.map((u) => u.review.stars)),
      distinctReviewN: new Set(b.units.map((u) => u.review.id)).size,
    }));
}

export { parseEntityId, cloneFilter };
