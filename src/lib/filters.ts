import type { FilterState, SourceSlug } from "@/types";
import { VISIBLE_FROM, VISIBLE_TO, clampDate, parseUtc } from "@/lib/dates";

export const FILTER_KEYS = ["h", "b", "p", "g", "t", "s", "r", "pr", "from", "to", "cmp", "w", "v"] as const;

export interface ParsedUrlState {
  filter: FilterState;
  cmp: string[];
  workspaceHint: string | null;
  schema: number;
  warnings: string[];
}

function csv(v: string | null): string[] {
  if (!v) return [];
  return v.split(",").map((x) => x.trim()).filter(Boolean);
}

const SOURCES: SourceSlug[] = ["amazon", "bestbuy", "walmart", "target", "amazon_ca", "bestbuy_ca"];

export function parseUrlState(
  sp: URLSearchParams,
  allowed: { brands: Set<string>; products: Set<string>; groups: Set<string>; topics: Set<string>; hierarchies: Set<string>; sources: Set<SourceSlug> },
): ParsedUrlState {
  const warnings: string[] = [];
  const h = csv(sp.get("h")).filter((id) => {
    if (!allowed.hierarchies.has(id)) {
      warnings.push(`Unknown hierarchy ${id} was removed.`);
      return false;
    }
    return true;
  });
  const b = csv(sp.get("b")).filter((id) => {
    if (!allowed.brands.has(id)) {
      warnings.push(`Unknown brand ${id} was removed.`);
      return false;
    }
    return true;
  });
  const p = csv(sp.get("p")).filter((id) => {
    if (!allowed.products.has(id)) {
      warnings.push(`Unknown product ${id} was removed.`);
      return false;
    }
    return true;
  });
  const g = csv(sp.get("g")).filter((id) => {
    if (!allowed.groups.has(id)) {
      warnings.push(`Unknown group ${id} is not available in this browser. Local configuration unavailable.`);
      return false;
    }
    return true;
  });
  const t = csv(sp.get("t")).filter((id) => {
    if (!allowed.topics.has(id)) {
      warnings.push(`Unknown topic ${id} was removed.`);
      return false;
    }
    return true;
  });
  const s = csv(sp.get("s")).filter((id): id is SourceSlug => {
    if (!SOURCES.includes(id as SourceSlug) || !allowed.sources.has(id as SourceSlug)) {
      warnings.push(`Source ${id} is outside the workspace boundary and was removed.`);
      return false;
    }
    return true;
  });
  const stars = csv(sp.get("r"))
    .map(Number)
    .filter((n): n is 1 | 2 | 3 | 4 | 5 => n >= 1 && n <= 5);
  const pr = sp.get("pr");
  const promotion = pr === "exclude" || pr === "only" ? pr : "all";
  let from = sp.get("from") ?? VISIBLE_FROM;
  let to = sp.get("to") ?? VISIBLE_TO;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || Number.isNaN(parseUtc(from))) {
    warnings.push("Invalid from date reset.");
    from = VISIBLE_FROM;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(to) || Number.isNaN(parseUtc(to))) {
    warnings.push("Invalid to date reset.");
    to = VISIBLE_TO;
  }
  from = clampDate(from, "2016-01-01", VISIBLE_TO);
  to = clampDate(to, "2016-01-01", VISIBLE_TO);
  if (parseUtc(from) > parseUtc(to)) {
    warnings.push("Date order was reset.");
    from = VISIBLE_FROM;
    to = VISIBLE_TO;
  }
  const cmp = csv(sp.get("cmp"));
  const kinds = new Set(cmp.map((id) => id.slice(0, 2)));
  if (kinds.size > 1) {
    warnings.push("Mixed comparison kinds were cleared.");
    cmp.length = 0;
  }
  if (cmp.length > 5) {
    warnings.push("Comparison limited to five entities.");
    cmp.splice(5);
  }
  const schema = Number(sp.get("v") ?? "2");
  if (schema !== 2) warnings.push("URL schema reset to v=2.");
  return {
    filter: {
      hierarchyIds: h,
      brandIds: b,
      productIds: p,
      groupIds: g,
      topicIds: t,
      sources: s,
      stars,
      promotion,
      dateFrom: from,
      dateTo: to,
    },
    cmp,
    workspaceHint: sp.get("w"),
    schema: 2,
    warnings,
  };
}

export function serializeUrlState(filter: FilterState, cmp: string[], workspaceId: string): URLSearchParams {
  const sp = new URLSearchParams();
  const set = (k: string, v: string[]) => {
    if (v.length) sp.set(k, v.join(","));
  };
  set("h", filter.hierarchyIds);
  set("b", filter.brandIds);
  set("p", filter.productIds);
  set("g", filter.groupIds);
  set("t", filter.topicIds);
  set("s", filter.sources);
  set("r", filter.stars.map(String));
  if (filter.promotion !== "all") sp.set("pr", filter.promotion);
  if (filter.dateFrom !== VISIBLE_FROM) sp.set("from", filter.dateFrom);
  if (filter.dateTo !== VISIBLE_TO) sp.set("to", filter.dateTo);
  if (cmp.length) sp.set("cmp", cmp.join(","));
  sp.set("w", workspaceId);
  sp.set("v", "2");
  return sp;
}

export function describeFilter(filter: FilterState): { dimension: string; values: string[]; key: keyof FilterState | "dates" }[] {
  const chips: { dimension: string; values: string[]; key: keyof FilterState | "dates" }[] = [];
  if (filter.hierarchyIds.length) chips.push({ dimension: "Hierarchy", values: filter.hierarchyIds, key: "hierarchyIds" });
  if (filter.brandIds.length) chips.push({ dimension: "Brands", values: filter.brandIds, key: "brandIds" });
  if (filter.productIds.length) chips.push({ dimension: "Products", values: filter.productIds, key: "productIds" });
  if (filter.groupIds.length) chips.push({ dimension: "Groups", values: filter.groupIds, key: "groupIds" });
  if (filter.topicIds.length) chips.push({ dimension: "Topics", values: filter.topicIds, key: "topicIds" });
  if (filter.sources.length) chips.push({ dimension: "Sources", values: filter.sources, key: "sources" });
  if (filter.stars.length) chips.push({ dimension: "Stars", values: filter.stars.map(String), key: "stars" });
  if (filter.promotion !== "all") chips.push({ dimension: "Promotion", values: [filter.promotion], key: "promotion" });
  chips.push({ dimension: "Dates", values: [`${filter.dateFrom} → ${filter.dateTo}`], key: "dates" });
  return chips;
}
