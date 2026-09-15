import type { Metric, Sentiment } from "@/types";

export function reviewSentiment(sentiments: Sentiment[]): Sentiment {
  const pos = sentiments.filter((s) => s === "positive").length;
  const neg = sentiments.filter((s) => s === "negative").length;
  if (pos > neg) return "positive";
  if (neg > pos) return "negative";
  return "neutral";
}

export function positiveShare(sentiments: Sentiment[]): number | null {
  if (sentiments.length === 0) return null;
  const pos = sentiments.filter((s) => s === "positive").length;
  return (pos / sentiments.length) * 100;
}

export function meanStars(stars: number[]): number | null {
  if (stars.length === 0) return null;
  return stars.reduce((a, b) => a + b, 0) / stars.length;
}

export function mentionShare(mentioning: number, total: number): number | null {
  if (total === 0) return null;
  return (mentioning / total) * 100;
}

export function supportLevel(distinctN: number, threshold: number): "sufficient" | "low" | "none" {
  if (distinctN <= 0) return "none";
  if (distinctN < threshold) return "low";
  return "sufficient";
}

export function makeMetric(opts: {
  value: number | null;
  prior: number | null;
  priorVolume: number;
  priorComplete: boolean;
  unit: Metric["unit"];
  goodDirection: Metric["goodDirection"];
}): Metric {
  const { value, prior, priorVolume, priorComplete, unit, goodDirection } = opts;
  const deltaKind: Metric["deltaKind"] = unit === "count" ? "absolute" : "points";
  if (value === null) {
    return {
      value: null,
      delta: null,
      deltaKind,
      unit,
      deltaReason: "no-current-data",
      goodDirection,
    };
  }
  if (!priorComplete) {
    if (unit === "count" && priorVolume === 0) {
      return {
        value,
        delta: value,
        deltaKind: "absolute",
        unit,
        deltaReason: "incomplete-prior-coverage",
        goodDirection,
      };
    }
    return {
      value,
      delta: null,
      deltaKind,
      unit,
      deltaReason: "incomplete-prior-coverage",
      goodDirection,
    };
  }
  if (prior === null) {
    if (unit === "count" && priorVolume === 0) {
      return {
        value,
        delta: value,
        deltaKind: "absolute",
        unit,
        goodDirection,
      };
    }
    return {
      value,
      delta: null,
      deltaKind,
      unit,
      deltaReason: "no-prior-data",
      goodDirection,
    };
  }
  if (unit !== "count" && priorVolume === 0) {
    return {
      value,
      delta: null,
      deltaKind,
      unit,
      deltaReason: "no-prior-data",
      goodDirection,
    };
  }
  return {
    value,
    delta: value - prior,
    deltaKind,
    unit,
    goodDirection,
  };
}

export function entityTopicSupport(
  entityDistinct: number,
  categoryDistinct: number,
): boolean {
  return entityDistinct >= 30 && categoryDistinct >= 100;
}

export function twoSidedSupport(a: number, b: number): boolean {
  return a >= 30 && b >= 30;
}
