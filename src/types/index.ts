export type Sentiment = "positive" | "negative" | "neutral";
export type Market = "US" | "US-CA" | "UK" | "DE";
export type SourceSlug =
  | "amazon"
  | "bestbuy"
  | "walmart"
  | "target"
  | "amazon_ca"
  | "bestbuy_ca";
export type ReviewMode = "unique" | "all";
export type EntityKind = "brand" | "product" | "group" | "hierarchy";
export type PromotionFilter = "all" | "exclude" | "only";
export type SupportLevel = "sufficient" | "low" | "none";
export type RadarPanel = "strength" | "complaint" | "opportunity" | "exposure";
export type Grain = "week" | "month" | "year";

export interface Quote {
  id: string;
  topicId: string;
  sentiment: Sentiment;
  text: string;
  charStart: number;
  charEnd: number;
  confidence: number;
  provenance: "synthetic";
}

export interface Review {
  id: string;
  productId: string;
  source: SourceSlug;
  postDate: string;
  stars: 1 | 2 | 3 | 4 | 5;
  text: string;
  isPromoted: boolean;
  sourceUrl: null;
  provenance: "synthetic";
  quotes: Quote[];
}

export interface ReviewOccurrence {
  id: string;
  canonicalReviewId: string;
  isDuplicate: boolean;
}

export interface Product {
  id: string;
  title: string;
  shortTitle: string;
  brandId: string;
  hierarchyId: string;
  source: SourceSlug;
  firstReviewDate: string;
  imageUrl: string | null;
  sourceUrl: string | null;
}

export interface Brand {
  id: string;
  name: string;
  logoUrl: string | null;
}

export interface Hierarchy {
  id: string;
  name: string;
  parentId: string | null;
}

export interface DataSource {
  slug: SourceSlug;
  name: string;
  country: "US" | "CA";
}

export interface Topic {
  id: string;
  name: string;
  kind: "universal" | "category";
  isMega: boolean;
  memberTopicIds?: string[];
}

export interface Group {
  id: string;
  name: string;
  productIds: string[];
}

export interface Workspace {
  id: string;
  name: string;
  categoryId: "audio-devices";
  market: Market;
  sources: SourceSlug[];
  reviewMode: ReviewMode;
  dateRange: { from: string; to: string };
  datasetVersion: string;
  myBrandId: string | null;
  competitorBrandIds: string[];
}

export interface FilterState {
  hierarchyIds: string[];
  brandIds: string[];
  productIds: string[];
  groupIds: string[];
  topicIds: string[];
  sources: SourceSlug[];
  stars: (1 | 2 | 3 | 4 | 5)[];
  promotion: PromotionFilter;
  dateFrom: string;
  dateTo: string;
}

export interface TaxonomyOverlay {
  renames: Record<string, string>;
  mergedInto: Record<string, string>;
  suppressed: string[];
}

export interface QueryContext {
  userId: string;
  workspace: Workspace;
  datasetVersion: string;
  overlayRevision: number;
  groups: Group[];
  megaTopics: Topic[];
  taxonomy: TaxonomyOverlay;
  qaOverrides: Record<string, { topicId?: string; sentiment?: Sentiment }>;
}

export interface Metric {
  value: number | null;
  delta: number | null;
  deltaKind: "absolute" | "points";
  unit: "count" | "percent" | "stars";
  deltaReason?: "no-current-data" | "no-prior-data" | "incomplete-prior-coverage";
  goodDirection: "up" | "down" | "neutral";
}

export interface QueryMeta {
  datasetVersion: string;
  overlayRevision: number;
  scopeDescription: string;
  distinctReviewN: number;
  reviewUnits: number;
  quoteUnits: number;
  warnings: string[];
  provenance: "synthetic";
}

export interface QueryResult<T> {
  data: T;
  meta: QueryMeta;
}

export interface Page<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TopicRow {
  topicId: string;
  name: string;
  reviewCount: number;
  quoteCount: number;
  mentionShare: number | null;
  sentiment: number | null;
  distinctReviewN: number;
  support: SupportLevel;
  isMega: boolean;
}

export interface EvidenceRef {
  quoteId: string;
  reviewId: string;
  occurrenceId?: string;
  entityId: string;
}

export interface EvidenceDisplay {
  quoteId: string;
  reviewId: string;
  entityId: string;
  entityName: string;
  quoteText: string;
  reviewText: string;
  charStart: number;
  charEnd: number;
  stars: 1 | 2 | 3 | 4 | 5;
  source: SourceSlug;
  postDate: string;
}

export interface TopicEntityBar {
  entityId: string;
  name: string;
  mentionShare: number | null;
  sentiment: number | null;
  distinctReviewN: number;
}

export interface RadarFinding {
  id: string;
  panel: RadarPanel;
  topicId: string;
  focalId: string;
  competitorId?: string;
  priorityScore: number;
  operands: Record<string, number>;
  denominators: Record<string, number>;
  statement: string;
  evidence: EvidenceRef[];
  evidenceStatus: "synthetic";
  effectiveFilter: FilterState;
  formulaVersion: "radar-v2";
  datasetVersion: string;
  overlayRevision: number;
  nextStep: {
    hypothesis: string;
    ownerRole: string;
    test: string;
    successMetric: string;
  };
}

export interface Kpis {
  reviews: Metric;
  quotes: Metric;
  sentiment: Metric;
  avgStars: Metric;
  workspaceTotals: { reviews: number; quotes: number };
}

export interface EntityRow {
  kind: EntityKind;
  id: string;
  name: string;
  metrics: {
    reviews: Metric;
    quotes: Metric;
    sentiment: Metric;
    avgStars: Metric;
    mentionShare?: Metric;
  };
  memberCount?: number;
  overlapping?: boolean;
  imageUrl?: string | null;
  brandId?: string;
  source?: SourceSlug;
  firstReviewDate?: string;
}

export interface TimePoint {
  period: string;
  start: string;
  end: string;
  volume: number;
  sentiment: number | null;
  avgStars: number | null;
  distinctReviewN: number;
}

export interface ComparisonColumn {
  entityId: string;
  name: string;
  isBenchmark: boolean;
  headlines: {
    reviews: Metric;
    sentiment: Metric;
    avgStars: Metric;
  };
  topicRows: TopicRow[];
  sourceRows: { source: SourceSlug; reviewCount: number; sentiment: number | null }[];
}

export interface ReviewRow {
  occurrenceId: string;
  canonicalReviewId: string;
  isDuplicate: boolean;
  productId: string;
  source: SourceSlug;
  postDate: string;
  stars: 1 | 2 | 3 | 4 | 5;
  text: string;
  isPromoted: boolean;
  reviewSentiment: Sentiment;
  quotes: Quote[];
}

export interface QuoteRow {
  quote: Quote;
  review: ReviewRow;
}

export interface StarBreakdown {
  levels: { stars: 1 | 2 | 3 | 4 | 5; count: number; share: number }[];
  average: Metric;
}

export interface ComparisonSpec {
  entityIds: string[];
}

export interface Manifest {
  schemaVersion: 2;
  datasetVersion: string;
  seed: string;
  coverage: string;
  visibleWindow: { from: string; to: string };
  historyWindow: { from: string; to: string };
  totals: {
    visibleCanonical: number;
    visibleOccurrences: number;
    historyCanonical: number;
    historyOccurrences: number;
    visibleDuplicates: number;
    historyDuplicates: number;
  };
  hashes: Record<string, string>;
  generatedAt: "deterministic";
}

export interface Corpus {
  manifest: Manifest;
  sources: DataSource[];
  hierarchy: Hierarchy[];
  brands: Brand[];
  products: Product[];
  seedGroups: Group[];
  topics: Topic[];
  reviews: Review[];
  occurrences: ReviewOccurrence[];
  fixtures: Record<string, unknown>;
}

export interface DemoProfile {
  id: string;
  displayName: string;
  email: string;
  company: string;
  createdAt: string;
}

export type UiRole = "viewer" | "analyst" | "admin";
