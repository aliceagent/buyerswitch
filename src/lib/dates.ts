export const VISIBLE_FROM = "2019-01-01";
export const VISIBLE_TO = "2021-10-31";
export const HISTORY_FROM = "2016-01-01";
export const HISTORY_TO = "2018-12-31";
export const NOW = "2021-10-31";
export const DATASET_VERSION = "bs-v2-2021";
export const SCHEMA_VERSION = 2;
export const SEED = "buyerswitch-v2";
export const FORMULA_VERSION = "radar-v2";

export function parseUtc(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function formatUtc(ms: number): string {
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(iso: string, days: number): string {
  return formatUtc(parseUtc(iso) + days * 86400000);
}

export function inclusiveDayCount(from: string, to: string): number {
  return Math.floor((parseUtc(to) - parseUtc(from)) / 86400000) + 1;
}

export function priorWindow(from: string, to: string): { from: string; to: string } {
  const d = inclusiveDayCount(from, to);
  return { from: addDays(from, -d), to: addDays(from, -1) };
}

export function clampDate(iso: string, min: string, max: string): string {
  if (parseUtc(iso) < parseUtc(min)) return min;
  if (parseUtc(iso) > parseUtc(max)) return max;
  return iso;
}

export function mondayOf(iso: string): string {
  const ms = parseUtc(iso);
  const day = new Date(ms).getUTCDay();
  const offset = day === 0 ? -6 : 1 - day;
  return formatUtc(ms + offset * 86400000);
}

export function monthStart(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

export function yearStart(iso: string): string {
  return `${iso.slice(0, 4)}-01-01`;
}

export function dateInRange(iso: string, from: string, to: string): boolean {
  const t = parseUtc(iso);
  return t >= parseUtc(from) && t <= parseUtc(to);
}

export function enumerateDays(from: string, to: string): string[] {
  const out: string[] = [];
  let cur = from;
  while (parseUtc(cur) <= parseUtc(to)) {
    out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
}
