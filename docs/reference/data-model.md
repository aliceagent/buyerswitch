# Data model — revision 2

Implementation contracts, not executable application code. The build agent creates these modules. metrics-and-evidence.md defines semantics.

~~~ts
type Sentiment = 'positive' | 'negative' | 'neutral';
type Market = 'US' | 'US-CA' | 'UK' | 'DE';
type SourceSlug = 'amazon' | 'bestbuy' | 'walmart' | 'target' | 'amazon_ca' | 'bestbuy_ca';
type ReviewMode = 'unique' | 'all';
interface Quote {
  id: string; topicId: string; sentiment: Sentiment; text: string;
  charStart: number; charEnd: number; confidence: number;
  provenance: 'synthetic';
}
interface Review {
  id: string; productId: string; source: SourceSlug; postDate: string;
  stars: 1|2|3|4|5; text: string; isPromoted: boolean;
  sourceUrl: null; provenance: 'synthetic'; quotes: Quote[];
}
interface ReviewOccurrence {
  id: string; canonicalReviewId: string; isDuplicate: boolean;
}
interface Product {
  id: string; title: string; shortTitle: string; brandId: string;
  hierarchyId: string; source: SourceSlug; firstReviewDate: string;
  imageUrl: string | null; sourceUrl: string | null;
}
interface Brand { id: string; name: string; logoUrl: string | null; }
interface Hierarchy { id: string; name: string; parentId: string | null; }
interface DataSource { slug: SourceSlug; name: string; country: 'US'|'CA'; }
interface Topic {
  id: string; name: string; kind: 'universal'|'category';
  isMega: boolean; memberTopicIds?: string[];
}
interface Group { id: string; name: string; productIds: string[]; }
interface Workspace {
  id: string; name: string; categoryId: 'audio-devices'; market: Market;
  sources: SourceSlug[]; reviewMode: ReviewMode;
  dateRange: {from: string; to: string}; datasetVersion: string;
  myBrandId: string | null; competitorBrandIds: string[];
}
interface FilterState {
  hierarchyIds: string[]; brandIds: string[]; productIds: string[];
  groupIds: string[]; topicIds: string[]; sources: SourceSlug[];
  stars: (1|2|3|4|5)[]; promotion: 'all'|'exclude'|'only';
  dateFrom: string; dateTo: string;
}
interface QueryContext {
  userId: string; workspace: Workspace; datasetVersion: string;
  overlayRevision: number; groups: Group[]; megaTopics: Topic[];
  taxonomy: { renames: Record<string,string>; mergedInto: Record<string,string>; suppressed: string[] };
  qaOverrides: Record<string,{topicId?: string; sentiment?: Sentiment}>;
}
interface Metric {
  value: number | null; delta: number | null;
  deltaKind: 'absolute'|'points'; unit: 'count'|'percent'|'stars';
  deltaReason?: 'no-current-data'|'no-prior-data'|'incomplete-prior-coverage';
  goodDirection: 'up'|'down'|'neutral';
}
interface QueryResult<T> {
  data: T;
  meta: { datasetVersion: string; overlayRevision: number; scopeDescription: string;
    distinctReviewN: number; reviewUnits: number; quoteUnits: number;
    warnings: string[]; provenance: 'synthetic' };
}
interface Page<T> { rows: T[]; total: number; page: number; pageSize: number; }
interface TopicRow {
  topicId: string; name: string; reviewCount: number; quoteCount: number;
  mentionShare: number | null; sentiment: number | null;
  distinctReviewN: number; support: 'sufficient'|'low'|'none'; isMega: boolean;
}
interface EvidenceRef { quoteId: string; reviewId: string; occurrenceId?: string; entityId: string; }
interface RadarFinding {
  id: string; panel: 'strength'|'complaint'|'opportunity'|'exposure';
  topicId: string; focalId: string; competitorId?: string;
  priorityScore: number; operands: Record<string,number>;
  denominators: Record<string,number>; statement: string;
  evidence: EvidenceRef[]; evidenceStatus: 'synthetic';
  effectiveFilter: FilterState; formulaVersion: 'radar-v2';
  datasetVersion: string; overlayRevision: number;
  nextStep: { hypothesis: string; ownerRole: string; test: string; successMetric: string };
}
~~~

Entity IDs in comparison use b:, p: or g: prefixes, validated at runtime. Kpis contains reviews/quotes/sentiment/avgStars Metrics plus workspace totals. EntityRow contains kind/id/name/metrics/memberCount. TimePoint contains period, integer volume, nullable sentiment/stars. ComparisonColumn contains entityId, headlines, topic/source rows, benchmark flag. Include support and n for cells. ReviewRow distinguishes canonical and occurrence IDs; quote results include parent review.

Review-level sentiment compares counts of positive and negative quotes, tie neutral; label as a summary. Schema version 2 and persistence migrations are required. Reject non-finite numbers, unknown references and cyclic merges. Text renders as text nodes, never HTML. No real passwords, card fields or reviewer identity.
