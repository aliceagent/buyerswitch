import type { Metric, SourceSlug } from "@/types";

export function formatCount(n: number | null): string {
  if (n === null) return "No data";
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

export function formatPercent(n: number | null, digits = 0): string {
  if (n === null) return "No data";
  return `${n.toFixed(digits)}%`;
}

export function formatStars(n: number | null): string {
  if (n === null) return "No data";
  return `${n.toFixed(2)}★`;
}

export function formatMetric(m: Metric): string {
  if (m.value === null) return "No data";
  if (m.unit === "percent") return formatPercent(m.value);
  if (m.unit === "stars") return formatStars(m.value);
  return formatCount(m.value);
}

export function formatDelta(m: Metric): string {
  if (m.delta === null) {
    if (m.deltaReason === "no-current-data") return "No current data";
    if (m.deltaReason === "no-prior-data") return "No prior data";
    if (m.deltaReason === "incomplete-prior-coverage") return "Incomplete prior coverage";
    return "n/a";
  }
  const sign = m.delta > 0 ? "+" : "";
  if (m.unit === "percent") return `${sign}${m.delta.toFixed(1)} pp`;
  if (m.unit === "stars") return `${sign}${m.delta.toFixed(2)}`;
  return `${sign}${formatCount(m.delta)}`;
}

export const SOURCE_LABELS: Record<SourceSlug, string> = {
  amazon: "Amazon",
  bestbuy: "Best Buy",
  walmart: "Walmart",
  target: "Target",
  amazon_ca: "Amazon CA",
  bestbuy_ca: "Best Buy CA",
};

export function sanitizeSheetName(name: string, used: Set<string>): string {
  const base = name.replace(/[[\]*:/\\?]/g, " ").slice(0, 31).trim() || "Sheet";
  let candidate = base;
  let i = 2;
  while (used.has(candidate)) {
    const suffix = ` ${i}`;
    candidate = `${base.slice(0, 31 - suffix.length)}${suffix}`;
    i += 1;
  }
  used.add(candidate);
  return candidate;
}

export function asExcelText(value: string): string {
  if (/^[=+\-@]/.test(value)) return `'${value}`;
  return value;
}
