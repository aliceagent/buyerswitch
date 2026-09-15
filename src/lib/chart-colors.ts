export interface SentimentBuckets {
  avg: number;
  b1: number;
  b4: number;
  ranges: [string, string, string, string, string];
}

export function sentimentBuckets(avgInput: number): SentimentBuckets {
  const avg = Math.round(avgInput);
  const b1 = Math.round(avg * 0.5);
  const b4 = avg + Math.floor((100 - avg) * 0.55);
  return {
    avg,
    b1,
    b4,
    ranges: [
      `0–${b1}`,
      `${b1 + 1}–${avg - 1}`,
      `${avg}`,
      `${avg + 1}–${b4}`,
      `${b4 + 1}–100`,
    ],
  };
}

export function sentimentBucket(value: number, avgInput: number, absolute = false): 1 | 2 | 3 | 4 | 5 {
  if (absolute) {
    if (value < 40) return 1;
    if (value < 50) return 2;
    if (value < 60) return 3;
    if (value < 75) return 4;
    return 5;
  }
  const avg = Math.round(avgInput);
  const b1 = Math.round(avg * 0.5);
  const b4 = avg + Math.floor((100 - avg) * 0.55);
  if (value <= b1) return 1;
  if (value <= avg - 1) return 2;
  if (value === avg) return 3;
  if (value <= b4) return 4;
  return 5;
}

export const SENTIMENT_COLORS_LIGHT = {
  1: "#8F2521",
  2: "#E0714B",
  3: "#DCDCD8",
  4: "#4D9FC0",
  5: "#10495E",
} as const;

export const SENTIMENT_COLORS_DARK = {
  1: "#F4826D",
  2: "#A03D2B",
  3: "#3A4145",
  4: "#2F7F9B",
  5: "#68D0EF",
} as const;

export const ENTITY_COLORS_LIGHT = ["#009CBD", "#EB6834", "#7B5EA7", "#1BAF7A", "#EDA100"] as const;
export const ENTITY_COLORS_DARK = ["#3FB8D6", "#F07A45", "#9B85D6", "#2FC98F", "#E0A92A"] as const;
export const INDUSTRY_COLOR = "#003349";
export const STAR_RAMP = ["#4FBEDB", "#00A2C7", "#007C99", "#00566B", "#00303F"] as const;
export const SEVEN_RAMP = ["#002C3A", "#004356", "#005A72", "#00718E", "#0088AA", "#12A0C6", "#4FBEDB"] as const;

export const CHART_CHROME = {
  surface: "#FFFFFF",
  ink: "#212322",
  muted: "#8A908E",
  grid: "#EDEFEE",
  baseline: "#C5C6C7",
} as const;
